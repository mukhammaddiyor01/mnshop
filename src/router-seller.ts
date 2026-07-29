import express from 'express';
const routerAdmin = express.Router();
import adminController from './controllers/admin.controller';
import productController from './controllers/product.controller';
import makeUploader from './libs/utils/uploader';
// import sellerController from './controllers/seller.controller'

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

routerSeller.get("/product/create", 
    sellerController.verifySeller, 
    sellerController.createNewProduct);

routerSeller.get("/product/:id", 
    sellerController.verifySeller, 
    sellerController.updateChosenProduct);


// ORDERS

routerSeller.get("/orders", 
    sellerController.verifySeller, 
    sellerController.getOrders);

routerSeller.get("/order/:id", 
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