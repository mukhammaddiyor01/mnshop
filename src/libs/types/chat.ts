import { Types } from "mongoose";

export interface Chat {
    _id: Types.ObjectId;
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    readerId: Types.ObjectId;
    messageText: string;
    messageImage: string;
    messageRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface ChatInput {
    _id: Types.ObjectId;
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    readerId: Types.ObjectId;
    messageText: string;
    messageImage: string;
    messageRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}