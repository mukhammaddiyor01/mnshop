import { Types } from "mongoose";
import { UserStatus, UserType } from "../enums/user.enum";
import { Session } from "express-session"
import { Request } from "express";

export interface User {
    _id: Types.ObjectId;
    userType: UserType;
    userStatus: UserStatus;
    userNick: string;
    userEmail: string;
    userPhone: string;
    userPassword: string;
    userAddress?: string;
    userDesc?: string;
    userImage?: string;
    userPoints: number;
    userFollowing?: number;
    userFollowers?: number;
    userLikes: number;
    myProducts?: string;
    myOrders?: string;
    createdAt: Date;
    updatedAt: Date; 
}

export interface UserInput {
    userType?: UserType;
    userStatus?: UserStatus;
    userNick: string;
    userEmail: string;
    userPhone: string;
    userPassword: string;
    userAddress?: string;
    userDesc?: string;
    userImage?: string;
    userPoints?: number;
    userFollowing?: number;
    userFollowers?: number;
    userLikes?: number;
    myProducts?: string;
    myOrders?: string;
}

export interface LoginInput {
    userNick: string;
    userPassword: string;
}

export interface UserUpdateInput {
    _id: Types.ObjectId;
    userStatus?: UserStatus;
    userNick: string;
    userEmail: string;
    userPhone: string;
    userPassword: string;
    userAddress?: string;
    userDesc?: string;
    userImage?: string;
    myProducts?: string;
    myOrders?: string;
}

export interface AdminRequest extends Request {
    user: User;
    session: Session & {user: User};
    file: Express.Multer.File;
    files: Express.Multer.File[];
}
