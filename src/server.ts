// Architectual pattern(backend suyagi): MVC(model view controller), DI(dependency Injection), MVP(model vieew presenter)
// MVC = (model view controller)
// DI = (dependency Injection)
// MVP = (model vieew presenter)

// Design pattern(backend malum bir bo'lagi): Middleware, Decotar
// 3 xil turga bo'linar ekan:
// Creational
// Structural
// Behavioral design patterns

import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";
import app from './app';

mongoose
    .set("strickQuery", false)
    .connect(process.env.MONGO_URL as string, {})
    .then((data) => {
        console.log("MongoDB is connected successfully");
        const PORT = process.env.PORT ?? 1213;
        app.listen(PORT, function () {
            console.log(`The server is running successfully on port: ${PORT}`)
        })
    })
    .catch((err) => console.log("Error on connection with MongoDB", err));