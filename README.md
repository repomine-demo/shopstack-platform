# ShopStack Platform

Multi-tenant e-commerce platform built with microservices.

## Services

| Service | Language | Port | Responsibility |
|---------|----------|------|----------------|
| `auth-service` | Python / FastAPI | 8001 | JWT auth, user management |
| `payments-service` | TypeScript / Node | 8002 | Stripe billing, subscriptions |
| `catalog-service` | Go | 8003 | Product catalog, inventory |
| `web-frontend` | TypeScript / React | 3000 | Customer-facing SPA |
| `api-gateway` | Python / Flask | 5000 | Unified entry point, auth enforcement |

## Architecture

```
web-frontend (React)
      │
      ▼
api-gateway (Flask)  ──────────────────────┐
      │                                    │
      ├──► auth-service (FastAPI)          │
      ├──► payments-service (Node) ────────┘  (verifies tokens via auth-service)
      └──► catalog-service (Go)
```

## Running locally

```bash
docker-compose up
```

Or run each service individually — see per-service READMEs.

## Environment variables

Each service reads from its own `.env`. See `.env.example` in each folder.
