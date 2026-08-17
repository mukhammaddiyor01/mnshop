import express from "express";
import path from "path";
import morgan from "morgan";
import router from "./router";
import routerAdmin from "./router-admin";
import { MORGAN_FORMAT } from "./libs/config";

import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
    uri: String(process.env.MONGO_URL),
    collection:'sessions',
});

/** 1-Entrance */
const app = express();
console.log("__dirname:", __dirname);

const allowedFrontendOrigins = new Set([
    process.env.BUYER_FRONTEND_URL || "http://localhost:1214",
    process.env.SELLER_FRONTEND_URL || "http://localhost:1215",
]);

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedFrontendOrigins.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Vary", "Origin");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization",
        );
        res.header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        );
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    return next();
});

app.use(express.static(path.join(__dirname, "public"))); // Public folderni ochiqlayapmiz
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(express.urlencoded({extended: true})); // Traditional API
app.use(express.json()); //Rest API
app.use(morgan(MORGAN_FORMAT));


/** 2-Sessions */
app.use(
    session({
        secret: String(process.env.SESSION_SECRET),
        cookie: {
            maxAge: 1000 * 3600 * 6,
        },
        store: store,
        resave: true,
        saveUninitialized: true
    })
);


app.use(function(req, res, next) {
    const sessionInstance = req.session as T;
    res.locals.user = sessionInstance.user;
    next();
})


/** 3-Views */ 
// BSSR faylarini .ejs siz ishlatish
app.set ("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** 4-Routers */

app.use("/admin", routerAdmin); //BSSR: Backend server site rendering : EJS
app.use("/", router);   //Middleware design pattern - Bu requestni router.ts ga jo'natadi


export default app;
