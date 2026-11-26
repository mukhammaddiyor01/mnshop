# Decisions

## 2026-11-26: documentation before mobile scaffolding

Expo/React Native architecture, libraries, and security gates are documented before creating `apps/mobile` or a workspace. Reason: backend/mobile authentication contract is incomplete, and the existing backend and CRA storefront are separate repositories.

## 2026-11-26: small logical commits

Every implementation or documentation unit is committed separately with only `fix: <description>` or `feat: <description>`. This preserves reviewable history and keeps work within the incremental-change limit.

## 2026-11-26: platform-independent sharing only

Potential shared packages are limited to verified types, pure validation, mappings, domain rules, and design tokens. Platform UI and storage remain separate.

## 2026-11-26: native auth is additive and device-scoped

Native buyer authentication will use separate `/auth/native/*` endpoints with a short-lived JWT, opaque rotation refresh token, per-device revocation, and an all-device auth version. Browser cookie behavior remains compatible during rollout. See `NATIVE_AUTH_CONTRACT.md`; implementation is intentionally split into small commits.
