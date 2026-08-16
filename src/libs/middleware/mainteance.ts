import { NextFunction, Request, Response } from "express";
import SettingsService from "../../models/Settings.service";
import { HttpCode } from "../Errors";

const settingsService = new SettingsService();

export const blockPurchasesDuringMaintenance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await settingsService.getSettings();

    if (settings.maintenanceMode) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message: "Store purchases are temporarily unavailable",
      });
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
