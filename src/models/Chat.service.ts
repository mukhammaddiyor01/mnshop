import { Types } from "mongoose";
import Errors, { HttpCode, Message as ErrorMessage } from "../libs/Errors";
import { MessageInput } from "../libs/types/message";
import MessageModel from "../schema/Message.model";
import SellerModel from "../schema/Seller.model";
import UserModel from "../schema/User.model";
import { createHash } from "crypto";

class ChatService {
  private participantId(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.NO_DATA_FOUND);
    }
    return new Types.ObjectId(value);
  }

  private conversationId(first: string, second: string): Types.ObjectId {
    const key = [first, second].sort().join("");
    return new Types.ObjectId(createHash("sha256").update(key).digest("hex").slice(0, 24));
  }

  private async ensureCounterpart(counterpartId: Types.ObjectId, senderIsSeller: boolean) {
    const exists = senderIsSeller
      ? await UserModel.exists({ _id: counterpartId })
      : await SellerModel.exists({ _id: counterpartId });
    if (!exists) throw new Errors(HttpCode.NOT_FOUND, ErrorMessage.NO_DATA_FOUND);
  }

  public async getConversations(userId: string, isSeller: boolean) {
    const id = this.participantId(userId);
    const messages = await MessageModel.find({ $or: [{ senderId: id }, { readerId: id }] })
      .sort({ createdAt: -1 })
      .lean();
    const latest = new Map<string, typeof messages[number]>();
    for (const message of messages) {
      const counterpart = String(message.senderId) === userId ? String(message.readerId) : String(message.senderId);
      if (!latest.has(counterpart)) latest.set(counterpart, message);
    }
    const counterpartIds = [...latest.keys()].map((value) => this.participantId(value));
    const people = isSeller
      ? await UserModel.find({ _id: { $in: counterpartIds } }).select("userNick userImage").lean()
      : await SellerModel.find({ _id: { $in: counterpartIds } }).select("sellerNick sellerImage").lean();
    const personMap = new Map(people.map((person) => [String(person._id), person]));

    return [...latest.entries()].map(([counterpartId, lastMessage]) => ({
      counterpartId,
      counterpart: personMap.get(counterpartId) || null,
      lastMessage,
      unread: messages.filter((message) => String(message.readerId) === userId && String(message.senderId) === counterpartId && !message.messageRead).length,
    }));
  }

  public async getMessages(userId: string, counterpartId: string) {
    const user = this.participantId(userId);
    const counterpart = this.participantId(counterpartId);
    const participantQuery = {
      $or: [
        { senderId: user, readerId: counterpart },
        { senderId: counterpart, readerId: user },
      ],
    };
    await MessageModel.updateMany({ senderId: counterpart, readerId: user, messageRead: false }, { messageRead: true });
    return MessageModel.find(participantQuery).sort({ createdAt: 1 }).lean();
  }

  public async sendMessage(userId: string, counterpartId: string, senderIsSeller: boolean, input: Pick<MessageInput, "messageText" | "messageImage">) {
    const senderId = this.participantId(userId);
    const readerId = this.participantId(counterpartId);
    await this.ensureCounterpart(readerId, senderIsSeller);
    if (!input.messageText?.trim() && !input.messageImage) {
      throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.NO_DATA_FOUND);
    }
    return MessageModel.create({
      conversationId: this.conversationId(userId, counterpartId),
      senderId,
      readerId,
      messageText: input.messageText?.trim() || "",
      messageImage: input.messageImage || "",
    });
  }
}

export default ChatService;
