import { Types } from "mongoose";
import { Seller } from "./seller";
import { Session } from "express-session";


export interface Payment {
    _id: Types.ObjectId;
    buyerId: Types.ObjectId;
    productId: Types.ObjectId;
    cartColor: string;
    cartSize: string;
    cartQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentInput {
    cartColor: string;
    cartSize: string;
    cartQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentInput {
    cartColor: string;
    cartSize: string;
    cartQuantity: number;
}

export interface AdminRequest extends Request {
    user: Seller;
    session: Session & {seller: Seller};
    file: Express.Multer.File;
    files: Express.Multer.File[];
}