# Testing matrix

| Change | Required evidence |
| --- | --- |
| Backend route/service | typecheck/build and focused API or middleware check |
| Admin session/CSRF | `npm run test:admin-csrf`, build, browser check when available |
| Native token primitives | `npm run test:native-token-primitives`, typecheck; later add an isolated MongoDB persistence test |
| Expo feature | TypeScript/lint/test plus relevant Android/iOS/device check |
| Checkout/payment | backend validation and provider-safe integration check; do not use production credentials without authorization |

Report actual results separately. A backend build does not validate web UI, Expo bundle, Android, iOS, or a physical device.
