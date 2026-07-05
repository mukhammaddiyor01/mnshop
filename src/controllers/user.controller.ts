import { Request, Response } from "express";
import { T } from "../libs/types/common";
import { UserInput, LoginInput, User } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import UserService from "../models/User.service";
import Errors from "../libs/Errors";
import { randomBytes } from "crypto";


// SPA - React uchun

const userController: T = {};

const userService = new UserService();

const createUserToken = () : string => randomBytes(48).toString('hex');

userController.signup = async (req: Request, res: Response) => {
    try { 
        console.log("signup");
        console.log("body:", req.body);

        const input: UserInput = req.body,
            result: User = await userService.signup(input);
        //TODO: TOKENS AUTHENTICATION

        res.json({user: result})
    } catch(err) {
        console.log("ERROR, signup:", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
}

userController.login = async (req: Request, res: Response) => {
    try {
        console.log("login");
        console.log("body:", req.body);
        const input: LoginInput = req.body;
        const result = await userService.login(input);

        res.json({member: result})
    } catch(err) {
        console.log("ERROR, login:", err);
        if (err instanceof Errors) res.send(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default userController;
