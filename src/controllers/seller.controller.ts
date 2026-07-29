import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { AdminRequest, UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import SellerService from "../models/Seller.service";
import { LoginInput } from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { randomBytes } from "crypto";
import { SellerInput, SellerLoginInput } from "../libs/types/seller";

const sellerService = new SellerService();

const sellerController: T = {};

const createUserToken = () : string => randomBytes(48).toString('hex');

sellerController.signup = async (req: Request, res: Response) => {
    try {
        console.log("seller signup");
        console.log("body:", req.body);

        const input: SellerInput = req.body;
        const result = await sellerService.signup(input);

        res.json({seller: result});
    } catch(err) {
        console.log("Error, seller signup:", err)
        if(err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

sellerController.login = async (req: Request, res: Response) => {
    try {
        console.log("seller login");
        console.log("body:", req.body);

        const input: SellerLoginInput = req.body;
        const result = await sellerService.login(input);

        res.json({seller: result})
    } catch(err) {
        console.log("Error, seller login:", err)
        if(err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};



export default sellerController;
