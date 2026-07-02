---
title: User Authentication Flow — Acceptance Test
source_type: acceptance_flow
flow: user-authentication
services:
  - web-frontend
  - api-gateway
  - auth-service
routes:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/verify
  - POST /api/auth/logout
schemas:
  - User
  - RefreshToken
---

# Acceptance Test: User Authentication Flow

## Preconditions
- Auth service is running and database is migrated
- API gateway is running with `JWT_SECRET` matching auth-service
- Test user account exists (or registration test runs first)

## Happy Path

### AC-AUTH-1: Successful login
```
Given a registered user with email "test@example.com" and password "Test1234!"
When POST /api/auth/login with form body:
  username=test@example.com&password=Test1234!
Then response status is 200
And response body contains:
  {
    "access_token": "<non-empty JWT>",
    "refresh_token": "<non-empty string>",
    "token_type": "bearer"
  }
```

### AC-AUTH-2: Access token is a valid JWT
```
Given the access_token from AC-AUTH-1
When POST /api/auth/verify with body: { "token": "<access_token>" }
Then response status is 200
And response body contains:
  { "valid": true, "user_id": "<non-empty>", "tenant_id": "<non-empty>" }
```

### AC-AUTH-3: New user registration
```
Given a unique email "new_user@example.com"
When POST /api/auth/register with body:
  { "email": "new_user@example.com", "password": "NewPass1!", "full_name": "New User", "tenant_id": "tenant-abc" }
Then response status is 201
And response body contains access_token and refresh_token
```

### AC-AUTH-4: Access token authorizes gateway requests
```
Given a valid access_token from AC-AUTH-1
When GET /api/payments/invoices with header:
  Authorization: Bearer <access_token>
Then response status is 200 or 404 (not 401 or 403)
```

## Error Cases

### AC-AUTH-5: Invalid credentials return 401
```
Given a registered user
When POST /api/auth/login with wrong password
Then response status is 401
And response body contains "Invalid credentials"
```

### AC-AUTH-6: Deactivated account returns 403
```
Given a user with is_active=False in the database
When POST /api/auth/login with correct credentials
Then response status is 403
And response body contains "Account deactivated"
```

### AC-AUTH-7: Duplicate email registration returns 409
```
Given an existing user with "existing@example.com"
When POST /api/auth/register with the same email
Then response status is 409
```

### AC-AUTH-8: Expired token fails verification
```
Given an expired JWT (manually crafted or waited for expiry)
When POST /api/auth/verify
Then response status is 401
And response body contains "Invalid or expired token"
```

## Performance
- `POST /api/auth/login` must respond within 500ms.

## Test Files
- Unit tests: `auth-service/tests/test_auth.py`
- Gateway tests: `api-gateway/tests/test_gateway.py`
