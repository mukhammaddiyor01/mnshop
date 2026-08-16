import SettingsModel from "../schema/Settings.model";
import { SiteSettings, SiteSettingsInput } from "../libs/types/settings";
import Errors, { HttpCode, Message } from "../libs/Errors";

class SettingsService {
  private readonly settingsModel;

  constructor() {
    this.settingsModel = SettingsModel;
  }

  public async getSettings(): Promise<SiteSettings> {
    try {
      const settings = await this.settingsModel.findOne().exec();

      if (settings) {
        return settings;
      }

      return await this.settingsModel.create({});
    } catch (err) {
      console.log("Error, SettingsService.getSettings:", err);

      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG,
      );
    }
  }

  public async updateSettings(input: SiteSettingsInput): Promise<SiteSettings> {
    try {
      const update = this.normalizeInput(input);
      this.validateInput(update);

      const settings = await this.settingsModel.findOneAndUpdate(
        {},
        {
          $set: update,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );

      return settings;
    } catch (err) {
      console.log("Error, SettingsService.updateSettings:", err);

      if (err instanceof Errors) {
        throw err;
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
  }

  private normalizeInput(input: SiteSettingsInput): SiteSettingsInput {
    return {
      siteName: String(input.siteName || "").trim(),
      contactEmail: String(input.contactEmail || "")
        .trim()
        .toLowerCase(),

      defaultCommission: Number(input.defaultCommission),

      orderSmsTemplate: String(input.orderSmsTemplate || "").trim(),

      maintenanceMode:
        input.maintenanceMode === true ||
        input.maintenanceMode === ("true" as never) ||
        input.maintenanceMode === ("on" as never),
    };
  }

  private validateInput(input: SiteSettingsInput): void {
    const valid =
      Boolean(input.siteName) &&
      Boolean(input.contactEmail) &&
      String(input.contactEmail).includes("@") &&
      Number.isFinite(input.defaultCommission) &&
      Number(input.defaultCommission) >= 0 &&
      Number(input.defaultCommission) <= 100 &&
      Boolean(input.orderSmsTemplate);

    if (!valid) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
  }
}

export default SettingsService;
