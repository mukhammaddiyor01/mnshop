import express, {Request, Response} from "express";
const router = express.Router();
import userController from "./controllers/user.controller";

router.post("/login", userController.login);

router.post("/signup", userController.signup);


// router.get('/', memberController.goHome);

// router.get("/login", memberController.getLogin);

// router.get("/signup", memberController.getSignUp);

/** 
 
// SIGNUP/LOGIN

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
