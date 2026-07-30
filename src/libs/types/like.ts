import { Types } from "mongoose";


export interface Like {
    _id: Types.ObjectId;
    buyerId: Types.ObjectId;
    productId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface LikeInput {
    _id: Types.ObjectId;
    buyerId: Types.ObjectId;
    productId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}