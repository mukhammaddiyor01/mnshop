const NativeAuthService = require("../src/models/NativeAuth.service").default;

process.env.NATIVE_REFRESH_TOKEN_SECRET = "native-token-check-secret";

const service = new NativeAuthService();
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

console.log("Native token primitive checks passed");
