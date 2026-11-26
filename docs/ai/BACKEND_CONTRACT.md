# Backend contract and native auth gate

## Current verified endpoints

The current API includes buyer login/signup, Google auth, `/auth/me`, buyer product/order/message/payment routes, and separate seller routes. The source routes are `src/router.ts`.

Browser authentication currently uses an HttpOnly `accessToken` cookie. The backend also accepts a Bearer token, but login does not return a token body intended for native storage.

## Native contract

The staged native auth design is documented in [NATIVE_AUTH_CONTRACT.md](NATIVE_AUTH_CONTRACT.md). `POST /auth/native/login` and `POST /auth/native/refresh` return a safe access/refresh envelope without setting a cookie. Refresh rotation is implemented but still awaiting isolated MongoDB and HTTP verification. Logout, Google login, refresh-reuse handling, and native bearer verification are not implemented. Until those stages are complete, an Expo app must not invent additional token behavior or persist browser cookies as mobile credentials.
