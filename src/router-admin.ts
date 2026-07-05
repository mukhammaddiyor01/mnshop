import express, { Request, Response } from 'express';
const routerAdmin = express.Router();
import adminController from './controllers/admin.controller';
import productController from './controllers/product.controller';

routerAdmin.get('/', adminController.goHome);

routerAdmin
    .get("/login", adminController.getLogin)
    .post("/login", adminController.processLogin);

routerAdmin
        .get("/signup", adminController.getSignup)
        .post("/signup", adminController.processSignup);

routerAdmin.get("/logout", adminController.logout);

routerAdmin.get("/check-me", adminController.checkAuthSession);

/** Seller Product */
routerAdmin.get("/product/all", productController.getAllProducts);
routerAdmin.post("/product/create", productController.createNewProduct);
routerAdmin.get("/product/:id", productController.updateChosenProduct);




/** Buyer */

export default routerAdmin;
