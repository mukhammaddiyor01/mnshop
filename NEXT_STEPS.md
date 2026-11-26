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

- TypeScript no-emit check, production build, diff whitespace check, and direct CSRF middleware checks passed. Re-run the CSRF check with `npm run test:admin-csrf`.
- Browser and production proxy behavior have not been tested.

6. `feat: add mobile architecture guides`

- Added `AGENTS.md`, `SKILLS.md`, `skills/mnshop-mobile-development/SKILL.md`, and the `docs/ai/` source-of-truth set.
- Documented Expo as a future target only; no mobile code, dependency, workspace migration, API behavior, database, payment provider, or deployment changed.

7. `feat: add native token persistence`

- Added `authVersion` plus refresh-session and revoked-access-token TTL schemas.
- Added HMAC-hashed opaque refresh-token generation and `npm run test:native-token-primitives`.
- The primitive check, TypeScript no-emit check, and diff whitespace check passed.
- No database connection, native HTTP endpoint, browser auth behavior, or Expo code was exercised or changed.

8. `feat: add native login endpoint`

- Added buyer-only `POST /auth/native/login` with allowlisted runtime input and a safe JSON token response.
- Browser `/login` and cookie behavior remain unchanged; the native endpoint does not set a cookie.
- Native credential failures intentionally use one `401` response to avoid account-type and username enumeration.
- The token primitive check, TypeScript no-emit check, production build, and diff whitespace check passed.
- No MongoDB connection, HTTP integration test, browser, Expo, Android, iOS, or device check was run.

9. `feat: add native refresh endpoint`

- Added `POST /auth/native/refresh`, which transactionally validates, revokes, and replaces one refresh-session record before returning the existing safe token envelope.
- The focused mock transaction check, TypeScript no-emit check, production build, and diff whitespace check passed.
- No isolated MongoDB replica set or real HTTP request was available, so transaction behavior and route responses are not accepted as runtime-verified.

10. `fix: verify native refresh rotation`

- Added `mongodb-memory-server` as a test-only development dependency and `npm run test:native-refresh`.
- A temporary replica set and localhost Express server verified successful rotation, absolute/idle expiry rejection, safe response fields, raw-token absence, and no `Set-Cookie` header.
- No private/application database, browser, Expo, Android, iOS, or device was used.

11. `fix: update mongoose security patch`

- Updated Mongoose from `6.2.9` to the compatible `6.13.13` audit-fix release.
- Adapted only service return-type boundaries to Mongoose's stricter TypeScript inference; business behavior and schema values are unchanged.
- Native refresh integration, token primitive checks, TypeScript no-emit, and production build passed.
- Production-only audit improved from 11 findings (2 critical, 3 high, 6 moderate) to 9 (1 critical, 3 high, 5 moderate). The remaining runtime dependency findings are separate work.

12. `fix: update morgan security patch`

- Updated Morgan from `1.11.0` to the compatible `1.12.1` audit-fix release.
- Token primitive check, TypeScript no-emit, and production build passed.
- Production-only audit improved from 9 findings (1 critical, 3 high, 5 moderate) to 8 (1 critical, 3 high, 4 moderate). The remaining runtime dependency findings are separate work.

13. `fix: update moment security patch`

- Updated Moment from `2.30.1` to the compatible `2.31.0` audit-fix release.
- Native refresh integration, token primitive checks, TypeScript no-emit, and production build passed.
- Production-only audit improved from 8 findings (1 critical, 3 high, 4 moderate) to 7 (1 critical, 3 high, 3 moderate). The remaining transitive runtime dependency findings require a separate dependency-path review.

14. `fix: update proxy addr security patch`

- Updated Express's compatible transitive `proxy-addr` resolution from `2.0.7` to `2.0.8`; no framework migration or direct manifest dependency was added.
- Native refresh integration, token primitive checks, TypeScript no-emit, and production build passed.
- Production-only audit improved from 7 findings (1 critical, 3 high, 3 moderate) to 6 (0 critical, 3 high, 3 moderate). The remaining transitive dependency findings require separate review.

15. `fix: update body parser security patch`

