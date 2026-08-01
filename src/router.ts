import express, {Request, Response} from "express";
const router = express.Router();
import userController from "./controllers/user.controller";
import sellerController from "./controllers/seller.controller";
import makeUploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";


/* BUYER */

// router.get('/', userController.goHome);

router.post("/login", userController.login);

router.post("/signup", userController.signup);

/**
router.get("/products ", usercontroller.products) 
router.get("/products/product ", usercontroller.product) 
router.get("/categories/category ", usercontroller.category) 
router.get("/cart ", usercontroller.cart) 
router.get("/likes ", usercontroller.likes) 
router.get("/checkout ", usercontroller.checkout) 
router.get("/orders ", usercontroller.orders) 
router.get("/chat ", usercontroller.chat) 
router.get("/about ", usercontroller.about) 
router.get("/help ", usercontroller.help)
 
router.get("/orders ", usercontroller.orders) 
router.post("/order ", usercontroller.order) 

 */


/** Seller */
 router
    .post("/seller/login", sellerController.login)
router
    .post("/seller/signup", sellerController.signup);

router.post(
    "/seller/product/create",
    sellerController.verifySeller,
    makeUploader("products").array("productImages", 5),
    productController.createNewProduct
);

router.get(
    "/product/all",
    sellerController.verifySeller,
    productController.getAllProducts
);

router.post(
    "/seller/product/:id",
    // sellerController.verifySeller,
    productController.updateChosenProduct
);

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
