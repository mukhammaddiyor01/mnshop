import { Types } from "mongoose";
import { T } from "./common";
import {
  OrderStatus,
  PaymentStatus,
  DeliveryStatus,
} from "../enums/order.enum";

import { PaymentMethod, PaymentProvider } from "../enums/payment.enum";

export interface Order {
  _id: Types.ObjectId;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;

  orderItems: Array<T>;
  orderAddress: string;
  orderSubtotal: number;
  orderShippingFee: number;
  orderTotal: number;

  orderStatus: OrderStatus;
  orderPaymentStatus: PaymentStatus;
  orderDeliveryStatus: DeliveryStatus;

  orderPaymentProvider: PaymentProvider;
  orderPaymentMethod: PaymentMethod;

  orderTrackingNumber: string;
  orderEstimatedDelivery: Date;

  updatedAt: Date;
  createdAt: Date;
}

export interface OrderItem {
  _id: Types.ObjectId;
  buyerId: Types.ObjectId;
  productId: Types.ObjectId;
  memberId: Types.ObjectId;
  orderItems: Array<T>;
  orderSubtotal: number;
  orderShippingFree: number;
  orderTotal: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface OrderItemInput {
  orderId: Object;
  itemSubtotal: number;
  orderShippingFee: number;
  itemPrice: number;
  buyerId: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus: OrderStatus;
}

export interface OrderUpdateInput {
  orderId: string;
  orderStatus: OrderStatus;
}
