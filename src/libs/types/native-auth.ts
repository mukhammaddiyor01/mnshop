import { Types } from "mongoose";

export interface NativeRefreshSession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  deviceId: string;
  deviceLabel?: string;
  expiresAt: Date;
  idleExpiresAt: Date;
  lastUsedAt: Date;
  revokedAt?: Date;
  replacedBySessionId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface RevokedNativeAccessToken {
  _id: Types.ObjectId;
  tokenId: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NativeRefreshTokenPair {
  token: string;
  tokenHash: string;
  expiresAt: Date;
  idleExpiresAt: Date;
}

export interface NativeLoginInput {
  userNick: string;
  userPassword: string;
  deviceId: string;
  deviceLabel?: string;
}

export interface NativeAccessToken {
  token: string;
  expiresAt: Date;
}

export interface NativeRefreshRotation extends NativeRefreshTokenPair {
  userId: Types.ObjectId;
}

export interface NativeBuyer {
  _id: Types.ObjectId;
  userNick: string;
  userEmail: string;
  userPhone?: string;
  userAddress?: string;
  userDesc?: string;
  userImage?: string;
  userPoints: number;
  userLikes: number;
}
