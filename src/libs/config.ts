import mongoose from "mongoose";

export const AUTH_TIMER = 3;
export const NATIVE_ACCESS_TOKEN_MINUTES = 15;
export const NATIVE_REFRESH_TOKEN_DAYS = 30;
export const NATIVE_REFRESH_IDLE_DAYS = 7;

export const MORGAN_FORMAT = `:method :safe-url :response-time [:status] \n`;

export const shapeIntoMongooseObjectId = (target: any) => {
    return typeof target === "string" ? new mongoose.Types.ObjectId(target) : target;
}
