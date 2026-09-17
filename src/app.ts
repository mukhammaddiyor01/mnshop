import express from "express";
import path from "path";
import morgan from "morgan";
import router from "./router";
import routerAdmin from "./router-admin";
import { buyerHtml } from "./controllers/seo.controller";
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

app.use((req, res, next) => {
    if (/^\/(admin|seller|api|auth|user|product|order|payment|login|signup|logout|cart|checkout|likes|chat|notifications|orders|user-page)(\/|$)/.test(req.path)) {
        res.set("X-Robots-Tag", "noindex, nofollow");
    }
    next();
});
app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(express.urlencoded({extended: true})); // Traditional API
app.use(express.json()); //Rest API
app.use(morgan(MORGAN_FORMAT));


/** 2-Sessions */
app.use(
    session({
        secret: String(process.env.SESSION_SECRET),
        cookie: {
            maxAge: 1000 * 3600 * 3,
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

/** 5-Frontend applications — one public origin: http://localhost:1213 */
const frontendRoot = path.resolve(__dirname, "..", "..", "mnshop-react");
const buyerBuildDirectory = path.join(frontendRoot, "build");
const sellerBuildDirectory = path.join(frontendRoot, "src-seller", "build");

app.use("/seller", express.static(sellerBuildDirectory, { index: false }));
app.get(["/seller", "/seller/*"], (req, res) => {
    const valid = /^\/seller(?:\/seller)?(?:\/(?:login|signup|overview|products|orders|messages|analytics|settings))?\/?$/.test(req.path);
    res.status(valid ? 200 : 404).sendFile(path.join(sellerBuildDirectory, "index.html"));
});

app.get("/index.html", (_req, res) => res.redirect(301, "/"));
app.use(express.static(buyerBuildDirectory, { index: false }));
app.get("*", buyerHtml(buyerBuildDirectory));


export default app;
