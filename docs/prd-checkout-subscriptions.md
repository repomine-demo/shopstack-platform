---
title: "ShopStack — Checkout & Subscriptions PRD"
source_type: prd
capabilities:
  - subscription-checkout
  - payment-processing
  - invoice-management
user_personas:
  - shopper
  - tenant-admin
user_flows:
  - subscription-checkout
  - invoice-history
services:
  - payments-service
  - catalog-service
  - api-gateway
  - auth-service
routes:
  - POST /payments/subscribe
  - DELETE /payments/subscribe/{subscriptionId}
  - GET /payments/invoices
  - GET /catalog/products
  - GET /catalog/products/{productId}
schemas:
  - Subscription
  - Invoice
  - Product
  - InventoryRecord
sensitive_data:
  - billingAddress
  - paymentMethodId
  - subscriptionId
  - cardLastFour
evidence_files:
  - payments-service/src/routes/payments.ts
  - catalog-service/handlers/products.go
  - api-gateway/routes/payments_routes.py
---

## Goal

Allow authenticated shoppers to select a product plan, complete a subscription checkout, and view past invoices. The flow must be resilient to payment failures and provide clear recovery paths.

## User Flows

### subscription-checkout

1. Shopper browses product plans via `GET /catalog/products`.
2. Shopper selects a plan and proceeds to checkout (web-frontend `src/checkout.js`).
3. Frontend calls `POST /payments/subscribe` via api-gateway with `{ planId, paymentMethodId, billingAddress }`.
4. payments-service validates payment method with Stripe, creates a `Subscription` record, and returns `{ subscriptionId, status, nextBillingDate }`.
5. On success, api-gateway triggers a confirmation email via `catalog-service` (optional side-effect).
6. Shopper is redirected to `/account/subscriptions`.

### invoice-history

1. Authenticated shopper navigates to `/account/invoices`.
2. Frontend calls `GET /payments/invoices` (Bearer token required).
3. payments-service returns paginated `Invoice[]` sorted by `invoiceDate DESC`.

## Acceptance Criteria

- `POST /payments/subscribe` returns `201` with `{ subscriptionId, status: "active" }` on success.
- `POST /payments/subscribe` returns `402` with `{ error: "payment_failed", code }` on Stripe decline.
- `GET /payments/invoices` returns `200` with `Invoice[]`; unauthenticated callers receive `401`.
- Subscription records in the database store `paymentMethodId` encrypted at rest.
- `billingAddress` is never logged in plaintext.

## Data Sensitivity

`paymentMethodId` and `billingAddress` are PCI-DSS in-scope fields. They must be encrypted at rest and masked in logs. `subscriptionId` is a high-sensitivity identifier that links payment history to a user account.

## Out of Scope (V1)

- One-time purchase (non-subscription)
- Multi-currency support
- Refunds / cancellation flows
