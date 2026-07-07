---
title: "Acceptance Tests — Checkout & Subscription Flow"
source_type: acceptance_flow
flow: subscription-checkout
services:
  - payments-service
  - catalog-service
  - api-gateway
routes:
  - POST /payments/subscribe
  - DELETE /payments/subscribe/{subscriptionId}
  - GET /payments/invoices
  - GET /catalog/products
---

## Checkout & Subscription Flow — Acceptance Tests

### AC-CHECKOUT-1: Happy path subscription

**Given** an authenticated shopper with a valid Stripe test card  
**When** they POST to `/payments/subscribe` with `{ planId: "pro-monthly", paymentMethodId: "pm_card_visa", billingAddress: {...} }`  
**Then** the response is `201 Created` with `{ subscriptionId, status: "active", nextBillingDate }`  
**And** a `Subscription` record exists in the database with `status = "active"`

### AC-CHECKOUT-2: Payment declined

**Given** an authenticated shopper with a Stripe declined test card (`pm_card_chargeDeclined`)  
**When** they POST to `/payments/subscribe`  
**Then** the response is `402 Payment Required` with `{ error: "payment_failed", code: "card_declined" }`  
**And** no `Subscription` record is created  
**And** `paymentMethodId` does not appear in any server log

### AC-CHECKOUT-3: Unauthenticated subscribe attempt

**Given** a request with no `Authorization` header  
**When** they POST to `/payments/subscribe`  
**Then** the response is `401 Unauthorized`

### AC-CHECKOUT-4: Cancel subscription

**Given** an active subscription with `subscriptionId = "sub_001"`  
**When** a DELETE to `/payments/subscribe/sub_001` is made by the subscription owner  
**Then** the response is `204 No Content`  
**And** the `Subscription` record has `status = "cancelled"`

### AC-CHECKOUT-5: Cancel subscription — not owner

**Given** a subscription owned by user A  
**When** user B sends DELETE to `/payments/subscribe/<sub_id>`  
**Then** the response is `404 Not Found` (not 403, to avoid enumeration)

### AC-CHECKOUT-6: Invoice list

**Given** an authenticated user with two invoices  
**When** they GET `/payments/invoices`  
**Then** the response is `200 OK` with `{ invoices: [Invoice, Invoice], total: 2 }` sorted by `invoiceDate DESC`

### AC-CHECKOUT-7: Invoice list unauthenticated

**Given** a request with no `Authorization` header  
**When** they GET `/payments/invoices`  
**Then** the response is `401 Unauthorized`

### AC-CHECKOUT-8: billingAddress not in logs

**Given** a successful subscription creation  
**When** the payments-service log is inspected  
**Then** `billingAddress` and `paymentMethodId` must not appear in any log line
