# MNShop security hardening handoff

## Working state

- Repository source: `/Users/mukhammaddiyor/Desktop/Projects/MNShop`
- Worktree: `/Users/mukhammaddiyor/Documents/ChatGPT/Mobile Projects/work/mnshop-security`
- Branch: `codex/mnshop-security-hardening`
- Base: `466959c`
- Private `.env`, database, payment provider, deployment, browser, and device were not used.

## Completed commits

1. `5750218 fix: restrict public signup roles`
   - Public signup accepts an explicit buyer field allowlist.
   - Buyer creation forces `BUYER` and `ACTIVE` in the service layer.
   - Password hash, auth nickname, and seller signup body logs were removed.

2. `7572167 fix: validate image uploads`
   - Upload directories are allowlisted.
   - JPEG, PNG, and WebP are accepted with server-selected extensions.
   - Each image is limited to 5 MB.

3. `1eead5f fix: reconcile paid order retries`
   - Repeated successful payment confirmation repairs an order whose payment status update previously failed.
   - A paid payment cannot be confirmed with a different payment key.
   - Toss failure logging keeps only HTTP status and provider error code.

4. `04e3227 fix: redact sensitive request logs`
   - Access logs omit query strings.
   - Buyer, seller, and admin signup errors do not print private database error values.

All four committed stages passed `tsc --noEmit --incremental false`.

5. `fix: harden admin sessions and csrf`

- secure session cookie flags, `resave: false`, and `saveUninitialized: false`;
- security headers and one-proxy trust setting;
- session regeneration after admin login;
- one CSRF middleware for every unsafe admin request;
- CSRF fields for login, settings, and logout forms;
- CSRF headers for admin product, seller, and user fetch requests;
- admin logout changed from `GET` to `POST`.

- TypeScript no-emit check, production build, diff whitespace check, and direct CSRF middleware checks passed.
- Browser and production proxy behavior have not been tested.

## Remaining findings

1. Define the native auth contract before changing responses:
   - access token delivery for mobile;
   - refresh token rotation and storage;
   - logout/revocation semantics;
   - SecureStore/Android Keystore ownership in the mobile app;
   - browser cookie behavior must remain compatible.
2. Add focused HTTP-boundary tests for rejected privileged signup fields, invalid upload MIME/size, payment retry reconciliation, missing/invalid admin CSRF, and admin session regeneration. Use an isolated test database if persistence is exercised.
3. Re-run backend typecheck/build after each small commit. Record API, browser, and device results separately; file presence is not runtime verification.

## Resume command

Start by reading this file and running:

```bash
git status --short
git diff --check
git diff
```

Preserve the existing commits and do not mix native auth work into a different security change.
