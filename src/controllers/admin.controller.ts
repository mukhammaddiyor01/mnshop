import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { AdminRequest, UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import UserService from "../models/User.service";
import { LoginInput } from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors";
import SellerService from "../models/Seller.service";
import ProductService from "../models/Product.service";
import OrderService from "../models/Order.service";
import { SellerStatus } from "../libs/enums/seller.enum";
import { ProductStatus } from "../libs/enums/product.enum";
import { OrderStatus, PaymentStatus } from "../libs/enums/order.enum";
import AnalyticsService from "../models/Analytics.service";
import SettingsService from "../models/Settings.service";

const settingsService = new SettingsService();
const analyticsService = new AnalyticsService();
const userService = new UserService();
const sellerService = new SellerService();
const productService = new ProductService();
const orderService = new OrderService();

const adminController: T = {};

const renderAdminPage = (res: Response, view: string, data: T = {}) => {
  res.render(view, data);
};

adminController.goHome = (req: Request, res: Response) => {
  try {
    res.set("Cache-Control", "no-store");
    const sessionInstance = req.session as T;

    if (sessionInstance.user?.userType === UserType.ADMIN) {
      return res.redirect("/admin/overview");
    }

    res.render("home", { member: sessionInstance.user });
  } catch (err) {
    console.log("Error, goHome:", err);
    res.redirect("/admin/login");
  }
};

adminController.getOverview = async (req: Request, res: Response) => {
  try {
    const [users, sellers, products, orders] = await Promise.all([
      userService.getUsers(),
      sellerService.getSellers(),
      productService.getAllProducts(),
      orderService.getAllOrders(),
    ]);

    const now = new Date();
    const koreaToday = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const startOfToday = new Date(`${koreaToday}T00:00:00+09:00`);
    const endOfToday = new Date(`${koreaToday}T23:59:59.999+09:00`);

    const activeSellers = sellers.filter(
      (seller) => seller.sellerStatus === SellerStatus.ACTIVE,
    );
    const activeProducts = products.filter(
      (product) => product.productStatus !== ProductStatus.DELETE,
    );
    const pendingOrders = orders.filter(
      (order) => order.orderStatus === OrderStatus.PENDING,
    );
    const revenueToday = orders
      .filter(
        (order) =>
          new Date(order.createdAt) >= startOfToday &&
          new Date(order.createdAt) <= endOfToday &&
          order.orderPaymentStatus === PaymentStatus.PAID,
      )
      .reduce((total, order) => total + Number(order.orderTotal || 0), 0);

    const activities = [
      ...users.map((user) => ({
        title: `${user.userNick} joined as a buyer`,
        time: user.createdAt,
      })),
      ...sellers.map((seller) => ({
        title: `${seller.sellerNick} seller is ${String(seller.sellerStatus).toLowerCase()}`,
        time: seller.createdAt,
      })),
      ...orders.map((order) => ({
        title: `Order ${order.orderTrackingNumber || String(order._id).slice(-6)} placed`,
        time: order.createdAt,
      })),
    ]
      .sort(
        (first, second) =>
          new Date(second.time).getTime() - new Date(first.time).getTime(),
      )
      .slice(0, 4);

    renderAdminPage(res, "overview", {
      overview: {
        totalUsers: users.length,
        activeSellers: activeSellers.length,
        totalProducts: activeProducts.length,
        revenueToday,
        pendingOrders: pendingOrders.length,
        activities,
      },
    });
  } catch (err) {
    console.log("Error, getOverview:", err);
    renderAdminPage(res, "overview", {
      overview: {
        totalUsers: 0,
        activeSellers: 0,
        totalProducts: 0,
        revenueToday: 0,
        pendingOrders: 0,
        activities: [],
      },
    });
  }
};

adminController.getOrders = (req: Request, res: Response) => {
  renderAdminPage(res, "orders");
};

adminController.getMessages = (req: Request, res: Response) => {
  renderAdminPage(res, "messages");
};

adminController.processSignup = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processSignup");
    const file = req.file;

    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    const newUser: UserInput = req.body;
    newUser.userImage = file?.path;
    newUser.userType = UserType.ADMIN;

    const result = await userService.processSignup(newUser);

    req.session.user = result;
    req.session.save(function () {
      res.redirect("/admin/overview");
    });
  } catch (err) {
    console.log("Error, processSignup:", err);
    const message =
      err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/signup'); </script>`,
    );
  }
};

adminController.getSignup = (req: Request, res: Response) => {
  try {
    res.set("Cache-Control", "no-store");
    const sessionInstance = req.session as T;

    if (sessionInstance.user?.userType === UserType.ADMIN) {
      return res.redirect("/admin/overview");
    }

    res.render("signup");
  } catch (err) {
    console.log("Error, getSignUp:", err);
    res.redirect("/admin");
  }
};

adminController.getLogin = (req: Request, res: Response) => {
  try {
    res.set("Cache-Control", "no-store");
    const sessionInstance = req.session as T;

    if (sessionInstance.user?.userType === UserType.ADMIN) {
      return res.redirect("/admin/overview");
    }

    res.render("login");
  } catch (err) {
    console.log("Error, Login:", err);
    res.redirect("/admin");
  }
};

