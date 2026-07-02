---
title: ShopStack Customer Personas
source_type: prd
capabilities:
  - multi-tenant-commerce
user_personas:
  - buyer
  - admin
  - tenant-owner
services:
  - web-frontend
  - auth-service
---

# Customer Personas

## Buyer

**Who:** End customer of a ShopStack tenant. Shops for products, subscribes to plans, manages their account.

**Flows:**
- Login / Register
- Browse product catalog
- Add to cart, checkout
- Subscribe to a paid plan
- View invoices

**Sensitive data they provide:** email, payment method, billing address.

**Key frustration:** Checkout failures with unhelpful error messages. Subscription status not visible after purchase.

---

## Tenant Admin

**Who:** Business owner or operations lead who manages a ShopStack tenant. Sets up the store, manages inventory, monitors orders.

**Flows:**
- Login with admin role
- Manage product catalog
- View all subscriptions and invoices
- Monitor service health

**Sensitive data they access:** customer email list, invoice amounts, subscription statuses.

**Key frustration:** No direct visibility into payment failures or subscription churn.

---

## Tenant Owner

**Who:** The person who registered the ShopStack tenant and holds billing responsibility. Often the same as Admin for smaller teams.

**Flows:**
- Register a new tenant
- Manage subscription plan
- Cancel or upgrade subscription

**Sensitive data they provide:** full business name, payment method, billing address.

**Key concern:** Subscription continuity and data portability if they decide to leave ShopStack.
