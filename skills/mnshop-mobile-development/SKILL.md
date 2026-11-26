---
name: mnshop-mobile-development
description: Plan and implement MNShop Expo React Native buyer features while preserving backend authority, web/mobile boundaries, and small-commit workflow.
---

# MNShop mobile development

## Before work

Read `AGENTS.md`, `SKILLS.md`, `docs/ai/ARCHITECTURE.md`, `BUSINESS_LOGIC.md`, `BACKEND_CONTRACT.md`, `SECURITY.md`, `TESTING.md`, and `NEXT_STEPS.md`. Check Git status before every change.

No Expo app or shared workspace exists yet. Do not create one until the task explicitly authorizes that next step and the native auth contract is decided.

## Target structure after approval

```text
apps/mobile/
  app/                 Expo Router route screens
  src/features/        feature model, hooks/controllers, and views
  src/shared/          native components and platform adapters
  src/services/        API client boundary
  src/store/           server-cache and UI state configuration
packages/
  api-types/           verified DTOs and enums only
  validation/          pure Zod schemas shared by clients
  domain/              pure commerce calculations and mapping only
  design-tokens/       colors, spacing, typography values only
```

## MVC adapted for React Native

- Model: API DTOs, normalized domain entities, pure validation and mapping.
- Controller: feature hooks, use cases, query/mutation orchestration, navigation decisions.
- View: Expo Router screens and native components; no API endpoint strings or business calculations.

Components must call feature hooks or view models. Hooks call typed services. Services call the API client. The backend remains final authority for prices, inventory, discounts, payment, and authorization.

## Approved baseline, not installed dependencies

Choose only when the Expo app is authorized and add each group in its own `feat:` commit:

- Expo managed workflow, TypeScript, Expo Router, `react-native-safe-area-context`, `react-native-screens`, gesture handler, and Reanimated.
- TanStack Query for server cache and request lifecycle.
- React Hook Form plus Zod for local form validation.
- Expo SecureStore for mobile auth secrets.
- Expo Image and FlashList only where product image/list performance requires them.

Do not add Redux, Zustand, a UI kit, payment SDK, notifications, analytics, or error reporting merely because they are popular. A concrete feature and documented decision must justify each one.

## Security and checkout

- Store mobile tokens only in SecureStore; never AsyncStorage, logs, Redux, query cache, screenshots, or crash metadata.
- `EXPO_PUBLIC_*` values are public endpoint/config values only.
- Do not trust client price, discount, stock, seller ID, or order state.
- Preserve backend payment confirmation and idempotency behavior; do not create a client-side “paid” state before the server confirms it.
- Do not send card data through this API. Provider SDK selection needs its own approved decision.

## Commit and verification

Each logical change needs a separate `fix: <description>` or `feat: <description>` commit and a Markdown update. Run TypeScript/lint/unit checks for affected code. State whether Android/iOS/device checks were actually run; do not infer them from a successful web or backend build.
