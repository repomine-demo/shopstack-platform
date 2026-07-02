---
title: Checkout Subscription Flow — Acceptance Test
source_type: acceptance_flow
flow: subscription-checkout
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
---

# Acceptance Test: Subscription Checkout Flow

## Preconditions
- User is authenticated (valid JWT in Authorization header)
- ShopStack environment is running (all 5 services healthy)
- Stripe test mode is active (`STRIPE_SECRET_KEY` starts with `sk_test_`)

## Happy Path

### AC-CHECKOUT-1: Starter plan subscription succeeds
```
Given an authenticated buyer with a valid Stripe test payment method
When POST /api/payments/subscribe with body:
  { "plan": "starter", "email": "buyer@example.com" }
Then response status is 201
And response body contains:
  { "subscriptionId": "<non-empty string>", "status": "active" }
```

### AC-CHECKOUT-2: Invoice generated after subscription
```
Given a successful subscription from AC-CHECKOUT-1
When GET /api/payments/invoices
Then response status is 200
And response body contains at least one invoice with:
  { "subscriptionId": "<matching id>", "status": "paid" | "open" }
```

### AC-CHECKOUT-3: Subscription cancellation
```
Given a successful subscription from AC-CHECKOUT-1
When DELETE /api/payments/subscribe/<subscription_id>
Then response status is 200
And response body is { "cancelled": true }
```

## Error Cases

### AC-CHECKOUT-4: Invalid payment method returns 400
```
Given an authenticated buyer
When POST /api/payments/subscribe with an invalid paymentMethodId
Then response status is 400
And response body contains a non-empty "error" field with a human-readable message
```

### AC-CHECKOUT-5: Unauthenticated request returns 401
```
Given no Authorization header
When POST /api/payments/subscribe
Then response status is 401
```

### AC-CHECKOUT-6: Growth plan subscription succeeds
```
Given an authenticated buyer
When POST /api/payments/subscribe with body:
  { "plan": "growth", "email": "buyer@example.com" }
Then response status is 201
And subscriptionId is returned
```

## Performance
- `POST /api/payments/subscribe` must respond within 5 seconds under normal Stripe latency.

## Test Files
- Unit tests: `payments-service/tests/payments.test.ts`
- Gateway tests: `api-gateway/tests/test_gateway.py`
