---
title: "Login Screen"
source_type: design_doc
flow: user-login
screen_id: screen-login
linked_routes:
  - POST /auth/login
linked_services:
  - auth-service
  - api-gateway
sensitive_fields:
  - email
  - authToken
---

## Login Screen

Entry point for returning shoppers and tenant admins. Submits credentials to `POST /auth/login` via api-gateway.

### Components

| Component | Purpose | Notes |
|---|---|---|
| `EmailInput` | Collects user email | PII — normalised to lowercase before submission |
| `PasswordInput` | Collects password | Type `password`; never logged |
| `LoginButton` | Submits credentials | Shows spinner while request in-flight |
| `ForgotPasswordLink` | Links to password reset flow | Out of scope V1 |
| `RegisterLink` | Navigates to `screen-register` | |

### Behaviour

- On `200 OK`: store `accessToken` in memory and `refreshToken` in httpOnly cookie; navigate to `screen-dashboard`.
- On `401 Unauthorized`: display `"Incorrect email or password."` — do not distinguish which field was wrong.
- On network error: display `"Unable to reach the server — please try again."`.
- After 5 consecutive failures: show a 30-second cooldown with countdown timer.

### Security Notes

- `email` displayed in error messages must be masked to `u***@domain.com`.
- `authToken` must never appear in URL parameters, console logs, or error payloads.
- Form `autocomplete="current-password"` must be set to allow password managers.

### Accessibility

- `EmailInput` has `type="email"` and `autocomplete="email"`.
- Error state is announced via `role="alert"`.
- `LoginButton` has `aria-busy="true"` while the request is pending.
