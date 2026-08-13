import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { User } from "../libs/types/user";
import OrderModel from "../schema/Order.model";
import UserService from "./User.service";
import OrderItemModel from "../schema/OrderItem.model";
import {
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import { UserType } from "../libs/enums/user.enum";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly userService;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.userService = new UserService();
  }

  public async createOrder(
    user: User,
    input: OrderItemInput[],
  ): Promise<Order> {
    const buyerId = shapeIntoMongooseObjectId(user._id);

    const amount = input.reduce((total: number, item: OrderItemInput) => {
      return total + item.itemPrice * item.itemSubtotal;
    }, 0);

    const delivery = amount < 100000 ? 5000 : 0;

    console.log("input:", input);
    console.log("values:", amount, delivery);

    try {
      const newOrder = await this.orderModel.create({
        buyerId,
        orderItems: input,
        orderAddress: user.userAddress || "Address not provided",
        orderTotal: amount + delivery,
        orderTrackingNumber: `MN-${Date.now()}`,
      });

      await this.recordOrderItem(newOrder._id, input);

      return newOrder as unknown as Order;
    } catch (err) {
      console.log("Error, model: createOrder:", err);

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
