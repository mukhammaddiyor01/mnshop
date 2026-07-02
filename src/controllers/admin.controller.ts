import { Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from '../models/Member.service';


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

        res.send("Sign up Page");
    } catch(err) {
        console.log("Error, getSignUp:", err);
    }
};

export default admincontroller;