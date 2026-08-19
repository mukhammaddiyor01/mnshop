import { Response } from "express";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/user";
import {
  PreparePaymentInput,
  ConfirmPaymentInput,
} from "../libs/types/payment";
import Errors, { HttpCode } from "../libs/Errors";
import PaymentService from "../models/Payment.service";

const paymentService = new PaymentService();

const paymentController: T = {};

paymentController.preparePayment = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("preparePayment");

    const input: PreparePaymentInput = {
      orderId: req.body.orderId,
      method: req.body.method,
    };

    const result = await paymentService.preparePayment(req.user, input);

    return res.status(HttpCode.CREATED).json({
      data: result,
    });
  } catch (err) {
    console.log("Error, preparePayment:", err);

    if (err instanceof Errors) {
      return res.status(err.code).json({
        message: err.message,
      });
    }

    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

paymentController.confirmPayment = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("confirmPayment");

    const input: ConfirmPaymentInput = {
      paymentKey: req.body.paymentKey,
      orderId: req.body.orderId,
      amount: Number(req.body.amount),
    };

    const result = await paymentService.confirmPayment(req.user, input);

    return res.status(HttpCode.OK).json({
      data: result,
    });
  } catch (err) {
    console.log("Error, confirmPayment:", err);

    if (err instanceof Errors) {
      return res.status(err.code).json({
        message: err.message,
      });
    }

    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

paymentController.getMyPayments = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    const result = await paymentService.getMyPayments(req.user);
    return res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    if (err instanceof Errors) {
      return res.status(err.code).json({ message: err.message });
    }

    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default paymentController;
