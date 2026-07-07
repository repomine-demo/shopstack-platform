---
title: "Checkout Screen"
source_type: design_doc
flow: subscription-checkout
screen_id: screen-checkout-form
linked_routes:
  - POST /payments/subscribe
linked_services:
  - payments-service
  - api-gateway
sensitive_fields:
  - billingAddress
  - paymentMethodId
---

## Checkout Screen

The checkout form is the conversion-critical screen in the subscription-checkout flow. It collects billing details and initiates the subscription via `POST /payments/subscribe`.

### Components

| Component | Purpose | Notes |
|---|---|---|
| `PlanSummary` | Displays selected plan name, price, billing cycle | Read-only; sourced from catalog-service |
| `BillingAddressForm` | Collects street, city, postcode, country | PII — never logged |
| `PaymentMethodInput` | Stripe Elements card input | `paymentMethodId` never touches our backend unencrypted |
| `SubscribeButton` | Submits checkout | Disabled while request is in-flight |
| `ErrorBanner` | Displays payment decline reason | Must not expose Stripe raw error codes to users |

### Behaviour

- Form validates client-side before submission (email format, required fields).
- On `402 Payment Required` from payments-service: display `"Payment declined — please check your card details."` and re-enable the form.
- On network error: display `"Something went wrong — please try again."` with a retry button.
- Successful `201` response: navigate to `screen-confirmation` with `subscriptionId` passed as query param.

### Accessibility

- All inputs have associated `<label>` elements.
- Error messages are announced via `aria-live="polite"`.
- Stripe Elements iframe has `title="Card payment details"`.
