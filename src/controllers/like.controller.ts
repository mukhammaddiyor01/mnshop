import { Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/user";
import LikeService from "../models/Like.service";

const likeController: T = {};
const likeService = new LikeService();

likeController.toggleLike = async (req: ExtendedRequest, res: Response) => {
  try {
    const data = await likeService.toggleLike(req.user, req.params.id);
    return res.status(HttpCode.OK).json({ data });
  } catch (err) {
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

likeController.getMyLikes = async (req: ExtendedRequest, res: Response) => {
  try {
    const data = await likeService.getLikedProductIds(req.user);
    return res.status(HttpCode.OK).json({ data });
  } catch (err) {
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default likeController;
