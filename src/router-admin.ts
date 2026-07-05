import express, { Request, Response } from 'express';
const routerAdmin = express.Router();
import admincontroller from './controllers/admin.controller';
import productController from './controllers/product.controller';

routerAdmin.get('/', admincontroller.goHome);

routerAdmin
    .get("/login", admincontroller.getLogin)
    .post("/login", admincontroller.processLogin);

routerAdmin
        .get("/signup", admincontroller.getSignup)
        .post("/signup", admincontroller.processSignup);

routerAdmin.get("/logout", admincontroller.logout);

routerAdmin.get("/check-me", admincontroller.checkAuthSession);

/** Seller Product */
routerAdmin.get("/product/all", productController.getAllProducts);
routerAdmin.post("/product/create", productController.createNewProduct);
routerAdmin.get("/product/:id", productController.updateChosenProduct);




/** Buyer */

export default routerAdmin;
