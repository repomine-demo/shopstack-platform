---
title: Checkout Screen
source_type: design_doc
flow: subscription-checkout
screen: CheckoutForm
linked_routes:
  - POST /api/payments/subscribe
  - GET /api/payments/invoices
linked_services:
  - web-frontend
  - api-gateway
  - payments-service
linked_schemas:
  - Subscription
  - Invoice
linked_frontend_file: web-frontend/src/services/apiClient.ts
sensitive_fields:
  - email
  - paymentMethodId
---

# Checkout Screen — Subscription Checkout

## Screen Purpose

The checkout screen collects billing information from the buyer and initiates a subscription via the payments service. It is the highest-risk screen in the ShopStack product because it captures payment and PII data.

## Components

### EmailInput
- Field: `email` (PII)
- Sent as part of the subscription request body to `POST /api/payments/subscribe`

### PaymentMethodInput
- Field: `paymentMethodId` (Payment sensitive)
- This is a Stripe token, never a raw card number
- Sent to `POST /api/payments/subscribe` → payments-service → Stripe

### BillingAddressForm
- Fields: `billingName`, `addressLine1`, `city`, `country`, `postalCode`
- Included in the subscription request for billing records

### SubscribeButton
- Submits the form to `POST /api/payments/subscribe` via `apiClient.ts`
- Shows loading state during processing
- On success: navigates to CheckoutConfirmation screen with `subscriptionId`

## Data Flow

```
CheckoutForm (web-frontend)
  → apiClient.ts: POST /api/payments/subscribe
  → api-gateway/routes/payments_routes.py: POST /api/payments/subscribe
  → payments-service/src/routes/payments.ts: POST /payments/subscribe
  → stripeService.ts: createCustomer() + createSubscription()
  → Subscription model (subscriptionId, status)
```

## Error States

- HTTP 400: Payment failed (Stripe error) — display `err.message` to user
- HTTP 401: Auth token expired — redirect to login
- HTTP 503: payments-service unreachable — generic error message

## Acceptance Test Reference

See `tests/acceptance/checkout-subscription-flow.md`
