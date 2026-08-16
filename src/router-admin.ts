import express from "express";
const routerAdmin = express.Router();
import adminController from "./controllers/admin.controller";
import productController from "./controllers/product.controller";
import makeUploader from "./libs/utils/uploader";
import orderController from "./controllers/order.controller";

/** ADMIN AUTH */
routerAdmin.get(["/", "/home"], adminController.goHome);

routerAdmin
  .get("/login", adminController.getLogin)
  .post("/login", adminController.processLogin);

routerAdmin
  .get("/signup", adminController.getSignup)
  .post(
    "/signup",
    makeUploader("users").single("userImage"),
    adminController.processSignup,
  );

routerAdmin.get("/logout", adminController.logout);
routerAdmin.get("/check-me", adminController.checkAuthSession);

/** ADMIN BSSR FRONTEND: OVERVIEW */
routerAdmin.get(
  "/overview",
  adminController.verifyAdmin,
  adminController.getOverview,
);

/** ANALYTICS */

routerAdmin.get(
  "/analytics",
  adminController.verifyAdmin,
  adminController.getAnalytics,
);

/** SETTINGS */

routerAdmin.get(
  "/settings",
  adminController.verifyAdmin,
  adminController.getSettings,
);

routerAdmin.post(
  "/settings",
  adminController.verifyAdmin,
  adminController.updateSettings,
);

/** PRODUCT MANAGEMENT */

routerAdmin.get(
  "/product/all",
  adminController.verifyAdmin,
  productController.getAllProducts,
);

routerAdmin.post(
  "/seller/product/:id",
  // sellerController.verifySeller,
  adminController.verifyAdmin,
  productController.updateChosenProduct,
);

/** ORDER MANAGEMENT */
routerAdmin.get(
  "/orders",
  adminController.verifyAdmin, // req.user ni sessiondan oladi
  orderController.getMyOrders,
);

// routerAdmin.post(
//   "/order/:id",
//   adminController.verifyAdmin,
//   orderController.updateOrder,
// );

/** CHAT MANAGEMENT */
routerAdmin.get(
  "/messages",
  adminController.verifyAdmin,
  adminController.getMessages,
);

/** BUYER MANAGEMENT */
routerAdmin.get(
  "/users/all",
  adminController.verifyAdmin,
  adminController.getUsers,
);

routerAdmin.post(
  "/user/edit",
  adminController.verifyAdmin,
  adminController.updateChosenUser,
);

/** Seller MANAGEMENT */

routerAdmin.get(
  "/sellers",
  adminController.verifyAdmin,
  adminController.getSellers,
);

routerAdmin.post(
  "/seller/edit",
  adminController.verifyAdmin,
  adminController.updateChosenSeller,
);

export default routerAdmin;
