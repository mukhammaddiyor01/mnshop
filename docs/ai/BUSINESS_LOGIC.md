# Business logic authority

| Domain | Backend authority | Client responsibility |
| --- | --- | --- |
| Identity and role | role, account status, ownership | show authorized UX only |
| Catalog | active product visibility, price, discount, stock | display normalized catalog data |
| Cart | final validation at checkout | variant selection and local draft |
| Order | one-seller order constraint, totals, shipping, state | collect request data and show result |
| Payment | prepare, confirm, provider validation, idempotency | launch provider flow and handle result |
| Fulfillment | seller ownership and allowed transitions | display permitted actions |

Clients must treat price, inventory, discount, payment, and order status as server-owned. A successful local mutation is not a completed commerce action until the backend response confirms it.

Current status values are uppercase backend enums: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, plus payment and delivery status enums. Do not rename or lowercase them in a shared contract without a backend migration decision.
