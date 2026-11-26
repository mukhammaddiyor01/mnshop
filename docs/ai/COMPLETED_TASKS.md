# Completed tasks

- Documented the React Native/Expo target without creating mobile code or dependencies.
- Added agent and skill instructions for backend/mobile boundaries.
- Recorded mobile architecture, business authority, patterns, design system boundary, auth gate, security, testing, and decisions.
- Defined the unimplemented native buyer auth contract and its incremental rollout sequence.
- Added the first native-auth persistence increment: user `authVersion`, refresh-session and revoked-access-token TTL schemas, and HMAC-hashed opaque token primitives.
- Added `npm run test:native-token-primitives` for deterministic token-primitive checks; no database connection is used by that check.

See Git history and `NEXT_STEPS.md` for completed security commits and the mutable next-task list.
