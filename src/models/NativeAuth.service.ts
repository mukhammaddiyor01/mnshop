import { createHmac, randomBytes } from "crypto";
import mongoose, { Types } from "mongoose";
import {
  NATIVE_REFRESH_IDLE_DAYS,
  NATIVE_REFRESH_TOKEN_DAYS,
} from "../libs/config";
import {
  NativeRefreshTokenPair,
  NativeRefreshRotation,
} from "../libs/types/native-auth";
import NativeRefreshSessionModel from "../schema/NativeRefreshSession.model";
import RevokedNativeAccessTokenModel from "../schema/RevokedNativeAccessToken.model";

type CreateNativeRefreshSessionInput = {
  userId: Types.ObjectId;
  deviceId: string;
  deviceLabel?: string;
};

class NativeAuthService {
  private readonly nativeRefreshSessionModel;
  private readonly revokedNativeAccessTokenModel;

  constructor() {
    this.nativeRefreshSessionModel = NativeRefreshSessionModel;
    this.revokedNativeAccessTokenModel = RevokedNativeAccessTokenModel;
  }

  public createRefreshTokenPair(now = new Date()): NativeRefreshTokenPair {
    const token = randomBytes(48).toString("base64url");
    const expiresAt = new Date(
      now.getTime() + NATIVE_REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    );
    const idleExpiresAt = new Date(
      now.getTime() + NATIVE_REFRESH_IDLE_DAYS * 24 * 60 * 60 * 1000,
    );

    return {
      token,
      tokenHash: this.hashRefreshToken(token),
      expiresAt,
      idleExpiresAt,
    };
  }

  public hashRefreshToken(token: string): string {
    const secret = process.env.NATIVE_REFRESH_TOKEN_SECRET
      ?? process.env.SECRET_TOKEN
      ?? process.env.SESSION_SECRET;

    if (!secret) {
      throw new Error(
        "NATIVE_REFRESH_TOKEN_SECRET, SECRET_TOKEN, or SESSION_SECRET is required",
      );
    }

    return createHmac("sha256", secret).update(token).digest("hex");
  }

  public async createRefreshSession(
    input: CreateNativeRefreshSessionInput,
  ): Promise<NativeRefreshTokenPair> {
    const pair = this.createRefreshTokenPair();

    await this.nativeRefreshSessionModel.create({
      userId: input.userId,
      tokenHash: pair.tokenHash,
      deviceId: input.deviceId,
      deviceLabel: input.deviceLabel,
      expiresAt: pair.expiresAt,
      idleExpiresAt: pair.idleExpiresAt,
      lastUsedAt: new Date(),
    });

    return pair;
  }

  public async rotateRefreshSession(
    rawToken: string,
    now = new Date(),
  ): Promise<NativeRefreshRotation | null> {
    const tokenHash = this.hashRefreshToken(rawToken);
    const databaseSession = await mongoose.startSession();
    let rotation: NativeRefreshRotation | null = null;

    try {
      await databaseSession.withTransaction(async () => {
        const current = await this.nativeRefreshSessionModel
          .findOne({ tokenHash })
          .select("+tokenHash")
          .session(databaseSession)
          .exec();

        if (
          !current
          || current.revokedAt
          || current.expiresAt <= now
          || current.idleExpiresAt <= now
        ) {
          return;
        }

        const pair = this.createRefreshTokenPair(now);
        const [replacement] = await this.nativeRefreshSessionModel.create(
          [{
            userId: current.userId,
            tokenHash: pair.tokenHash,
            deviceId: current.deviceId,
            deviceLabel: current.deviceLabel,
            expiresAt: pair.expiresAt,
            idleExpiresAt: pair.idleExpiresAt,
            lastUsedAt: now,
          }],
          { session: databaseSession },
        );

        current.revokedAt = now;
        current.replacedBySessionId = replacement._id;
        current.lastUsedAt = now;
        await current.save({ session: databaseSession });

        rotation = {
          ...pair,
          userId: current.userId,
        };
      });

      return rotation;
    } finally {
      await databaseSession.endSession();
    }
  }

  public async revokeAccessToken(
    tokenId: string,
    userId: Types.ObjectId,
    expiresAt: Date,
  ): Promise<void> {
    await this.revokedNativeAccessTokenModel
      .findOneAndUpdate(
        { tokenId },
        { $setOnInsert: { tokenId, userId, expiresAt } },
        { upsert: true, new: false, setDefaultsOnInsert: true },
      )
      .exec();
  }

  public async isAccessTokenRevoked(tokenId: string): Promise<boolean> {
    const revoked = await this.revokedNativeAccessTokenModel
      .exists({ tokenId })
      .exec();

    return Boolean(revoked);
  }
}

export default NativeAuthService;
