import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { AdminRequest, UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import SellerService from "../models/Seller.service";
import { LoginInput } from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { randomBytes } from "crypto";
import { SellerInput, SellerLoginInput } from "../libs/types/seller";
import { ProductStatus } from "../libs/enums/product.enum";
import { OrderStatus, PaymentStatus } from "../libs/enums/order.enum";
import UserService from "../models/User.service";
import AnalyticsService from "../models/Analytics.service";
import SettingsService from "../models/Settings.service";
import ProductService from "../models/Product.service";
import OrderService from "../models/Order.service";

const sellerService = new SellerService();
const settingsService = new SettingsService();
const analyticsService = new AnalyticsService();
const userService = new UserService();
const productService = new ProductService();
const orderService = new OrderService();

const sellerController: T = {};

const createUserToken = (): string => randomBytes(48).toString("hex");

sellerController.signup = async (req: Request, res: Response) => {
  try {
    console.log("seller signup");
    console.log("body:", req.body);

    const input: SellerInput = req.body;
    const result = await sellerService.signup(input);

    res.json({ seller: result });
  } catch (err) {
    console.log("Error, seller signup:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

sellerController.login = async (req: Request, res: Response) => {
  try {
    console.log("seller login");
    console.log("body:", req.body);

    const input: SellerLoginInput = req.body;
    const result = await sellerService.login(input);

    res.json({ seller: result });
  } catch (err) {
    console.log("Error, seller login:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

sellerController.login = async (req: Request, res: Response) => {
  try {
    console.log("seller login");

    const input: SellerLoginInput = req.body;
    const result = await sellerService.login(input);

    const sessionInstance = req.session as T;
    sessionInstance.user = result;

    req.session.save(function () {
      res.json({ seller: result });
    });
  } catch (err) {
    console.log("Error, seller login:", err);

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

sellerController.verifySeller = (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.session?.user?.userType === UserType.SELLER) {
    req.user = req.session.user;
    next();
  } else {
    const message = Message.NOT_AUTHENTICATED;
    res.status(HttpCode.UNAUTHORIZED).json({ message });
  }
};

export default sellerController;
