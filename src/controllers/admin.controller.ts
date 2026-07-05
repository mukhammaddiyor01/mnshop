import { Request, Response } from "express";
import { T } from "../libs/types/common";
import { UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import UserService from "../models/User.service";
import { LoginInput } from "../libs/types/user";


const admincontroller: T = {};
admincontroller.goHome = (req: Request, res: Response) => {
    try {
        console.log("goHome");

        res.send("Home Page");
    } catch(err) {
        console.log("Error, goHome:", err);
    }
};

admincontroller.getLogin = (req: Request, res: Response) => {
    try {
        console.log("getLogin");

        res.send("Login Page");
    } catch(err) {
        console.log("Error, Login:", err);
    }
};

admincontroller.getSignup = (req: Request, res: Response) => {
    try {
        console.log("getSignup");

        res.send("Sign Up Page");
    } catch(err) {
        console.log("Error, getSignUp:", err);
    }
};

admincontroller.processLogin = async (req: Request, res: Response) => {
    try {
        console.log("processLogin");

        console.log("body:", req.body);
        const input: LoginInput = req.body;

        const userService = new UserService();
        const result = await userService.processLogin(input); // CAll

        res.send(result);
    } catch(err) {
        console.log("Error, processLogin:", err)
        res.send(err);
    }
};

admincontroller.processSignup = async (req: Request, res: Response) => {
    try {
        console.log("processSignup");
        
        const newUser: UserInput = req.body;
        newUser.userType = UserType.ADMIN;

        const userService = new UserService();
        const result = await userService.processSignup(newUser);

        res.send(result);
    } catch(err) {
        console.log("Error, processSignup:", err)
    }
};

export default admincontroller;