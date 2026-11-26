const NativeAuthService = require("../src/models/NativeAuth.service").default;
const AuthService = require("../src/models/Auth.service").default;
const { UserType, UserStatus } = require("../src/libs/enums/user.enum");

process.env.NATIVE_REFRESH_TOKEN_SECRET = "native-token-check-secret";
process.env.SESSION_SECRET = "native-access-token-check-secret";

const service = new NativeAuthService();
const authService = new AuthService();
const now = new Date("2026-11-26T00:00:00.000Z");
const first = service.createRefreshTokenPair(now);
const second = service.createRefreshTokenPair(now);

if (first.token === second.token || first.token.includes(".")) {
  throw new Error("Refresh tokens must be distinct opaque values");
}

if (service.hashRefreshToken(first.token) !== first.tokenHash) {
  throw new Error("Refresh token hash is not deterministic");
}

if (first.token === first.tokenHash || first.tokenHash.length !== 64) {
  throw new Error("Raw refresh token must not be stored as its hash");
}

if (first.idleExpiresAt > first.expiresAt) {
  throw new Error("Idle expiry cannot outlive absolute expiry");
}

const accessToken = authService.createNativeAccessToken({
  _id: "507f1f77bcf86cd799439011",
  userType: UserType.BUYER,
  userStatus: UserStatus.ACTIVE,
  userNick: "buyer",
  userEmail: "buyer@example.com",
  userPassword: "must-not-be-signed",
  userPoints: 0,
  userLikes: 0,
  authVersion: 0,
});
const jwt = require("jsonwebtoken");
const claims = jwt.verify(accessToken.token, process.env.SESSION_SECRET, {
  algorithms: ["HS256"],
  audience: "mnshop-mobile",
});

if (
  claims.sub !== "507f1f77bcf86cd799439011"
  || claims.role !== UserType.BUYER
  || claims.authVersion !== 0
  || !claims.jti
  || claims.userPassword
) {
  throw new Error("Native access token claims are not safe");
}

const originalStartSession = require("mongoose").startSession;
const originalRefreshModel = service.nativeRefreshSessionModel;
const activeSession = {
  _id: "current-session",
  userId: "507f1f77bcf86cd799439011",
  deviceId: "device-1",
  deviceLabel: "Test device",
  expiresAt: new Date("2026-12-26T00:00:00.000Z"),
  idleExpiresAt: new Date("2026-12-03T00:00:00.000Z"),
  revokedAt: undefined,
  saveCalls: 0,
  async save() {
    this.saveCalls += 1;
  },
};
let createdSession;
let endedSession = false;
require("mongoose").startSession = async () => ({
  async withTransaction(callback) {
    await callback();
  },
  async endSession() {
    endedSession = true;
  },
});
service.nativeRefreshSessionModel = {
  findOne(query) {
    if (query.tokenHash !== first.tokenHash) {
      throw new Error("Refresh rotation looked up an unexpected token hash");
    }
    return {
      select() {
        return this;
      },
      session() {
        return this;
      },
      async exec() {
        return activeSession;
      },
    };
  },
  async create(records) {
    createdSession = { _id: "replacement-session", ...records[0] };
    return [createdSession];
  },
};

service.rotateRefreshSession(first.token, now)
  .then((rotation) => {
    if (
      !rotation
      || rotation.token === first.token
      || activeSession.revokedAt?.getTime() !== now.getTime()
      || activeSession.replacedBySessionId !== "replacement-session"
      || activeSession.saveCalls !== 1
      || createdSession.tokenHash === first.token
      || !endedSession
    ) {
      throw new Error("Refresh rotation did not replace the session safely");
    }
  })
  .finally(() => {
    require("mongoose").startSession = originalStartSession;
    service.nativeRefreshSessionModel = originalRefreshModel;
  })
  .then(() => console.log("Native refresh transaction checks passed"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

console.log("Native token primitive checks passed");
