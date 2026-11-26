# History

## 2026-11-26

Added documentation and agent guidance for a future Expo/React Native buyer application. No Expo dependency, mobile source, workspace migration, API behavior, database, payment provider, or deployment changed.

Defined the additive native buyer authentication contract: separate endpoints, short-lived access JWTs, opaque rotation refresh tokens, and device/all-device revocation. This is documentation only; no API or database behavior changed.

Implemented the first native-auth persistence building block: an `authVersion` field, refresh-session and revoked-access-token TTL models, and HMAC-hashed opaque refresh-token generation. No native route, browser auth behavior, database connection, or Expo code changed.

Added `POST /auth/native/login` for active password-authenticated buyers. It emits a minimal HS256 access token with an explicit mobile audience and an opaque refresh token, while keeping browser cookie login unchanged. Google login, refresh rotation, native bearer verification, and logout remain unimplemented.

Implemented `POST /auth/native/refresh` as a transaction: a valid, current refresh session is revoked and replaced before a new safe response is returned. The focused check uses a mocked transaction only because no isolated MongoDB service is available; MongoDB transaction and HTTP-boundary verification remain open.
