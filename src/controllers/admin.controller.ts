import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { AdminRequest, UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import UserService from "../models/User.service";
import { LoginInput } from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors"

const userService = new UserService();

const adminController: T = {};
adminController.goHome = (req: Request, res: Response) => {
    try {
        console.log("goHome");

        res.render("home");
    } catch(err) {
        console.log("Error, goHome:", err);
    }
};

adminController.processSignup = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processSignup");
        const file = req.file;

        if(!file) 
            throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
        

        const newUser: UserInput = req.body;
        newUser.userImage = file?.path;
        newUser.userType = UserType.ADMIN;

        const result = await userService.processSignup(newUser);
        // TODO: SESSION AUTHENTICATION

        req.session.user = result;
        req.session.save(function() {
            res.redirect("/admin/product/all");
        });
        
    } catch(err) {
        console.log("Error, processSignup:", err)
        const message = 
            err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script> alert("${message}"}); windows.location.replace('admin/signup) </script>`);
    }
};


adminController.getSignup = (req: Request, res: Response) => {
    try {
        console.log("getSignup");

        res.render("signup");
    } catch(err) {
        console.log("Error, getSignUp:", err);
        res.redirect("/admin");
    }
};


adminController.getLogin = (req: Request, res: Response) => {
    try {
        console.log("getLogin");

        res.render("login");
    } catch(err) {
        console.log("Error, Login:", err);
        res.redirect("/admin");
    }
};


adminController.processLogin = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processLogin");

        console.log("body:", req.body);
        const input: LoginInput = req.body;
;
        const result = await userService.processLogin(input); // CAll
        // TODO: SESSION AUTHENTICATION
        req.session.user = result;
        req.session.save(function() {
            res.redirect("/admin/product/all");
        });

    } catch(err) {
        console.log("Error, processLogin:", err)
        const message = 
            err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script> alert("${message}"}); windows.location.replace('admin/signup) </script>`);
    }
    
};


adminController.logout = async (
    req: AdminRequest,
    res: Response
) => {
    try {
        console.log("processlogout");
        req.session.destroy(function() {
            res.redirect("/admin/login")
        });
    } catch(err) {
        console.log("Error, processLogin:", err);
        res.redirect("/admin");
    }
};



adminController.checkAuthSession = async (
    req: AdminRequest,
    res: Response
) => {
    try {
        console.log("checkAuthSessionprocessLogin");
        if(req.session?.user) 
            res.send(`<script> alert("${ req.session.user.userStatus }")</script>`);
        else res.send(`<script> alert("${ Message.NOT_AUTHENTICATED }")</script>`);
    } catch(err) {
        console.log("Error, checkAuthSession", err);
        res.send(err);
    }
};


adminController.verifyAdmin = (
    req: AdminRequest,
    res: Response,
    next: NextFunction
) => {
    if(req.session?.user?.userType === UserType.ADMIN) {
        req.user = req.session.user;
        next();
    } else {
        const message = Message.NOT_AUTHENTICATED;
        res.send(
            `<script> alert("${message}"); window.location.replace('/admin/login'); </script>`
        )
    }
};


export default adminController;
