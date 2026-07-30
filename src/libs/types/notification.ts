import { Types } from "mongoose";
import { NotificationType } from "../enums/notification.enum";

export interface Notification {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    notificationType: NotificationType;
    notificationTitle: string;
    notificationBody: string;
    notificationLink: string;
    notificationRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface NotificationInput {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    notificationType: NotificationType;
    notificationTitle: string;
    notificationBody: string;
    notificationLink: string;
    notificationRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}