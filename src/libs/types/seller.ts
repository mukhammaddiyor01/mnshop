import { Types } from "mongoose";
import { Session } from "express-session";
import { Request } from "express";
import { SellerStatus } from "../enums/seller.enum";
import { UserType } from "../enums/user.enum";

export interface Seller {
  _id: Types.ObjectId;
  userType: UserType;
  sellerNick: string;
  sellerEmail: string;
  sellerPhone: string;
  sellerPassword: string;
  sellerImage: string;
  sellerDesc?: string;
  sellerAddress?: string;
  sellerCommisionPercentage: number;
  sellerStatus?: SellerStatus;
  sellerTotalSales?: number;
  sellerLeftCount?: number;
  sellerApprovedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerInput {
  sellerNick: string;
  sellerEmail: string;
  sellerPhone: string;
  sellerPassword: string;
  sellerImage?: string;
  sellerDesc?: string;
  sellerAddress?: string;
  sellerCommisionPercentage: number;
  sellerStatus?: SellerStatus;
  sellerTotalSales?: number;
  sellerLeftCount?: number;
  sellerApprovedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerLoginInput {
  sellerNick: string;
  sellerPassword: string;
}

export interface SellerUpdateInput {
  _id: Types.ObjectId;
  sellerNick: string;
  sellerEmail: string;
  sellerPhone: string;
  sellerPassword: string;
  sellerImage?: string;
  sellerDesc?: string;
  sellerAddress?: string;
  sellerCommisionPercentage: number;
  sellerStatus?: SellerStatus;
}

export interface AdminRequest extends Request {
  user: Seller;
  session: Session & { seller: Seller };
  file: Express.Multer.File;
  files: Express.Multer.File[];
}
