# MNShop agent guide

## Scope and source of truth

This repository is the MNShop TypeScript/Express backend and EJS admin application. The existing buyer and seller web apps live in the separate `mnshop-react` repository. No Expo or React Native application exists in this checkout yet.

Read these files before changing code:

1. `README.md`
2. `NEXT_STEPS.md`
3. `SKILLS.md`
4. the relevant documents under `docs/ai/`
5. the target route, controller, service, schema, and existing test/check before editing

`docs/ai/DECISIONS.md` is the architecture decision record. `NEXT_STEPS.md` is the single mutable handoff list; `docs/ai/NEXT_STEPS.md` only points to it.

## Boundaries

- Backend owns roles, ownership, price, discount, stock, order state, payment state, and upload policy.
- Web and mobile own display state, form drafts, navigation, and non-authoritative cached data.
- Never share DOM, MUI, SCSS, EJS, React Native UI, or platform storage code across clients.
- Future shared packages may contain pure TypeScript contracts, validation, mapping, and tokens only after the contract is verified.
- Do not use private `.env`, database, payment provider, deployment, production accounts, or uploads outside the authorized task.

## Change discipline

- Begin with `git status --short`, then read the applicable docs and code.
- Preserve user changes and do not reset, delete, merge, or migrate unrelated work.
- Make one logical change per commit. Subjects must be exactly `fix: <description>` or `feat: <description>`.
- Update the relevant Markdown handoff in the same logical change.
- Run the narrowest meaningful check first, then the affected typecheck/build. Report build, API, browser, and device outcomes separately.
- Do not call a file or package “working” solely because it exists.

## Mobile gate

Before creating `apps/mobile` or adding Expo dependencies, confirm the native auth contract in `docs/ai/BACKEND_CONTRACT.md`: token delivery, refresh/revocation, browser-cookie compatibility, and logout. SecureStore is required for mobile secrets; do not place secrets in `EXPO_PUBLIC_*` variables.
