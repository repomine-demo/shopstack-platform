# catalog-service

Product catalog and inventory management for ShopStack.

**Language:** Go 1.22  
**Port:** 8003

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/catalog/products` | List products (supports `?q=` search, `?category_id=`) |
| POST | `/catalog/products` | Create product |
| GET | `/catalog/products/:id` | Get product by ID |
| GET | `/catalog/products/:id/stock` | Get inventory level |
| PUT | `/catalog/products/:id/stock` | Update stock quantity |
| GET | `/health` | Health check |

## Auth

Expects `X-Tenant-ID` header on all product endpoints (set by api-gateway).

## Dependencies

- PostgreSQL (products, inventory, categories tables)
- No external service dependencies
