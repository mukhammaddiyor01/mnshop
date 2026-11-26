# Backend contract and native auth gate

## Current verified endpoints

The current API includes buyer login/signup, Google auth, `/auth/me`, buyer product/order/message/payment routes, and separate seller routes. The source routes are `src/router.ts`.

Browser authentication currently uses an HttpOnly `accessToken` cookie. The backend also accepts a Bearer token, but login does not return a token body intended for native storage.

## Required decision before mobile implementation

Define and implement, in a separate small commit series:

1. Native access-token response shape and expiry.
2. Refresh-token rotation, storage, and revocation model.
3. Browser cookie compatibility during migration.
4. Logout behavior for a lost/stolen device.
5. Authenticated API error contract and retry policy.

Until this is decided, an Expo app must not invent a token response or persist browser cookies as mobile credentials.
