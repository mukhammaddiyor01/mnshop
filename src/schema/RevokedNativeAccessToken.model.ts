import mongoose, { Schema } from "mongoose";
import { RevokedNativeAccessToken } from "../libs/types/native-auth";

const revokedNativeAccessTokenSchema = new Schema<RevokedNativeAccessToken>(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
    collection: "revokedNativeAccessTokens",
  },
);

export default mongoose.model<RevokedNativeAccessToken>(
  "RevokedNativeAccessToken",
  revokedNativeAccessTokenSchema,
);
