import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { User } from "../libs/types/user";
import OrderModel from "../schema/Order.model";
import UserService from "./User.service";
import ProductService from "./Product.service";
import OrderItemModel from "../schema/OrderItem.model";
import {
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import { UserType } from "../libs/enums/user.enum";
import {
  DeliveryStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../libs/enums/order.enum";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly userService;
  private readonly productService;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.userService = new UserService();
    this.productService = new ProductService();
  }

  public async createOrder(
    user: User,
    input: OrderItemInput[],
  ): Promise<Order> {
    try {
      if (!Array.isArray(input) || input.length === 0) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
      }

      const buyerId = shapeIntoMongooseObjectId(user._id);

      const productIds = input.map((item) => item.productId.toString());

      const products = await this.productService.getProductsByIds(productIds);

      const sellerIds = new Set(
        products.map((product) => product.sellerId.toString()),
      );

      // MVP: bitta order faqat bitta sellerga tegishli.
      if (sellerIds.size !== 1) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
      }

      const sellerId = shapeIntoMongooseObjectId(products[0].sellerId);

      const normalizedItems = input.map((item) => {
        const product = products.find(
          (product) => product._id.toString() === item.productId.toString(),
        );

        if (!product) {
          throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        }

        const quantity = Number(item.itemSubtotal);

        if (
          !Number.isInteger(quantity) ||
          quantity <= 0 ||
          quantity > product.productLeftCount
        ) {
          throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }

        // Narx frontenddan emas, DB’dan olinadi.
        const price = product.productDiscountPrice ?? product.productPrice;

        return {
          ...item,
          itemPrice: price,
          itemSubtotal: quantity,
        };
      });

      const amount = normalizedItems.reduce(
        (total, item) => total + item.itemPrice * item.itemSubtotal,
        0,
      );

      const deliveryFee = amount < 100000 ? 5000 : 0;

      const paymentStatus = PaymentStatus.PENDING;
      const deliveryStatus = DeliveryStatus.PENDING;

      const orderStatus = this.deriveOrderStatus(paymentStatus, deliveryStatus);

      const newOrder = await this.orderModel.create({
        buyerId,
        sellerId,
        orderItems: normalizedItems,

        orderAddress: user.userAddress || "Address not provided",

        orderTotal: amount + deliveryFee,
        orderPaymentStatus: paymentStatus,
        orderDeliveryStatus: deliveryStatus,
        orderStatus,
        orderPaymentMethod: PaymentMethod.STRIPE,
        orderTrackingNumber: `MN-${Date.now()}`,
      });

      await this.recordOrderItem(newOrder._id, normalizedItems);

      return newOrder as unknown as Order;
    } catch (err) {
      console.log("Error, OrderService.createOrder:", err);

      if (err instanceof Errors) {
        throw err;
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordOrderItem(
    orderId: Object,
    input: OrderItemInput[],
  ): Promise<void> {
    await Promise.all(
      input.map(async (item) => {
        await this.orderItemModel.create({
          orderId,
          productId: shapeIntoMongooseObjectId(item.productId),
          itemPrice: item.itemPrice,
          itemQuantity: item.itemSubtotal,
        });
      }),
    );
  }

  public async getMyOrders(
    user: User,
    inquiry: OrderInquiry,
  ): Promise<Order[]> {
    if (user.userType === UserType.ADMIN) {
      return this.getAllOrders();
    }

    const buyerId = shapeIntoMongooseObjectId(user._id);
    const matches: Record<string, unknown> = { buyerId };

    if (inquiry.orderStatus) {
      matches.orderStatus = inquiry.orderStatus;
    }

    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productData",
          },
        },
      ])
      .exec();

    return result as Order[];
  }

  private deriveOrderStatus(
    paymentStatus: PaymentStatus,
    deliveryStatus: DeliveryStatus,
  ): OrderStatus {
    if (paymentStatus === PaymentStatus.REFUNDED) {
      return OrderStatus.CANCELLED;
    }

    // FAILED bo‘lsa buyer qayta to‘lashi mumkin.
    if (paymentStatus !== PaymentStatus.PAID) {
      return OrderStatus.PENDING;
    }

    switch (deliveryStatus) {
      case DeliveryStatus.DELIVERED:
        return OrderStatus.DELIVERED;

      case DeliveryStatus.SHIPPED:
        return OrderStatus.SHIPPED;

      case DeliveryStatus.PROCESSING:
      case DeliveryStatus.PENDING:
        return OrderStatus.PROCESSING;

      case DeliveryStatus.FAILED:
        return OrderStatus.PROCESSING;

      default:
        return OrderStatus.PROCESSING;
    }
  }

  public async updateDeliveryStatus(
    seller: User,
    input: {
      orderId: string;
      deliveryStatus: DeliveryStatus;
      trackingNumber?: string;
    },
  ): Promise<Order> {
    try {
      if (seller.userType !== UserType.SELLER) {
        throw new Errors(HttpCode.FORBIDDED, Message.NOT_ALLOWED);
      }

      const orderId = shapeIntoMongooseObjectId(input.orderId);

      const sellerId = shapeIntoMongooseObjectId(seller._id);

      const order = await this.orderModel
        .findOne({
          _id: orderId,
          sellerId,
        })
        .exec();

      if (!order) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      if (order.orderPaymentStatus !== PaymentStatus.PAID) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.NOT_ALLOWED);
      }

      this.validateDeliveryTransition(
        order.orderDeliveryStatus as DeliveryStatus,
        input.deliveryStatus,
      );

      if (
        input.deliveryStatus === DeliveryStatus.SHIPPED &&
        !input.trackingNumber
      ) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
      }

      const orderStatus = this.deriveOrderStatus(
        order.orderPaymentStatus as PaymentStatus,
        input.deliveryStatus,
      );

      const updateData: Record<string, unknown> = {
        orderDeliveryStatus: input.deliveryStatus,
        orderStatus,
      };

      if (input.trackingNumber) {
        updateData.orderTrackingNumber = input.trackingNumber;
      }

      const currentDeliveryStatus = order.orderDeliveryStatus as DeliveryStatus;

      const result = await this.orderModel
        .findOneAndUpdate(
          {
            _id: orderId,
            sellerId,
            orderPaymentStatus: PaymentStatus.PAID,
            orderDeliveryStatus: currentDeliveryStatus,
          },
          {
            $set: updateData,
          },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec();

      if (!result) {
        throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
      }

      return result as unknown as Order;
    } catch (err) {
      console.log("Error, OrderService.updateDeliveryStatus:", err);

      if (err instanceof Errors) {
        throw err;
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
  }

  private validateDeliveryTransition(
    currentStatus: DeliveryStatus,
    nextStatus: DeliveryStatus,
  ): void {
    if (!Object.values(DeliveryStatus).includes(nextStatus)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
    const transitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      [DeliveryStatus.PENDING]: [DeliveryStatus.PROCESSING],
      [DeliveryStatus.PROCESSING]: [
        DeliveryStatus.SHIPPED,
        DeliveryStatus.FAILED,
      ],
      [DeliveryStatus.SHIPPED]: [
        DeliveryStatus.DELIVERED,
        DeliveryStatus.FAILED,
      ],
      [DeliveryStatus.DELIVERED]: [],
      [DeliveryStatus.FAILED]: [DeliveryStatus.PROCESSING],
    };

    if (
      !transitions[currentStatus] ||
      !transitions[currentStatus].includes(nextStatus)
    ) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
  }

  public async getAllOrders(): Promise<Order[]> {
    const result = await this.orderModel
      .aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "buyerId",
            foreignField: "_id",
            as: "buyerData",
          },
        },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productData",
          },
        },
        {
          $lookup: {
            from: "sellers",
            localField: "productData.sellerId",
            foreignField: "_id",
            as: "sellerData",
          },
        },
      ])
      .exec();

    return result as Order[];
  }

  public async updateOrder(
    user: User,
    input: OrderUpdateInput,
  ): Promise<Order> {
    const orderId = shapeIntoMongooseObjectId(input.orderId);

    let filter: Record<string, unknown>;

    if (user.userType === UserType.ADMIN) {
      filter = { _id: orderId };
    } else if (user.userType === UserType.SELLER) {
      filter = {
        _id: orderId,
        sellerId: shapeIntoMongooseObjectId(user._id),
      };
    } else {
      throw new Errors(HttpCode.FORBIDDED, Message.NOT_ALLOWED);
    }

    const result = await this.orderModel
      .findOneAndUpdate(
        filter,
        {
          $set: {
            orderStatus: input.orderStatus,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    }

    return result as unknown as Order;
  }
}

export default OrderService;
