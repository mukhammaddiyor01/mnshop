import express, {Request, Response} from "express";
const router = express.Router();
import memberController from "./controllers/user.controller";
import userController from "./controllers/user.controller";

router.post("/login", userController.getLogin);

router.post("/signup", userController.getSignUp);


// router.get('/', memberController.goHome);

// router.get("/login", memberController.getLogin);

// router.get("/signup", memberController.getSignUp);

export default router;