import { Types } from "mongoose";
import {
  PaymentMethod,
  PaymentProvider,
  TossPaymentStatus,
} from "../enums/payment.enum";
import { PaymentStatus } from "../enums/order.enum";

export interface Payment {
  _id: Types.ObjectId;

  orderId: Types.ObjectId;
  buyerId: Types.ObjectId;

  customerKey: string;

  provider: PaymentProvider;
  method: PaymentMethod;

  amount: number;
  currency: string;

  paymentStatus: PaymentStatus;
  providerStatus?: TossPaymentStatus;

  paymentKey?: string;
  providerOrderId: string;

  failureCode?: string;
  failureMessage?: string;

  approvedAt?: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface PreparePaymentInput {
  orderId: string;
  method?: PaymentMethod;
}

export interface ConfirmPaymentInput {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface MockConfirmPaymentInput {
  orderId: string;
}

export interface TossPaymentResult {
  paymentKey: string;
  orderId: string;
  status: TossPaymentStatus;
  method?: string;
  totalAmount: number;
  balanceAmount?: number;
  currency: string;
  approvedAt?: string;
  requestedAt?: string;

  failure?: {
    code: string;
    message: string;
  };
}

export interface PreparedPayment {
  orderId: string;
  amount: number;
  currency: string;
  clientKey?: string;
  customerKey: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  mockMode: boolean;
}
