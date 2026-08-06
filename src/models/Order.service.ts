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
import { Order, OrderItemInput } from "../libs/types/order";

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
  recordOrderItem(orderId: any, input: OrderItemInput[]) {
    throw new Error("Method not implemented.");
  }
}

export default OrderService;
