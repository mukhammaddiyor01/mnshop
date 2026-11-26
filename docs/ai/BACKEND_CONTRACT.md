# Backend contract and native auth gate

## Current verified endpoints

The current API includes buyer login/signup, Google auth, `/auth/me`, buyer product/order/message/payment routes, and separate seller routes. The source routes are `src/router.ts`.

Browser authentication currently uses an HttpOnly `accessToken` cookie. The backend also accepts a Bearer token, but login does not return a token body intended for native storage.

## Native contract

The proposed native auth design is documented in [NATIVE_AUTH_CONTRACT.md](NATIVE_AUTH_CONTRACT.md). It has not been implemented. Until its staged rollout is complete, an Expo app must not invent a token response or persist browser cookies as mobile credentials.
