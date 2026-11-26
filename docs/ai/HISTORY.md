# History

## 2026-11-26

Added documentation and agent guidance for a future Expo/React Native buyer application. No Expo dependency, mobile source, workspace migration, API behavior, database, payment provider, or deployment changed.

Defined the additive native buyer authentication contract: separate endpoints, short-lived access JWTs, opaque rotation refresh tokens, and device/all-device revocation. This is documentation only; no API or database behavior changed.

Implemented the first native-auth persistence building block: an `authVersion` field, refresh-session and revoked-access-token TTL models, and HMAC-hashed opaque refresh-token generation. No native route, browser auth behavior, database connection, or Expo code changed.

Added `POST /auth/native/login` for active password-authenticated buyers. It emits a minimal HS256 access token with an explicit mobile audience and an opaque refresh token, while keeping browser cookie login unchanged. Google login, refresh rotation, native bearer verification, and logout remain unimplemented.

Implemented `POST /auth/native/refresh` as a transaction: a valid, current refresh session is revoked and replaced before a new safe response is returned. A temporary isolated MongoDB replica set and localhost HTTP server verified successful rotation, absolute/idle expiry rejection, safe responses, and cookie absence; no private database was used.

The production-only dependency audit found existing runtime advisories (11 total, including 2 critical). The audit resulted in a documented, separate remediation gate; no broad or forced dependency upgrade was applied during native-refresh verification.

Updated direct Mongoose from 6.2.9 to 6.13.13, the audit-provided compatible fix. Service return casts make the pre-existing runtime schemas explicit to the newer Mongoose TypeScript inference. Native refresh integration and build checks passed; the production-only audit reduced to 9 findings (1 critical, 3 high, 5 moderate).

Updated direct Morgan from 1.11.0 to 1.12.1, the audit-provided compatible fix for log injection advisories. Typecheck and build passed; the production-only audit reduced to 8 findings (1 critical, 3 high, 4 moderate).

Updated direct Moment from 2.30.1 to 2.31.0, the audit-provided compatible fix for the locale path traversal advisory. Native refresh integration and build checks passed; the production-only audit reduced to 7 findings (1 critical, 3 high, 3 moderate).

Updated the Express-compatible transitive `proxy-addr` resolution from 2.0.7 to 2.0.8, which removes the critical IP-spoofing advisory without a framework migration. Native refresh integration and build checks passed; the production-only audit reduced to 6 findings (0 critical, 3 high, 3 moderate).

Updated the Express-compatible transitive `body-parser` resolution from 1.20.6 to 1.20.9, which removes the high-severity compressed-request DoS advisory without a framework migration. Native refresh integration and build checks passed; the production-only audit reduced to 5 findings (0 critical, 2 high, 3 moderate).
