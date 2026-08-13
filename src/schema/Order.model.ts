import mongoose, { Schema } from "mongoose";
import {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
} from "../libs/enums/order.enum";

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

    orderPaymentStatus: {
      type: String,
      enum: PaymentStatus,
      defult: PaymentStatus.PENDING,
    },

    orderDeliveryStatus: {
      type: String,
      enum: DeliveryStatus,
      default: DeliveryStatus.PENDING,
    },

    orderPaymentMethod: {
      type: String,
      enum: PaymentStatus,
      default: PaymentStatus.PENDING,
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
  },
  { timestamps: true, collection: "orders" },
);

export default mongoose.model("Order", orderSchema);
