import { Request, Response } from "express";
import { T } from "../libs/types/common";


const restaurantController: T = {};
restaurantController.goHome = (req: Request, res: Response) => {
    try {
        res.send("Home Page");
    } catch(err) {
        console.log("Error, goHome:", err);
    }
};

restaurantController.getLogin = (req: Request, res: Response) => {
    try {
        res.send("Login Page");
    } catch(err) {
        console.log("Error, Login:", err);
    }
};

restaurantController.getSignup = (req: Request, res: Response) => {
    try {
        res.send("Sign up Page");
    } catch(err) {
        console.log("Error, getSignUp:", err);
    }
};

export default restaurantController;