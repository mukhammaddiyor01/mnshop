import { Request, Response } from "express";
import { T } from "../libs/types/common";
import UserService from '../models/User.service';


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

admincontroller.processLogin = (req: Request, res: Response) => {
    try {
        console.log("processLogin");
        res.send("DONE");
    } catch(err) {
        console.log("Error, processLogin:", err)
    }
};

admincontroller.processSignup = (req: Request, res: Response) => {
    try {
        console.log("processSignup");
        res.send("DONE");
    } catch(err) {
        console.log("Error, processSignup:", err)
    }
};

export default admincontroller;