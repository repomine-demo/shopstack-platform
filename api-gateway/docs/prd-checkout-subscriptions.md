---
title: Subscription Checkout
source_type: prd
capabilities:
  - subscription-management
  - payment-processing
  - billing
user_personas:
  - buyer
  - admin
user_flows:
  - subscription-checkout
  - invoice-management
services:
  - web-frontend
  - api-gateway
  - payments-service
routes:
  - POST /api/payments/subscribe
  - DELETE /api/payments/subscribe/<subscription_id>
  - GET /api/payments/invoices
schemas:
  - Subscription
  - Invoice
  - ChargeRequest
sensitive_data:
  - paymentMethodId
  - stripeCustomerId
  - stripeSubscriptionId
  - email
  - amountDue
  - amountPaid
evidence_files:
  - payments-service/src/routes/payments.ts
  - api-gateway/routes/payments_routes.py
  - payments-service/src/models/subscription.ts
  - web-frontend/src/services/apiClient.ts
---

# Subscription Checkout

## Overview

ShopStack's subscription checkout enables buyers to self-serve into one of three subscription tiers: Starter, Growth, or Enterprise. Checkout is handled through the web frontend, routed via the API gateway, and processed by the payments service using Stripe.

## Business Goals

- Reduce time-to-first-payment to under 3 minutes for new tenants.
- Support plan upgrades and downgrades without interrupting service.
- Give operations teams full invoice visibility.

## User Flow

1. Buyer selects a plan from the pricing page.
2. Buyer enters billing details (email, payment method).
3. Frontend calls `POST /api/payments/subscribe` via the API gateway.
4. API gateway forwards to `payments-service POST /payments/subscribe`.
5. Payments service creates a Stripe customer and subscription.
6. On success, the subscription ID is returned and the buyer sees a confirmation screen.
7. Invoices are available at `GET /api/payments/invoices`.

## Acceptance Criteria

- A new subscription is created and returns a `subscriptionId` and `status: active`.
- An invoice is generated on the Stripe side and retrievable via `GET /api/payments/invoices`.
- Failed payment returns HTTP 400 with a human-readable error message.
- Subscription cancellation via `DELETE /api/payments/subscribe/<subscription_id>` succeeds with `cancelled: true`.
- All requests through the gateway require a valid JWT (enforced by auth guard middleware).

## Sensitive Data Handling

This flow processes and stores billing-sensitive data:

| Field | Classification | Service |
|-------|----------------|---------|
| `paymentMethodId` | Payment | payments-service |
| `stripeCustomerId` | Payment | payments-service |
| `stripeSubscriptionId` | Payment | payments-service |
| `email` | PII | payments-service, auth-service |
| `amountDue` | Payment | payments-service |
| `amountPaid` | Payment | payments-service |

All Stripe credentials are stored server-side only. Payment methods are never persisted in ShopStack's own database.

## Open Questions

- Should failed subscription attempts trigger an alert to the operations runbook?
- Is a grace period needed before cancellation takes effect?
