# auth-service

JWT-based authentication and user management for ShopStack.

**Language:** Python 3.12 / FastAPI  
**Port:** 8001

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user, returns JWT pair |
| POST | `/auth/login` | Login, returns JWT pair |
| POST | `/auth/verify` | Verify an access token (called by other services) |
| POST | `/auth/logout` | Revoke refresh token |
| GET  | `/users/me` | Current user profile |
| GET  | `/users/{id}` | Get user by ID (admin or self) |
| DELETE | `/users/{id}` | Deactivate user (admin only) |
| GET  | `/health` | Health check |

## Dependencies

- PostgreSQL (users, refresh_tokens tables)
- No external service dependencies — this is the root of the auth chain

## Running

```bash
pip install -r requirements.txt
DATABASE_URL=postgresql://... JWT_SECRET=... uvicorn main:app --port 8001
```
