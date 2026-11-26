import mongoose, { Schema } from "mongoose";
import { NativeRefreshSession } from "../libs/types/native-auth";

const nativeRefreshSessionSchema = new Schema<NativeRefreshSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
    },
    deviceLabel: {
      type: String,
      trim: true,
      maxlength: 128,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    idleExpiresAt: {
      type: Date,
      required: true,
    },
    lastUsedAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
    },
    replacedBySessionId: {
      type: Schema.Types.ObjectId,
      ref: "NativeRefreshSession",
    },
  },
  {
    timestamps: true,
    collection: "nativeRefreshSessions",
  },
);

nativeRefreshSessionSchema.index({ userId: 1, deviceId: 1, revokedAt: 1 });

export default mongoose.model<NativeRefreshSession>(
  "NativeRefreshSession",
  nativeRefreshSessionSchema,
);
