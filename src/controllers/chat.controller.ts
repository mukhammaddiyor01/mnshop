import { Response } from "express";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import Errors, { HttpCode } from "../libs/Errors";
import ChatService from "../models/Chat.service";

const chatService = new ChatService();
const chatController: T = {};

const handleError = (res: Response, error: unknown) => {
  if (error instanceof Errors) return res.status(error.code).json(error);
  return res.status(Errors.standard.code).json(Errors.standard);
};

chatController.getConversations = async (req: ExtendedRequest, res: Response) => {
  try {
    const data = await chatService.getConversations(String(req.user._id), req.user.userType === UserType.SELLER);
    return res.status(HttpCode.OK).json({ data });
  } catch (error) { return handleError(res, error); }
};

chatController.getMessages = async (req: ExtendedRequest, res: Response) => {
  try {
    const data = await chatService.getMessages(String(req.user._id), req.params.counterpartId);
    return res.status(HttpCode.OK).json({ data });
  } catch (error) { return handleError(res, error); }
};

chatController.sendMessage = async (req: ExtendedRequest, res: Response) => {
  try {
    const data = await chatService.sendMessage(
      String(req.user._id),
      req.params.counterpartId,
      req.user.userType === UserType.SELLER,
      req.body,
    );
    return res.status(HttpCode.CREATED).json({ data });
  } catch (error) { return handleError(res, error); }
};

export default chatController;
