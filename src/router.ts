import express, {Request, Response} from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";

router.get('/', memberController.goHome);

router.get("/login", memberController.getLogin);

router.get("/signup", memberController.getSignUp);

export default router;