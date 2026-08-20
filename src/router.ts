import express, { Request, Response } from "express";
const router = express.Router();
import userController from "./controllers/user.controller";
import sellerController from "./controllers/seller.controller";
import makeUploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";
import orderController from "./controllers/order.controller";
import { blockPurchasesDuringMaintenance } from "./libs/middleware/mainteance";
import paymentController from "./controllers/payment.controller";
import likeController from "./controllers/like.controller";

/* BUYER */

// router.get('/', userController.goHome);

router.post("/login", userController.login);

router.post("/signup", userController.signup);

router.post("/auth/google", userController.googleAuth);

router.get(
  "/auth/me",
  userController.verifyAuth,
  userController.getUserDetail,
);

router.post(
  "/logout",
  userController.verifyAuth,
  userController.logout,
);

router.post(
  "/user/update",
  userController.verifyAuth,
  makeUploader("users").single("userImage"),
  userController.updateUser,
);

router.get("/products", productController.getPublicProducts);

router.post(
  "/product/:id/view",
  userController.verifyAuth,
  productController.registerProductView,
);

router.post(
  "/product/:id/like",
  userController.verifyAuth,
  likeController.toggleLike,
);

router.get(
  "/product/likes",
  userController.verifyAuth,
  likeController.getMyLikes,
);

router.post(
  "/order/create",
  userController.verifyAuth,
  blockPurchasesDuringMaintenance,
  orderController.createOrder,
);

router.get(
  "/order/all",
  userController.verifyAuth,
  orderController.getMyOrders,
);

// PAYMENT

router.post(
  "/payment/prepare",
  userController.verifyAuth,
  paymentController.preparePayment,
);

router.post(
  "/payment/confirm",
  userController.verifyAuth,
  paymentController.confirmPayment,
);

router.post(
  "/payment/mock-confirm",
  userController.verifyAuth,
  paymentController.mockConfirmPayment,
);

router.get(
  "/payment/all",
  userController.verifyAuth,
  paymentController.getMyPayments,
);

/**   💻💻💻💻 SELLER 💻💻💻💻💻*/

/** SELLER AUTH */

router.post("/seller/login", sellerController.login);
router.post(
  "/seller/signup",
  makeUploader("sellers").single("sellerImages"),
  sellerController.signup,
);

router.get("/seller/profile", sellerController.verifySeller, sellerController.getProfile);
router.post("/seller/profile/update", sellerController.verifySeller, sellerController.updateProfile);

/** SELLER OVERVIEW */

/** SELLER ANALYTICS */

/** SELLER SETTINGS */

/** SELLER PRODUCT MANAGEMENT */

router.post(
  "/seller/product/create",
  sellerController.verifySeller,
  makeUploader("products").array("productImages", 10),
  productController.createNewProduct,
);

router.get(
  "/seller/product/all",
  sellerController.verifySeller,
  productController.getAllProducts,
);

router.get(
  "/product/all",
  sellerController.verifySeller,
  productController.getAllProducts,
);

router.post(
  "/seller/product/bulk-status",
  sellerController.verifySeller,
  productController.updateBulkProductStatus,
);

router.post(
  "/seller/product/:id",
  sellerController.verifySeller,
  productController.updateChosenProduct,
);

/** SELLER ORDER MANAGEMENT */

router.get(
  "/seller/order/all",
  sellerController.verifySeller,
  orderController.getMyOrders,
);

router.post(
  "/seller/order/:id/delivery",
  sellerController.verifySeller,
  orderController.updateDeliveryStatus,
);

/** SELLER CHAT MANAGEMENT */

/** SELLER BUYER MANAGEMENT */

// DELIVERY

// router.post(
//   "/seller/order/:id/delivery",
//   sellerController.verifySeller,
//   orderController.updateDeliveryStatus,
// );

/**
 


// SIGNUP

 routerSeller.get(['/', '/home'], sellerController.goHome);

 routerSeller
    .get("/login", sellerController.getLogin)
    .post("login", sellerController.processLogin);

routerSeller
    .get("/signup", sellerController.getSignup)
    .post("/signup",
        makeUploader("users").single("userImage"),
        sellerController.processSignup
    );

routerSeller.get("/logout", routerSeller.logout);
routerSeller.get("/check-me", routerSeller.checkAuthSession);


// OverView

routerSeller.get("/overview", 
    sellerController.verifySeller, 
    sellerController.getOverview);


// PRODUCTS

routerSeller.get("/product/all", 
    sellerController.verifySeller, 
    sellerController.getAllProducts);

routerSeller.post("/product/create", 
    sellerController.verifySeller,
    makeUploader("products").array("productImages", 5), 
    productController.createNewProduct);

routerSeller.post("/product/:id", 
    sellerController.verifySeller, 
    sellerController.updateChosenProduct);


// ORDERS

routerSeller.get("/orders", 
    sellerController.verifySeller, 
    sellerController.getOrders);

routerSeller.post("/order/:id", 
    sellerController.verifySeller, 
    sellerController.updateChosenOrder);




//MESSAGES

routerSeller.get("/messages", 
    sellerController.verifySeller, 
    sellerController.getMessages);


// ANALYTICS

routerSeller.get("/analytics", 
    sellerController.verifySeller, 
    sellerController.getAnalytics);
    
// SETTINGS

routerSeller.get("/settings", 
    sellerController.verifySeller, 
    sellerController.getSettings);


 */

export default router;
