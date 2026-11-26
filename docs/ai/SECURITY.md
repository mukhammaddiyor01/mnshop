# Security rules

- SecureStore is the only planned client storage for mobile auth secrets. Native access and refresh behavior is specified in `NATIVE_AUTH_CONTRACT.md`.
- Never log passwords, tokens, payment keys, private customer data, or request variables.
- `EXPO_PUBLIC_*` variables contain public configuration only.
- Backend validates roles, ownership, upload type/size/path, price, stock, discount, totals, payment results, and order state transitions.
- Browser cookie mutations require CSRF protection. Native bearer mutations require the staged token rotation and revocation contract.
- Payment card data must stay inside an approved provider flow; it is not stored or proxied by the mobile app.
