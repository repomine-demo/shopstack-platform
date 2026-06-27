# web-frontend

Customer-facing storefront for ShopStack.

**Language:** TypeScript / React 18  
**Port:** 3000  
**Entry point:** `index.html` (standalone demo) or `src/App.tsx` (full React build)

## Quick demo

Open `index.html` directly in a browser — no build step needed.
Features: product grid, category filter, search, add-to-cart, cart drawer, checkout.

## Architecture notes

- `src/services/apiClient.ts` — all HTTP calls go through api-gateway:5000
- `src/services/authService.ts` — JWT stored in localStorage, injected per-request
- `src/hooks/useProducts.ts` — data fetching hook for catalog
- `src/components/Cart.tsx` — cart state management
- `src/components/Auth/Login.tsx` — login form

## Known complexity

- `ProductCatalog` component (god class candidate) — handles listing, search, cart, and auth state in one component
