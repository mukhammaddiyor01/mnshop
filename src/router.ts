import express, {Request, Response} from "express";
const router = express.Router();
import userController from "./controllers/user.controller";

router.post("/login", userController.login);

router.post("/signup", userController.signup);


// router.get('/', memberController.goHome);

// router.get("/login", memberController.getLogin);

// router.get("/signup", memberController.getSignUp);

export default router;
