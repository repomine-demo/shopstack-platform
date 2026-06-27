# api-gateway

Unified entry point for the ShopStack platform — routes requests to downstream services and enforces auth.

**Language:** Python 3.12 / Flask  
**Port:** 5000

## Routes

| Prefix | Downstream service |
|--------|--------------------|
| `/api/auth/*` | auth-service:8001 |
| `/api/catalog/*` | catalog-service:8003 |
| `/api/payments/*` | payments-service:8002 |

## Auth enforcement

`require_auth` middleware calls `auth-service /auth/verify` on every protected route.
Public routes: `GET /api/catalog/products`, `GET /api/catalog/products/:id`, `POST /api/auth/login`, `POST /api/auth/register`.

## Dependencies

- **auth-service** — token verification
- **catalog-service** — product data
- **payments-service** — billing operations
