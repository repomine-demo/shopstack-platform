---
title: "ShopStack — User Authentication PRD"
source_type: prd
capabilities:
  - user-registration
  - user-login
  - session-management
  - token-refresh
user_personas:
  - shopper
  - tenant-admin
user_flows:
  - user-login
  - user-registration
  - session-refresh
services:
  - auth-service
  - api-gateway
routes:
  - POST /auth/register
  - POST /auth/login
  - POST /auth/logout
  - POST /auth/verify
  - GET /auth/me
schemas:
  - User
  - RefreshToken
  - TokenResponse
sensitive_data:
  - email
  - hashedPassword
  - authToken
  - refreshToken
  - userId
evidence_files:
  - auth-service/routes/auth.py
  - auth-service/routes/users.py
  - auth-service/models/user.py
  - api-gateway/routes/auth_routes.py
---

## Goal

Provide secure multi-tenant user registration and login. JWT access tokens are short-lived (15 min); refresh tokens are long-lived (30 days) and stored hashed. All endpoints are proxied through api-gateway.

## User Flows

### user-login

1. Shopper submits email + password on the login page (`web-frontend/index.html`).
2. Frontend `POST /auth/login` → api-gateway → auth-service.
3. auth-service validates credentials, returns `{ accessToken, refreshToken, expiresIn }`.
4. Frontend stores `accessToken` in memory; `refreshToken` in an httpOnly cookie.
5. Subsequent requests attach `Authorization: Bearer <accessToken>`.

### user-registration

1. New shopper submits `{ email, password, fullName, tenantId }` to `POST /auth/register`.
2. auth-service hashes password (bcrypt), creates `User` record, returns `TokenResponse`.
3. Welcome email sent asynchronously (not in critical path).

### session-refresh

1. On 401, frontend sends `POST /auth/verify` with the refresh token cookie.
2. auth-service validates the `RefreshToken` record (not revoked, not expired), issues new access token.
3. Old refresh token is revoked (rotation enforced).

## Acceptance Criteria

- `POST /auth/login` returns `200` with `TokenResponse` for valid credentials.
- `POST /auth/login` returns `401` for invalid credentials; no detail about which field was wrong.
- `POST /auth/register` returns `201`; duplicate email returns `409`.
- `email` is stored normalised (lowercase, trimmed).
- `hashedPassword` is never returned in any API response.
- `authToken` is not logged in any service.
- `RefreshToken` records are rotated on each use; old tokens are marked `revoked = true`.

## Data Sensitivity

`email` is PII. `hashedPassword`, `authToken`, and `refreshToken` are credential-class secrets. `userId` is a high-sensitivity identifier that links all user activity. All must be excluded from structured logs; `email` must be masked to `u***@domain` in error messages.
