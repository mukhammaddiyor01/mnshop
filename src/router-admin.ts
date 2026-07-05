import express, { Request, Response } from 'express';
const routerAdmin = express.Router();
import admincontroller from './controllers/admin.controller';

routerAdmin.get('/', admincontroller.goHome);

routerAdmin
    .get("/login", admincontroller.getLogin)
    .post("/login", admincontroller.processLogin);

routerAdmin
        .get("/signup", admincontroller.getSignup)
        .post("/signup", admincontroller.processSignup);

routerAdmin.get("/check-me", admincontroller.checkAuthSession);

/** Seller Product */


/** Buyer */

export default routerAdmin;
