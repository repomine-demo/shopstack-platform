---
title: Login Screen
source_type: design_doc
flow: user-authentication
screen: LoginPage
linked_routes:
  - POST /api/auth/login
linked_services:
  - web-frontend
  - api-gateway
  - auth-service
linked_schemas:
  - User
  - RefreshToken
linked_frontend_file: web-frontend/src/components/Auth/Login.tsx
sensitive_fields:
  - email
  - password
  - access_token
  - refresh_token
---

# Login Screen — User Authentication

## Screen Purpose

The login screen authenticates existing users via email and password. It initiates the session by obtaining an `access_token` and `refresh_token`, which are stored in `localStorage` and used for all subsequent API requests.

## Components

### EmailInput
- Field: `email` (PII)
- Form-encoded as `username` per OAuth2PasswordRequestForm convention
- Sent to `POST /api/auth/login`

### PasswordInput
- Field: `password` (Auth credential — never stored or logged)
- Form-encoded, transmitted over HTTPS only

### SignInButton
- Submits the form via `authService.ts login()`
- Calls `POST /api/auth/login` on the API gateway
- On success: stores `access_token` and `refresh_token` in localStorage, calls `onSuccess()`

### ForgotPasswordLink
- Navigates to password reset flow (not yet implemented)

## Data Flow

```
Login.tsx (web-frontend)
  → authService.ts: POST /api/auth/login (form-encoded)
  → api-gateway/routes/auth_routes.py: POST /api/auth/login
  → auth-service/routes/auth.py: POST /auth/login
  → user_service.py: authenticate_user()
  → token_service.py: create_access_token() + create_refresh_token()
  → User model (id, email, tenant_id)
  → RefreshToken model (token_hash, expires_at)
  → Returns: access_token, refresh_token
```

## Error States

- HTTP 401: "Invalid credentials" — show error inline
- HTTP 403: "Account deactivated" — show support contact message
- Network error: "Login failed" — generic message

## Security Notes

- Tokens stored in `localStorage` (XSS risk — documented tradeoff for demo simplicity)
- All requests to protected routes include `Authorization: Bearer <access_token>`
- Token validated by `auth_guard.py` in api-gateway on every inbound request

## Acceptance Test Reference

See `tests/acceptance/login-flow.md`
