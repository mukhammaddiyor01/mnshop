import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { AdminRequest, UserInput } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import UserService from "../models/User.service";
import { LoginInput } from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors"

const userService = new UserService();

const adminController: T = {};

const renderAdminPage = (res: Response, view: string, data: T = {}) => {
    res.render(view, data);
};

adminController.goHome = (req: Request, res: Response) => {
    try {
        const sessionInstance = req.session as T;
        res.render("home", { member: sessionInstance.user });
    } catch(err) {
        console.log("Error, goHome:", err);
    }
};

adminController.getOverview = (req: Request, res: Response) => {
    renderAdminPage(res, "overview");
};

adminController.getSellers = (req: Request, res: Response) => {
    renderAdminPage(res, "sellers");
};

adminController.getOrders = (req: Request, res: Response) => {
    renderAdminPage(res, "orders");
};

adminController.getMessages = (req: Request, res: Response) => {
    renderAdminPage(res, "messages");
};

adminController.getAnalytics = (req: Request, res: Response) => {
    renderAdminPage(res, "analytics");
};

adminController.getSettings = (req: Request, res: Response) => {
    renderAdminPage(res, "settings");
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

        req.session.user = result;
        req.session.save(function() {
            res.redirect("/admin/overview");
        });

    } catch(err) {
        console.log("Error, processSignup:", err)
        const message =
            err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script> alert("${message}"); window.location.replace('/admin/signup'); </script>`);
    }
};

adminController.getSignup = (req: Request, res: Response) => {
    try {
        res.render("signup");
    } catch(err) {
        console.log("Error, getSignUp:", err);
        res.redirect("/admin");
    }
};

adminController.getLogin = (req: Request, res: Response) => {
    try {
        res.render("login");
    } catch(err) {
        console.log("Error, Login:", err);
        res.redirect("/admin");
    }
};

adminController.processLogin = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processLogin");

        const input: LoginInput = req.body;
        const result = await userService.processLogin(input);

        req.session.user = result;
        req.session.save(function() {
            res.redirect("/admin/overview");
        });

    } catch(err) {
        console.log("Error, processLogin:", err)
        const message =
            err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(`<script> alert("${message}"); window.location.replace('/admin/login'); </script>`);
    }

};

adminController.logout = async (
    req: AdminRequest,
    res: Response
) => {
    try {
        console.log("processlogout");
        req.session.destroy(function() {
            res.redirect("/admin")
        });
    } catch(err) {
        console.log("Error, processLogin:", err);
        res.redirect("/admin");
    }
};

adminController.getUsers = async (req: Request, res: Response) => {
    try{
        console.log("getUsers");
        const result = await userService.getUsers();

        res.render("users", { users: result });
    } catch(err) {
        console.log("Error, getUsers:", err);
        res.render("users", { users: [] });
    }
};

adminController.updateChosenUser = async (req: Request, res: Response) => {
    try {
        console.log("updateChosenUser");
        const result = await userService.updateChosenUser(req.body);

        res.status(HttpCode.OK).json({ data: result });
    } catch(err) {
        console.log("Error, updateChosenUser:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

adminController.checkAuthSession = async (
    req: AdminRequest,
    res: Response
) => {
    try {
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
