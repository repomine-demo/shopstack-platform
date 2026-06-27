# payments-service

Stripe-powered subscription billing and invoicing for ShopStack.

**Language:** TypeScript / Node.js + Express  
**Port:** 8002

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/payments/subscribe` | Create Stripe subscription for a tenant |
| DELETE | `/payments/subscribe/:id` | Cancel subscription at period end |
| POST | `/payments/charge` | One-off charge |
| GET | `/payments/invoices` | List invoices for current tenant |
| POST | `/payments/webhook` | Stripe webhook receiver |
| GET  | `/health` | Health check |

## Service dependencies

- **auth-service** — token verification on every authenticated request
- **Stripe** — all billing operations

## Known gaps

- Webhook handlers (`/payments/webhook`) have **zero test coverage**
- No retry logic on failed invoice payments
