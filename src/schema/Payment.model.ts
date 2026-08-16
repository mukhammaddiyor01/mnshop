import mongoose, { Schema } from "mongoose";
import { Payment } from "../libs/types/payment";
import {
  PaymentMethod,
  PaymentProvider,
  TossPaymentStatus,
} from "../libs/enums/payment.enum";
import { PaymentStatus } from "../libs/enums/order.enum";

const paymentSchema = new Schema<Payment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "Order",
    },

    buyerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },

    customerKey: {
      type: String,
      required: true,
    },

    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      default: PaymentProvider.TOSS_PAYMENTS,
      required: true,
    },

    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.CARD,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "KRW",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },

    providerStatus: {
      type: String,
      enum: Object.values(TossPaymentStatus),
      required: false,
    },

    paymentKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    providerOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    failureCode: {
      type: String,
    },

    failureMessage: {
      type: String,
    },

    approvedAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "payments",
  },
);

export default mongoose.model<Payment>("Payment", paymentSchema);
