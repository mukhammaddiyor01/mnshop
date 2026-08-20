import {
  Payment,
  PreparedPayment,
  PreparePaymentInput,
  ConfirmPaymentInput,
  MockConfirmPaymentInput,
  TossPaymentResult,
} from "../libs/types/payment";
import {
  PaymentMethod,
  PaymentProvider,
  TossPaymentStatus,
} from "../libs/enums/payment.enum";
import { PaymentStatus } from "../libs/enums/order.enum";
import { User } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import PaymentModel from "../schema/Payment.model";
import OrderService from "./Order.service";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { randomUUID } from "crypto";

class PaymentService {
  private readonly paymentModel;
  private readonly orderService;

  constructor() {
    this.paymentModel = PaymentModel;
    this.orderService = new OrderService();
  }

  private getTestSecretKey(): string {
    const secretKey = String(process.env.TOSS_SECRET_KEY || "");

    if (!secretKey.startsWith("") || secretKey.length <= 20) {
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG,
      );
    }

    return secretKey;
  }

  private getTestClientKey(): string {
    const clientKey = String(process.env.TOSS_CLIENT_KEY || "");

    if (!clientKey.startsWith("test_ck_") || clientKey.length <= 20) {
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG,
      );
    }

    return clientKey;
  }

  private getFrontendUrl(): string {
    return String(process.env.FRONTEND_URL || "http://localhost:1214").replace(
      /\/$/,
      "",
    );
  }

  private assertMockPaymentEnabled(): void {
    if (!this.isMockPaymentEnabled()) {
      throw new Errors(HttpCode.FORBIDDED, Message.NOT_ALLOWED);
    }
  }

  private isMockPaymentEnabled(): boolean {
    return (
      process.env.NODE_ENV !== "production" &&
      process.env.TOSS_MOCK_MODE === "true"
    );
  }

  public async preparePayment(
    user: User,
    input: PreparePaymentInput,
  ): Promise<PreparedPayment> {
    try {
      if (user.userType !== UserType.BUYER) {
        throw new Errors(HttpCode.FORBIDDED, Message.NOT_ALLOWED);
      }

      const mockMode = this.isMockPaymentEnabled();
      const clientKey = mockMode ? undefined : this.getTestClientKey();

      const order = await this.orderService.getPayableOrder(
        user,
        input.orderId,
      );

      const amount = Math.round(Number(order.orderTotal));

      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
      }

      const providerOrderId = `MN_${order._id.toString()}`;

      const method = input.method || PaymentMethod.CARD;

      if (!Object.values(PaymentMethod).includes(method)) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
      }

      const paymentRecord = await this.paymentModel
        .findOneAndUpdate(
          {
            orderId: order._id,
          },
          {
            $set: {
              method,
              amount,
              currency: "KRW",
              paymentStatus: PaymentStatus.PENDING,
            },

            $setOnInsert: {
              orderId: order._id,
              buyerId: order.buyerId,

              customerKey: `customer_${randomUUID()}`,

              provider: PaymentProvider.TOSS_PAYMENTS,

              providerOrderId,
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          },
        )
        .exec();

      if (!paymentRecord) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
      }

      // Oldingi FAILED urinish bo‘lsa qayta PENDING.
      if (order.orderPaymentStatus === PaymentStatus.FAILED) {
        await this.orderService.updatePaymentStatus(
          order._id.toString(),
          PaymentStatus.PENDING,
        );
      }

      const frontendUrl = this.getFrontendUrl();

      return {
        orderId: providerOrderId,
        amount,
        currency: "KRW",
        clientKey,
        customerKey: paymentRecord.customerKey,
        orderName: `MNShop order ${order.orderTrackingNumber}`,

        successUrl: `${frontendUrl}/payment/success`,

        failUrl: `${frontendUrl}/payment/fail`,
        mockMode,
      };
    } catch (err) {
      console.log("Error, PaymentService.preparePayment:", err);

      if (err instanceof Errors) {
        throw err;
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async confirmPayment(
    user: User,
    input: ConfirmPaymentInput,
  ): Promise<Payment> {
    try {
      if (user.userType !== UserType.BUYER) {
        throw new Errors(HttpCode.FORBIDDED, Message.NOT_ALLOWED);
      }

      if (
        !input.paymentKey ||
        !input.orderId ||
        !Number.isFinite(Number(input.amount))
      ) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
      }

      const payment = await this.paymentModel
        .findOne({
          providerOrderId: input.orderId,
          buyerId: shapeIntoMongooseObjectId(user._id),
        })
        .exec();

      if (!payment) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      // Bir xil confirm qayta yuborilsa.
      if (
        payment.paymentStatus === PaymentStatus.PAID &&
        payment.paymentKey === input.paymentKey
      ) {
        return payment;
      }

      const requestedAmount = Math.round(Number(input.amount));

      if (requestedAmount !== payment.amount) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.NOT_ALLOWED);
      }

      // Order ownership va DB total qayta tekshiriladi.
      const order = await this.orderService.getPayableOrder(
        user,
        payment.orderId.toString(),
      );

      if (Math.round(Number(order.orderTotal)) !== payment.amount) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.NOT_ALLOWED);
      }

      const tossResult = await this.requestTossConfirmation({
        paymentKey: input.paymentKey,
        orderId: payment.providerOrderId,
        amount: payment.amount,
      });

      if (tossResult.status !== TossPaymentStatus.DONE) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
      }

      if (
        Number(tossResult.totalAmount) !== payment.amount ||
        tossResult.orderId !== payment.providerOrderId
      ) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.NOT_ALLOWED);
      }

      const updatedPayment = await this.paymentModel
        .findOneAndUpdate(
          {
            _id: payment._id,
            paymentStatus: {
              $in: [PaymentStatus.PENDING, PaymentStatus.FAILED],
            },
          },
          {
            $set: {
              paymentKey: tossResult.paymentKey,
              providerStatus: tossResult.status,
              paymentStatus: PaymentStatus.PAID,
              approvedAt: tossResult.approvedAt
                ? new Date(tossResult.approvedAt)
                : new Date(),
              failureCode: undefined,
              failureMessage: undefined,
            },
          },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec();

      if (!updatedPayment) {
        throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
      }

      await this.orderService.updatePaymentStatus(
        payment.orderId.toString(),
        PaymentStatus.PAID,
      );

      return updatedPayment;
    } catch (err) {
      console.log("Error, PaymentService.confirmPayment:", err);

      if (err instanceof Errors) {
        throw err;
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
  }

  public async mockConfirmPayment(
    user: User,
    input: MockConfirmPaymentInput,
  ): Promise<Payment> {
    try {
      this.assertMockPaymentEnabled();

      if (user.userType !== UserType.BUYER) {
        throw new Errors(HttpCode.FORBIDDED, Message.NOT_ALLOWED);
      }

      if (!input.orderId) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
      }

      const payment = await this.paymentModel
        .findOne({
          providerOrderId: input.orderId,
          buyerId: shapeIntoMongooseObjectId(user._id),
        })
        .exec();

      if (!payment) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      if (payment.paymentStatus === PaymentStatus.PAID) {
        return payment as unknown as Payment;
      }

      const order = await this.orderService.getPayableOrder(
        user,
        payment.orderId.toString(),
      );

      if (Math.round(Number(order.orderTotal)) !== payment.amount) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.NOT_ALLOWED);
      }

      const updatedPayment = await this.paymentModel
        .findOneAndUpdate(
          {
            _id: payment._id,
            buyerId: shapeIntoMongooseObjectId(user._id),
            paymentStatus: {
              $in: [PaymentStatus.PENDING, PaymentStatus.FAILED],
            },
          },
          {
            $set: {
              paymentKey: `mock_${payment.providerOrderId}`,
              providerStatus: TossPaymentStatus.DONE,
              paymentStatus: PaymentStatus.PAID,
              approvedAt: new Date(),
              failureCode: undefined,
              failureMessage: undefined,
            },
          },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec();

      if (!updatedPayment) {
        throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
      }

      await this.orderService.updatePaymentStatus(
        payment.orderId.toString(),
        PaymentStatus.PAID,
      );

      return updatedPayment as unknown as Payment;
    } catch (err) {
      console.log("Error, PaymentService.mockConfirmPayment:", err);

      if (err instanceof Errors) {
        throw err;
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
  }

  public async getMyPayments(user: User): Promise<Payment[]> {
    try {
      if (user.userType !== UserType.BUYER) {
        throw new Errors(HttpCode.FORBIDDED, Message.NOT_ALLOWED);
      }

      return await this.paymentModel
        .find({ buyerId: shapeIntoMongooseObjectId(user._id) })
        .sort({ updatedAt: -1 })
        .exec() as unknown as Payment[];
    } catch (err) {
      console.log("Error, PaymentService.getMyPayments:", err);
      if (err instanceof Errors) throw err;
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.SOMETHING_WENT_WRONG);
    }
  }

  private async requestTossConfirmation(
    input: ConfirmPaymentInput,
  ): Promise<TossPaymentResult> {
    const secretKey = this.getTestSecretKey();

    const authorization = Buffer.from(`${secretKey}:`).toString("base64");

    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${authorization}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US",

          // Test request takrorlansa,
          // bir xil natija qaytaradi.
          "Idempotency-Key": `confirm-${input.orderId}`,
        },

        body: JSON.stringify({
          paymentKey: input.paymentKey,
          orderId: input.orderId,
          amount: Number(input.amount),
        }),
      },
    );

    const result = (await response.json()) as TossPaymentResult & {
      code?: string;
      message?: string;
    };

    if (!response.ok) {
      console.log("Toss confirmation failed:", result);

      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }

    return result;
  }
}

export default PaymentService;