- Updated Express's compatible transitive `body-parser` resolution from `1.20.6` to `1.20.9`; no framework migration or direct manifest dependency was added.
- Native refresh integration, token primitive checks, TypeScript no-emit, and production build passed.
- Production-only audit improved from 6 findings (0 critical, 3 high, 3 moderate) to 5 (0 critical, 2 high, 3 moderate). The remaining transitive dependency findings require separate review.

## Ordered rollout

Work through these gates in order. Each numbered item is a separate small `feat:` or `fix:` commit with a Markdown update. Do not start a later gate because an earlier file merely exists.

### Gate 0 — Runtime dependency security

1. `fix: review transitive runtime dependencies` — trace each remaining production-only audit path, starting with the high-severity MongoDB `ip-address` path, then apply only compatible, separately verified patches. Re-run focused checks, typecheck/build, and a fresh production-only audit after each change. Do not use `npm audit fix --force` or perform a framework migration without a separate review.

### Gate 1 — Native auth correctness and privacy

2. `fix: detect native refresh reuse` — revoke all native sessions for the buyer if a revoked token is reused. Test the reuse path with an isolated database.
3. `fix: enforce native bearer verification` — validate HS256, audience, expiry, subject, role, `authVersion`, and revoked `jti` before native protected routes use a bearer identity.
4. `feat: add native logout endpoints` — support per-device and all-device logout without changing browser cookie logout. Test revocation and `authVersion` invalidation.
5. `feat: add native auth boundary tests` — add isolated HTTP tests for malformed input, buyer-only access, credential enumeration resistance, refresh rotation/reuse, logout, and secret-free responses.

### Gate 2 — Contract and backend readiness

6. `fix: define mobile api error contract` — document stable, non-sensitive error codes and the safe DTO allowlists actually returned by mobile routes.
7. `feat: add verified mobile catalog contract` — audit and document only the existing catalog/search/filter/product-detail endpoints and pagination; do not invent fields or business rules.
8. `feat: add verified mobile commerce contract` — audit order, checkout, payment, history, and profile routes. Preserve backend price/stock/discount/payment authority and provider boundaries.
9. `fix: add focused backend security checks` — cover privileged signup fields, uploads, payment retry reconciliation, admin CSRF, and session regeneration with focused checks.

### Gate 3 — Expo foundation, after Gates 1–2 pass

10. `feat: add Expo app foundation` — create `apps/mobile` only after the backend gates; add Expo managed TypeScript, Router, SecureStore, and the smallest supported native dependencies.
11. `feat: add mobile auth client` — SecureStore adapter, one-refresh retry policy, auth view-model/controllers, and login/signup/profile views. Never persist secrets in query cache or logs.
12. `feat: add mobile catalog` — catalog, search/filter, product detail, loading/empty/error states, and verified DTO mapping.
13. `feat: add mobile cart checkout` — local cart draft only; server-confirmed checkout/payment/order states; no card-data proxying.
14. `feat: add mobile order history` — history and profile routes based only on verified contracts.

### Cross-cutting acceptance gates

- Privacy: request logs, errors, analytics, crash reports, screenshots, and query caches exclude passwords, access/refresh tokens, payment keys, addresses, phone numbers, and private order data unless strictly required by a reviewed backend response.
- Security: mobile secrets stay in SecureStore; `EXPO_PUBLIC_*` is public-only; API validates all authorization and commerce values; dependency additions are minimal and documented.
- Logic: the backend is final authority for role, account status, ownership, price, discount, stock, total, payment, and order status. Mobile renders confirmed server state.
- Verification: record typecheck/build, isolated API/database, browser, Expo bundle, Android, iOS, and device results independently. A passing backend build is not mobile verification.
- Design: preserve adapted MVC: view -> hook/use case -> typed service -> API client -> backend. Share only pure contracts, validation, mappings, and tokens; never DOM, EJS, SCSS, MUI, native UI, or storage code.

## Resume command

Start by reading this file and running:

```bash
git status --short
git diff --check
git diff
```

Preserve the existing commits and do not mix native auth work into a different security change. The next implementation task is Gate 0.1: `fix: update vulnerable runtime dependencies`.
