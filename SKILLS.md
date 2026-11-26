# MNShop development skills

## `mnshop-mobile-development`

Location: `skills/mnshop-mobile-development/SKILL.md`

Use this guide when planning or implementing the Expo/React Native buyer app, shared pure contracts, mobile auth, checkout, or native validation. It complements the backend rules in `AGENTS.md` and does not authorize a monorepo migration by itself.

## Existing backend workflow

Use the repository’s Express patterns: route -> controller -> service -> schema. Keep authorization and business rules in the backend. Reuse the existing `npm run build` and `npm run test:admin-csrf` checks when their areas change.

## Skill selection rule

- Use `nodejs-express` for Express routes, middleware, authentication, uploads, payments, and API behavior.
- Use `mnshop-mobile-development` for Expo/React Native organization and mobile boundaries.
- Read this file, `AGENTS.md`, and relevant `docs/ai` material before implementation.
