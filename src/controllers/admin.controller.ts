import { Request, Response } from "express";
import { T } from "../libs/types/common";
import { AdminRequest, UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import UserService from "../models/User.service";
import { LoginInput } from "../libs/types/user";

const userService = new UserService();

const admincontroller: T = {};
admincontroller.goHome = (req: Request, res: Response) => {
    try {
        console.log("goHome");

        res.render("home");
    } catch(err) {
        console.log("Error, goHome:", err);
    }
};

admincontroller.processSignup = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processSignup");
        
        const newUser: UserInput = req.body;
        newUser.userType = UserType.ADMIN;

        const result = await userService.processSignup(newUser);
        // TODO: SESSION AUTHENTICATION

        req.session.user = result;
        req.session.save(function() {
            res.send(result);
        });
        
    } catch(err) {
        console.log("Error, processSignup:", err)
    }
};


admincontroller.getSignup = (req: Request, res: Response) => {
    try {
        console.log("getSignup");

        res.render("signup");
    } catch(err) {
        console.log("Error, getSignUp:", err);
    }
};


admincontroller.getLogin = (req: Request, res: Response) => {
    try {
        console.log("getLogin");

        res.render("login");
    } catch(err) {
        console.log("Error, Login:", err);
    }
};


admincontroller.processLogin = async (req: Request, res: Response) => {
    try {
        console.log("processLogin");

        console.log("body:", req.body);
        const input: LoginInput = req.body;
;
        const result = await userService.processLogin(input); // CAll
        // TODO: SESSION AUTHENTICATION
        res.send(result);
    } catch(err) {
        console.log("Error, processLogin:", err)
        res.send(err);
    }
};



export default admincontroller;