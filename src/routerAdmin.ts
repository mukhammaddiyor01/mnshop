import express, { Request, Response } from 'express';
const routerAdmin = express.Router();
import admincontroller from './controllers/admin.controller';

routerAdmin.get('/', admincontroller.goHome);

routerAdmin.get("/login", admincontroller.getLogin);

routerAdmin.get("/signup", admincontroller.getSignup);

export default routerAdmin;
