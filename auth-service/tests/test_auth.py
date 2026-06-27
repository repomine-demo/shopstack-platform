import pytest
from unittest.mock import MagicMock, patch
from services.token_service import create_access_token, verify_access_token, create_refresh_token
from services.user_service import verify_password, authenticate_user


def test_create_and_verify_access_token():
    token = create_access_token(user_id=1, tenant_id="acme", email="user@acme.com")
    payload = verify_access_token(token)
    assert payload is not None
    assert payload["sub"] == "1"
    assert payload["tenant_id"] == "acme"


def test_verify_invalid_token():
    result = verify_access_token("not-a-valid-token")
    assert result is None


def test_create_refresh_token_returns_tuple():
    raw, hashed = create_refresh_token(user_id=42)
    assert len(raw) > 32
    assert len(hashed) == 64  # sha256 hex


def test_verify_password():
    from passlib.context import CryptContext
    ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed = ctx.hash("secret123")
    assert verify_password("secret123", hashed) is True
    assert verify_password("wrong", hashed) is False


def test_authenticate_user_returns_none_for_bad_password():
    mock_db = MagicMock()
    from models.user import User
    from passlib.context import CryptContext
    ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    user = User(id=1, email="u@test.com", hashed_password=ctx.hash("correct"), tenant_id="t1", is_active=True)
    mock_db.query.return_value.filter.return_value.first.return_value = user
    result = authenticate_user(mock_db, "u@test.com", "wrong-password")
    assert result is None
