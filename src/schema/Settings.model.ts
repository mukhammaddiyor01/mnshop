import mongoose, { Schema } from "mongoose";
import { SiteSettings } from "../libs/types/settings";

const settingsSchema = new Schema<SiteSettings>(
  {
    siteName: {
      type: String,
      required: true,
      trim: true,
      default: "MNShop",
    },

    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: "hello@mnshop.uz",
    },

    defaultCommission: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 12,
    },

    orderSmsTemplate: {
      type: String,
      required: true,
      default: "Buyurtmangiz holati yangilandi: {{status}}",
    },

    maintenanceMode: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "settings",
  },
);

export default mongoose.model<SiteSettings>("Settings", settingsSchema);
