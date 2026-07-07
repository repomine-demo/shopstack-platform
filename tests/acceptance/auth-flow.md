---
title: "Acceptance Tests — User Authentication Flow"
source_type: acceptance_flow
flow: user-login
services:
  - auth-service
  - api-gateway
routes:
  - POST /auth/register
  - POST /auth/login
  - POST /auth/logout
  - POST /auth/verify
  - GET /auth/me
---

## User Authentication Flow — Acceptance Tests

### AC-AUTH-1: Successful registration

**Given** a new email address not in the system  
**When** POST `/auth/register` is called with `{ email, password, fullName, tenantId }`  
**Then** the response is `201 Created` with a `TokenResponse`  
**And** a `User` record exists with `email` stored as lowercase  
**And** `hashedPassword` is not returned in the response

### AC-AUTH-2: Duplicate email registration

**Given** an email that already exists  
**When** POST `/auth/register` is called with the same email  
**Then** the response is `409 Conflict`  
**And** no additional `User` record is created

### AC-AUTH-3: Successful login

**Given** a registered user with valid credentials  
**When** POST `/auth/login` is called with `{ email, password }`  
**Then** the response is `200 OK` with `{ accessToken, refreshToken, expiresIn: 900 }`  
**And** `accessToken` is a valid JWT with `sub = userId`

### AC-AUTH-4: Invalid credentials

**Given** a registered user  
**When** POST `/auth/login` is called with the wrong password  
**Then** the response is `401 Unauthorized` with `{ error: "Invalid credentials" }`  
**And** the error message does not distinguish between wrong email and wrong password

### AC-AUTH-5: authToken not in logs

**Given** a successful login  
**When** the auth-service log is inspected  
**Then** `authToken`, `refreshToken`, and `password` must not appear in any log line

### AC-AUTH-6: Get current user

**Given** a valid `accessToken`  
**When** GET `/auth/me` is called with `Authorization: Bearer <accessToken>`  
**Then** the response is `200 OK` with `{ userId, email, fullName, tenantId }`  
**And** `hashedPassword` is not included in the response

### AC-AUTH-7: Logout revokes refresh token

**Given** a user with an active `refreshToken`  
**When** POST `/auth/logout` is called  
**Then** the response is `204 No Content`  
**And** the `RefreshToken` record has `revoked = true`  
**And** subsequent use of the revoked token returns `401`

### AC-AUTH-8: Refresh token rotation

**Given** a valid, un-revoked `refreshToken`  
**When** POST `/auth/verify` is called  
**Then** a new `accessToken` is returned  
**And** the old `RefreshToken` is marked `revoked = true`  
**And** a new `RefreshToken` record is created

### AC-AUTH-9: Email masking in error messages

**Given** a login attempt with email `user@example.com`  
**When** the login fails  
**Then** any error message referencing the email displays it as `u***@example.com`
