import express from "express";
import path from "path";
import morgan from "morgan";
import router from "./router";
import routerAdmin from "./routerAdmin";
import { MORGAN_FORMAT } from "./libs/config";

/** 1-Entrance */
const app = express();
console.log("__dirname:", __dirname);
app.use(express.static(path.join(__dirname, "public"))); // Public folderni ochiqlayapmiz
app.use(express.urlencoded({extended: true})); // Traditional API
app.use(express.json()); //Rest API
app.use(morgan(MORGAN_FORMAT));

/** 2-Sessions */


/** 3-Views */ 
// BSSR faylarini .ejs siz ishlatish
app.set ("view", path.join(__dirname, "view"));
app.set("view engine", "ejs");

/** 4-Routers */

app.use("/admin", routerAdmin); //BSSR: Backend server site rendering : EJS
app.use("/", router);   //Middleware design pattern - Bu requestni router.ts ga jo'natadi


export default app;
