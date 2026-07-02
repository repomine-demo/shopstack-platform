---
title: Security and Data Classification
source_type: prd
capabilities:
  - data-governance
  - security-compliance
services:
  - auth-service
  - payments-service
  - api-gateway
  - web-frontend
  - catalog-service
sensitive_data:
  - email
  - hashed_password
  - full_name
  - paymentMethodId
  - stripeCustomerId
  - stripeSubscriptionId
  - access_token
  - refresh_token
  - token_hash
  - amountDue
  - amountPaid
---

# Security and Data Classification

## Classification Tiers

### PII (Personally Identifiable Information)
Fields that identify a natural person directly. Governed by GDPR and CCPA.

| Field | Service | Model | Notes |
|-------|---------|-------|-------|
| `email` | auth-service | User | Primary identifier; also used in payments |
| `full_name` | auth-service | User | Stored at registration |
| `email` | payments-service | Subscription | Copied from auth at checkout |

**Handling rules:** Never log. Mask in error messages. Subject to right-to-erasure requests.

---

### Payment / Billing
Fields related to financial transactions. PCI-DSS adjacent; stored via Stripe only.

| Field | Service | Model | Notes |
|-------|---------|-------|-------|
| `paymentMethodId` | payments-service | ChargeRequest | Stripe token — never a raw card number |
| `stripeCustomerId` | payments-service | Subscription | Opaque Stripe ID |
| `stripeSubscriptionId` | payments-service | Subscription | Opaque Stripe ID |
| `amountDue` | payments-service | Invoice | Financial record |
| `amountPaid` | payments-service | Invoice | Financial record |

**Handling rules:** Raw card numbers are never stored or transmitted through ShopStack. Stripe handles PCI compliance. Stripe IDs are internal references only.

---

### Auth / Session
Credentials and session tokens. Compromise allows account takeover.

| Field | Service | Model | Notes |
|-------|---------|-------|-------|
| `hashed_password` | auth-service | User | bcrypt hash — never plaintext |
| `access_token` | auth-service / frontend | — | JWT, 15-min TTL |
| `refresh_token` | auth-service / frontend | — | Opaque, 30-day TTL |
| `token_hash` | auth-service | RefreshToken | SHA-256 hash of refresh token |

**Handling rules:** Never log tokens. Access tokens expire in 15 minutes. Refresh tokens are revocable. Passwords are hashed with bcrypt (work factor 12+).

---

### Operational
Internal data used for system operation. Not directly sensitive but should not be exposed externally.

| Field | Service | Notes |
|-------|---------|-------|
| `tenant_id` | auth-service, payments-service | Isolation boundary — all queries are tenant-scoped |
| `user_id` | auth-service, payments-service | Internal user reference |

---

## High-Risk Flows

1. **Subscription Checkout** — touches PII (email) + Payment (paymentMethodId, stripeCustomerId). Requires auth guard on gateway.
2. **User Authentication** — touches Auth/Session (access_token, refresh_token, hashed_password). Highest-risk flow.
3. **Invoice Retrieval** — touches Payment (amountDue, amountPaid). Must be tenant-scoped.

## Agent Edit Guidelines

Before editing any file in auth-service or payments-service, an agent MUST:
1. Run the auth and payments acceptance tests.
2. Verify that sensitive fields are not added to log statements.
3. Confirm that tenant_id scoping is preserved in all queries.
