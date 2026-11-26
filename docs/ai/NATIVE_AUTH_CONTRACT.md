# Native authentication contract

## Status

**Proposed design, not implemented.** Existing browser authentication remains unchanged until the staged implementation below is complete. This document is the reviewable source of truth for native auth work.

## Goals

- Add React Native authentication without exposing the browser cookie to JavaScript.
- Keep role, account status, ownership, and token validation on the backend.
- Support refresh rotation, per-device logout, and all-device sign-out.
- Do not change existing browser login, Google login, or cookie response envelopes during the native rollout.

## Browser contract remains unchanged

Browser buyer auth continues to use the existing HttpOnly `accessToken` cookie. Browser state-changing calls use credentials and CSRF protections where applicable. Browser clients do not receive native refresh tokens in JSON.

## Native endpoints

New endpoints are versioned by intent, not by user-provided headers:

| Endpoint | Purpose |
| --- | --- |
| `POST /auth/native/login` | Buyer password login and device session creation |
| `POST /auth/native/google` | Verified Google credential login and device session creation |
| `POST /auth/native/refresh` | Rotate one valid refresh token and issue a new access token |
| `POST /auth/native/logout` | Revoke the supplied device refresh token and current access token ID |
| `POST /auth/native/logout-all` | Revoke all native sessions for the authenticated buyer |

`/login`, `/signup`, `/auth/google`, `/auth/me`, and `/logout` retain their current browser-compatible behavior. Native routes are buyer-only. Seller/admin native support is not part of the mobile MVP.

## Token format and lifetime

### Access token

- JWT signed with the existing server secret only after explicit key/algorithm validation is added.
- Claims: `sub` (buyer id), `role`, `authVersion`, `jti`, `aud: "mnshop-mobile"`, `iat`, and `exp`.
- Lifetime: 15 minutes.
- Sent by the client as `Authorization: Bearer <token>`.
- Never written to logs, Redux/global state snapshots, query persistence, crash reports, or analytics.

### Refresh token

- Opaque, cryptographically random value; never a JWT.
- Lifetime: 30 days, with a 7-day idle expiry.
- Stored only in Expo SecureStore on the device.
- Only a keyed hash is stored in MongoDB with buyer id, device/session id, issued/used/expiry/revoked timestamps, and a non-sensitive device label supplied by the app.
- The raw value is returned only from native login, Google login, and refresh endpoints over HTTPS. It is never put in a cookie, log, URL, or error response.

## Rotation and revocation

1. Native login creates one refresh-session record and returns access + refresh tokens.
2. Native refresh accepts a refresh token in the JSON body, finds its hash, checks expiry/revocation/idle timeout, revokes it, and atomically creates a replacement session.
3. Reuse of a revoked refresh token revokes all native sessions for that buyer and returns `401`.
4. Native logout revokes the named refresh session and places the current access token `jti` in a TTL-backed denylist until access expiry.
5. Native logout-all increments `authVersion` and revokes all native refresh sessions. Access-token verification rejects stale `authVersion` claims.

Browser cookie logout clears the browser cookie. It does not silently revoke native devices; the native logout endpoints own that responsibility.

## Responses and errors

Successful native login/refresh responses use:

```ts
{
  user: SafeBuyer,
  accessToken: string,
  accessTokenExpiresAt: string,
  refreshToken: string,
  refreshTokenExpiresAt: string
}
```

`SafeBuyer` excludes password hashes, refresh tokens, raw device metadata, and internal auth fields. Authentication failures use the existing JSON error envelope and do not reveal whether a username, refresh token, or device session exists.

## React Native responsibilities

- Keep access and refresh tokens in SecureStore.
- Rehydrate tokens before protected navigation, then call `/auth/me` with the access token.
- On a single `401`, attempt one refresh; retry the original request once only after a successful rotation.
- On refresh failure, delete both SecureStore keys and return to login.
- Never use `EXPO_PUBLIC_*` for a secret, and never attach tokens to URLs.

## Implementation sequence

1. `feat: add native token persistence` — Mongoose schemas, hashes, TTL indexes, `authVersion`, and service-only token primitives.
2. `feat: expose native auth endpoints` — controller/router request validation and safe response envelopes.
3. `fix: enforce native token revocation` — access verification, refresh reuse detection, logout, and logout-all rules.
4. `feat: add Expo auth foundation` — Expo SecureStore adapter, API client interceptor, auth query state, and only then protected routes.

Each step requires its own Markdown update and focused tests. Use an isolated test database for persistence tests; no production or private database is part of this work.