adminController.processLogin = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processLogin");

    const input: LoginInput = req.body;
    const result = await userService.processLogin(input);

    req.session.user = result;
    req.session.save(function () {
      res.redirect("/admin/overview");
    });
  } catch (err) {
    console.log("Error, processLogin:", err);
    const message =
      err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/login'); </script>`,
    );
  }
};

adminController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("processlogout");
    req.session.destroy(function () {
      res.redirect("/admin");
    });
  } catch (err) {
    console.log("Error, processLogin:", err);
    res.redirect("/admin");
  }
};

adminController.getUsers = async (req: Request, res: Response) => {
  try {
    console.log("getUsers");
    const [users, orders] = await Promise.all([
      userService.getUsers(),
      orderService.getAllOrders(),
    ]);

    const result = users.map((user) => {
      const userOrders = orders.filter(
        (order) => String(order.buyerId) === String(user._id),
      );
      const paidTotal = userOrders
        .filter(
          (order) => order.orderPaymentStatus === PaymentStatus.PAID,
        )
        .reduce((total, order) => total + Number(order.orderTotal || 0), 0);

      return {
        ...(typeof (user as T).toObject === "function"
          ? (user as T).toObject()
          : user),
        orderCount: userOrders.length,
        paidTotal,
      };
    });

    res.render("users", { users: result });
  } catch (err) {
    console.log("Error, getUsers:", err);
    res.render("users", { users: [] });
  }
};

adminController.updateChosenUser = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenUser");
    const result = await userService.updateChosenUser(req.body);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenUser:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// SELLERS

adminController.getSellers = async (req: Request, res: Response) => {
  try {
    console.log("getSellers");
    const [sellers, products, orders, settings] = await Promise.all([
      sellerService.getSellers(),
      productService.getAllProducts(),
      orderService.getAllOrders(),
      settingsService.getSettings(),
    ]);

    const result = sellers.map((seller) => {
      const sellerProducts = products.filter(
        (product) =>
          String(product.sellerId) === String(seller._id) &&
          product.productStatus !== ProductStatus.DELETE,
      );
      const paidOrders = orders.filter(
        (order) =>
          String(order.sellerId) === String(seller._id) &&
          order.orderPaymentStatus === PaymentStatus.PAID,
      );
      const revenue = paidOrders.reduce(
        (total, order) =>
          total +
          order.orderItems.reduce(
            (orderTotal: number, item: T) =>
              orderTotal +
              Number(item.itemPrice || 0) * Number(item.itemQuantity || 0),
            0,
          ),
        0,
      );
      const salesCount = paidOrders.reduce(
        (total, order) =>
          total +
          order.orderItems.reduce(
            (itemTotal: number, item: T) =>
              itemTotal + Number(item.itemQuantity || 0),
            0,
          ),
        0,
      );

      return {
        ...(typeof (seller as T).toObject === "function"
          ? (seller as T).toObject()
          : seller),
        productCount: sellerProducts.length,
        salesCount,
        revenue,
        commissionPercentage:
          seller.sellerCommisionPercentage ?? settings.defaultCommission,
      };
    });

    res.render("sellers", { sellers: result });
  } catch (err) {
    console.log("Error, getSellers:", err);
    res.render("sellers", { sellers: [] });
  }
};

adminController.updateChosenSeller = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenSeller");
    const result = await sellerService.updateChosenSeller(req.body);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenSeller:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

adminController.checkAuthSession = async (req: AdminRequest, res: Response) => {
  try {
    if (req.session?.user)
      res.send(`<script> alert("${req.session.user.userStatus}")</script>`);
    else res.send(`<script> alert("${Message.NOT_AUTHENTICATED}")</script>`);
  } catch (err) {
    console.log("Error, checkAuthSession", err);
    res.send(err);
  }
};

adminController.verifyAdmin = (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.session?.user?.userType === UserType.ADMIN) {
    req.user = req.session.user;
    next();
  } else {
    const message = Message.NOT_AUTHENTICATED;
    res.send(
      `<script> alert("${message}"); window.location.replace('/admin/login'); </script>`,
    );
  }
};

// ANALYTICS
adminController.getAnalytics = async (req: Request, res: Response) => {
  try {
    console.log("getAnalytics");

    const analytics = await analyticsService.getAdminAnalytics();

    return res.render("analytics", {
      analytics,
    });
  } catch (err) {
    console.log("Error, getAnalytics:", err);

    return res.render("analytics", {
      analytics: {
        revenueToday: 0,
        revenueLast7Days: [],
        categoryPerformance: [],
        topProducts: [],
      },
      error: err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG,
    });
  }
};

// SETTINGS
adminController.getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getSettings();

    return res.render("settings", {
      settings,
    });
  } catch (err) {
    console.log("Error, getSettings:", err);

    return res.render("settings", {
      settings: {
        siteName: "MNShop",
        contactEmail: "",
        defaultCommission: 0,
        orderSmsTemplate: "",
        maintenanceMode: false,
      },
    });
  }
};

adminController.updateSettings = async (req: Request, res: Response) => {
  try {
    await settingsService.updateSettings(req.body);
    return res.redirect("/admin/settings");
  } catch (err) {
    console.log("Error, updateSettings:", err);
    const message =
      err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
    return res.send(
      `<script> alert("${message}"); window.location.replace('/admin/settings'); </script>`,
    );
  }
};

export default adminController;
