import express from 'express';
const routerAdmin = express.Router();
import adminController from './controllers/admin.controller';
import productController from './controllers/product.controller';
import makeUploader from './libs/utils/uploader';

/** ADMIN AUTH */
routerAdmin.get(['/', '/home'], adminController.goHome);

routerAdmin
    .get("/login", adminController.getLogin)
    .post("/login", adminController.processLogin);

routerAdmin
    .get("/signup", adminController.getSignup)
    .post("/signup",
        makeUploader("users").single("userImage"),
        adminController.processSignup
    );

routerAdmin.get("/logout", adminController.logout);
routerAdmin.get("/check-me", adminController.checkAuthSession);

/** ADMIN BSSR FRONTEND */
routerAdmin.get("/overview", 
    adminController.verifyAdmin, 
    adminController.getOverview);

routerAdmin.get("/sellers", 
    adminController.verifyAdmin, 
    adminController.getSellers);

routerAdmin.get("/orders", 
    adminController.verifyAdmin, 
    adminController.getOrders);

routerAdmin.get("/messages", 
    adminController.verifyAdmin, 
    adminController.getMessages);

routerAdmin.get("/analytics", 
    adminController.verifyAdmin, 
    adminController.getAnalytics);
    
routerAdmin.get("/settings", 
    adminController.verifyAdmin, 
    adminController.getSettings);

/** PRODUCT MANAGEMENT */
routerAdmin.get(
    "/product/all",
    adminController.verifyAdmin,
    productController.getAllProducts
);

routerAdmin.post(
    "/product/create",
    adminController.verifyAdmin,
    makeUploader("products").array("productImages", 5),
    productController.createNewProduct
);


routerAdmin.post(
    "/product/:id",
    adminController.verifyAdmin,
    productController.updateChosenProduct
);

/** BUYER MANAGEMENT */
routerAdmin.get(
    "/users/all",
    adminController.verifyAdmin,
    adminController.getUsers
);

routerAdmin.post(
    "/user/edit",
    adminController.verifyAdmin,
    adminController.updateChosenUser
);

export default routerAdmin;
