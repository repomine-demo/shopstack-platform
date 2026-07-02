---
title: User Authentication
source_type: prd
capabilities:
  - user-registration
  - session-management
  - identity-verification
user_personas:
  - buyer
  - admin
  - tenant-owner
user_flows:
  - user-authentication
  - user-registration
  - session-refresh
services:
  - web-frontend
  - api-gateway
  - auth-service
routes:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/logout
  - POST /api/auth/verify
schemas:
  - User
  - RefreshToken
sensitive_data:
  - email
  - hashed_password
  - access_token
  - refresh_token
  - token_hash
  - full_name
evidence_files:
  - auth-service/routes/auth.py
  - auth-service/models/user.py
  - api-gateway/routes/auth_routes.py
  - web-frontend/src/components/Auth/Login.tsx
  - web-frontend/src/services/authService.ts
---

# User Authentication

## Overview

ShopStack uses JWT-based authentication with short-lived access tokens and long-lived refresh tokens. All authentication flows are handled by the auth-service and gated through the API gateway.

## Business Goals

- Secure tenant isolation: every token carries a `tenant_id` claim.
- Stateless verification: any service can validate a JWT without calling auth-service.
- Fast login: sub-200ms token issuance under normal load.

## User Flow

### Login
1. User enters email and password on the Login screen.
2. Frontend calls `POST /api/auth/login` (form-encoded).
3. API gateway forwards to `auth-service POST /auth/login`.
4. Auth service verifies credentials via `authenticate_user()`.
5. On success: issues `access_token` + `refresh_token`, returns both to the frontend.
6. Frontend stores tokens in `localStorage` and attaches `Authorization: Bearer <token>` on all subsequent requests.

### Registration
1. User provides email, password, full name, and tenant ID.
2. Frontend calls `POST /api/auth/register`.
3. Auth service creates `User` record (hashed password) and issues tokens.

## Acceptance Criteria

- Valid credentials return `access_token` and `refresh_token` within 200ms.
- Invalid credentials return HTTP 401 with "Invalid credentials".
- Deactivated account returns HTTP 403 with "Account deactivated".
- Token verification via `POST /auth/verify` returns `user_id` and `tenant_id` from the JWT payload.
- Logout clears the session (client removes tokens from localStorage).

## Sensitive Data Handling

This flow handles identity-sensitive data:

| Field | Classification | Service |
|-------|----------------|---------|
| `email` | PII | auth-service |
| `hashed_password` | Auth credential | auth-service |
| `access_token` | Auth/session | frontend, api-gateway |
| `refresh_token` | Auth/session | frontend, api-gateway |
| `token_hash` | Auth credential | auth-service |
| `full_name` | PII | auth-service |

Passwords are never stored in plaintext. Access tokens expire in 15 minutes. Refresh tokens expire in 30 days and are stored as hashes only.

## Security Notes

- The API gateway validates JWT on every request via `auth_guard.py` middleware.
- `tenant_id` in the token payload is the primary isolation boundary between tenants.
- Refresh tokens are revocable via the `revoked` flag on the `RefreshToken` model.
