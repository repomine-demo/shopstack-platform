---
title: Operational Runbook
source_type: runbook
services:
  - api-gateway
  - auth-service
  - payments-service
  - catalog-service
  - web-frontend
---

# ShopStack Operational Runbook

## Service Dependency Map

```
web-frontend
    └── api-gateway (port 5000)
            ├── auth-service (port 8001)
            ├── payments-service (port 3001)
            └── catalog-service (port 8080)
```

All external traffic enters through `api-gateway`. No service is directly reachable from outside.

## Health Check Endpoints

| Service | Health URL | Expected Response |
|---------|-----------|-------------------|
| api-gateway | GET /health | `{"status": "ok"}` |
| auth-service | GET /health | `{"status": "ok"}` |
| payments-service | GET /health | `{"status": "ok"}` |
| catalog-service | GET /health | `{"status": "ok"}` |

## On-Call Runbook

### Symptom: Subscriptions failing at checkout

1. Check api-gateway logs for `POST /api/payments/subscribe` errors.
2. Check payments-service logs for Stripe API errors.
3. Verify `STRIPE_SECRET_KEY` env var is set correctly in payments-service.
4. Check Stripe dashboard for rate limits or API outages.
5. If payments-service is down: api-gateway returns 502. Check Docker health.

### Symptom: Login failures (401/403)

1. Check auth-service logs for `POST /auth/login` errors.
2. Verify `JWT_SECRET` env var is consistent across all services.
3. Check if the User account is deactivated (`is_active=False`).
4. If auth-service is down: api-gateway auth guard returns 503.

### Symptom: Catalog not loading

1. Check catalog-service logs for Go runtime errors.
2. Verify database connection string in catalog-service env.
3. Check `GET /products` response from api-gateway.

## Deployment Notes

- Services are deployed via Docker Compose in development.
- Production: each service is a separate Cloud Run revision.
- Environment variables managed via Secret Manager (production) / `.env` files (dev).
- Migrations run automatically on auth-service startup via SQLAlchemy.

## Key Contacts

- Platform: platform-eng@shopstack.io
- Payments incidents: payments-oncall@shopstack.io
- Auth incidents: security@shopstack.io
