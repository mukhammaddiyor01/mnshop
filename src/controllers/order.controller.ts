import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { AdminRequest, ExtendedRequest, UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import UserService from "../models/User.service";
import { LoginInput } from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors";
import SellerService from "../models/Seller.service";
import OrderService from "../models/Order.service";

const orderService = new OrderService();

const orderController: T = {};
orderController.craeteOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("createOrder");

    const result = await orderService.createOrder(req.user, req.body);
    res.status(HttpCode.CREATED).json(result);
  } catch (err) {}
};
