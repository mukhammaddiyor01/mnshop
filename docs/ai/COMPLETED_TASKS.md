# Completed tasks

- Documented the React Native/Expo target without creating mobile code or dependencies.
- Added agent and skill instructions for backend/mobile boundaries.
- Recorded mobile architecture, business authority, patterns, design system boundary, auth gate, security, testing, and decisions.
- Defined the unimplemented native buyer auth contract and its incremental rollout sequence.
- Added the first native-auth persistence increment: user `authVersion`, refresh-session and revoked-access-token TTL schemas, and HMAC-hashed opaque token primitives.
- Added `npm run test:native-token-primitives` for deterministic token-primitive checks; no database connection is used by that check.
- Added buyer-only `POST /auth/native/login` with runtime-allowlisted input, a safe response envelope, and no browser-cookie mutation.
- Implemented transactional `POST /auth/native/refresh`, a mock transaction check, and isolated MongoDB replica-set/HTTP verification for rotation, expiry rejection, safe responses, and cookie absence.
- Updated Mongoose from 6.2.9 to 6.13.13 and adapted service type boundaries to its stricter inference. The production-only audit reduced from 11 findings to 9; remaining dependency remediation stays separate.
- Updated Morgan from 1.11.0 to 1.12.1. The production-only audit reduced from 9 findings to 8; remaining dependency remediation stays separate.
- Updated Moment from 2.30.1 to 2.31.0. The production-only audit reduced from 8 findings to 7; remaining transitive dependency remediation stays separate.

See Git history and `NEXT_STEPS.md` for completed security commits and the mutable next-task list.
