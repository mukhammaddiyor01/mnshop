import mongoose, { Schema } from "mongoose";
import { Message } from "../libs/types/message";

const messageSchema = new Schema<Message>(
  {
    conversationId: { type: Schema.Types.ObjectId, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, required: true, index: true },
    readerId: { type: Schema.Types.ObjectId, required: true, index: true },
    messageText: { type: String, trim: true, maxlength: 2000, default: "" },
    messageImage: { type: String, default: "" },
    messageRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: "messages" },
);

messageSchema.index({ senderId: 1, readerId: 1, createdAt: -1 });

export default mongoose.model<Message>("Message", messageSchema);
