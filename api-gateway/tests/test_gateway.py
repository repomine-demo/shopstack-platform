import pytest
from unittest.mock import patch, MagicMock
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json["status"] == "healthy"


@patch("routes.catalog_routes.requests.get")
def test_list_products_proxies_to_catalog(mock_get, client):
    mock_get.return_value = MagicMock(status_code=200, json=lambda: {"products": [], "count": 0})
    resp = client.get("/api/catalog/products")
    assert resp.status_code == 200
    assert "products" in resp.json


@patch("routes.auth_routes.requests.post")
def test_register_proxies_to_auth(mock_post, client):
    mock_post.return_value = MagicMock(
        status_code=201,
        json=lambda: {"access_token": "tok", "refresh_token": "ref", "token_type": "bearer"},
    )
    resp = client.post("/api/auth/register", json={
        "email": "test@acme.com", "password": "pass", "full_name": "Test", "tenant_id": "acme"
    })
    assert resp.status_code == 201
