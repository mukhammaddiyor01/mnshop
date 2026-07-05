import { Types } from "mongoose";
import { UserStatus, UserType } from "../enums/user.enum";

export interface User {
    _id: Types.ObjectId;
    userType: UserType;
    userStatus: UserStatus;
    userNick: string;
    userEmail: string;
    userPhone: string;
    userPassword?: string;
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
