import mongoose, { Schema } from "mongoose";
import {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
} from "../libs/enums/order.enum";

import { PaymentMethod, PaymentProvider } from "../libs/enums/payment.enum";

const orderSchema = new Schema(
  {
    orderItems: {
      type: Array,
      required: true,
    },

    orderAddress: {
      type: String,
      required: true,
    },

    orderTotal: {
      type: Number,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.PENDING,
    },

    orderDeliveryStatus: {
      type: String,
      enum: DeliveryStatus,
      default: DeliveryStatus.PENDING,
    },

    orderPaymentStatus: {
      type: String,
      enum: PaymentStatus,
      default: PaymentStatus.PENDING,
    },

    orderPaymentProvider: {
      type: String,
      enum: PaymentProvider,
      default: PaymentProvider.TOSS_PAYMENTS,
    },

    orderPaymentMethod: {
      type: String,
      enum: PaymentMethod,
      default: PaymentMethod.CARD,
    },

    orderTrackingNumber: {
      type: String,
      required: true,
    },

    buyerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },

    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "seller",
    },
  },
  { timestamps: true, collection: "orders" },
);

export default mongoose.model("Order", orderSchema);
