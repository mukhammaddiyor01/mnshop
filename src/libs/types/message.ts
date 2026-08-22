import { Types } from "mongoose";

export interface Message {
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

export interface MessageInput {
    conversationId?: Types.ObjectId;
    senderId: Types.ObjectId;
    readerId: Types.ObjectId;
    messageText: string;
    messageImage?: string;
    messageRead?: boolean;
}
