import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { AdminRequest, ExtendedRequest, UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import UserService from "../models/User.service";
import { LoginInput } from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors";
import SellerService from "../models/Seller.service";
import OrderService from "../models/Order.service";
import { OrderInquiry, OrderUpdateInput } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enum";

const orderService = new OrderService();

const orderController: T = {};
orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("createOrder");

    const result = await orderService.createOrder(req.user, req.body);
    return res.status(HttpCode.CREATED).json({ data: result });
  } catch (err) {
    console.log("ERROR, getProduct :", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else return res.status(Errors.standard.code).json(Errors.standard);
  }
};

orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, orderStatus } = req.query;

    const inquiry: OrderInquiry = {
      page: Number(page),
      limit: Number(limit),
      orderStatus: orderStatus as OrderStatus,
    };

    const result = await orderService.getMyOrders(req.user, inquiry);

    // app.use("/admin", routerAdmin) sababli baseUrl === "/admin"
    if (req.baseUrl === "/admin") {
      return res.render("orders", { orders: result });
    }

    if (req.path.startsWith("/seller")) {
      return res.status(HttpCode.OK).json({
        source: "seller",
        data: result,
      });
    }

    return res.status(HttpCode.OK).json({
      source: "buyer",
      data: result,
    });
  } catch (error) {
    // Buyer va seller API uchun JSON
    console.log("Error, getMyOrders:", error);

    const message =
      error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;

    // Admin sahifasida xatoni HTML ko‘rinishda chiqarish
    if (req.baseUrl === "/admin") {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).render("orders", {
        orders: [],
        error: message,
      });
    }

    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message,
    });
  }
};

orderController.updateOrder = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("updateOrder");
    const input: OrderUpdateInput = req.body;
    const result = await orderService.updateOrder(req.user, {
      ...req.body,
      orderId: req.params.id,
    });

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("Error, updateOrder:", err);
  }
};

orderController.updateDeliveryStatus = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("updateDeliveryStatus");

    const result = await orderService.updateDeliveryStatus(req.user, {
      orderId: req.params.id,
      deliveryStatus: req.body.deliveryStatus,
      trackingNumber: req.body.trackingNumber,
    });

    return res.status(HttpCode.OK).json({
      data: result,
    });
  } catch (err) {
    console.log("Error, updateDeliveryStatus:", err);

    if (err instanceof Errors) {
      return res.status(err.code).json(err);
    }

    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default orderController;
