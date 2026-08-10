import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Product,
  ProductInput,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { User } from "../libs/types/user";
import OrderModel from "../schema/Order.model";
import UserService from "./User.service";
import OrderItemModel from "../schema/OrderItem.model";
import { Order, OrderInquiry, OrderItemInput } from "../libs/types/order";

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
    const userId = shapeIntoMongooseObjectId(user._id);
    console.log("input:", input);
    const amount = input.reduce((accumlator: number, item: OrderItemInput) => {
      return accumlator + item.itemPrice * item.itemSubtotal;
    }, 0);
    const delivery = amount < 100 ? 5 : 0;
    console.log("values:", amount, delivery);
    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        userId: userId,
      });

      const orderId = newOrder._id;
      console.log("OrderId:", newOrder._id);

      // TODO: create order items
      await this.recordOrderItem(orderId, input);
      return newOrder;
    } catch (err) {
      console.log("Error, model: create Order:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordOrderItem(
    orderId: Object,
    input: OrderItemInput[],
  ): Promise<void> {
    const promisedList = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeIntoMongooseObjectId(item.productId);
      await this.orderItemModel.create(item);
      return "INSERTED";
    });
    // await Promise.all(promisedList);
    // console.log("promisedList:", promisedList);
    const orderItemSatate = await Promise.all(promisedList);
    console.log("OrderItemState:", orderItemSatate);
  }

  public async getMyOrders(
    user: User,
    inquiry: OrderInquiry,
  ): Promise<Order[]> {
    const userId = shapeIntoMongooseObjectId(user._id);
    const matches = { userId: userId, orderStatus: inquiry.orderStatus };

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
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async getAllOrders(): Promise<Order[]> {
    const result = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result as unknown as Order[];
  }
}

export default OrderService;
