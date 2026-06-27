import requests
from flask import Blueprint, request, jsonify, g

import config
from middleware.auth_guard import require_auth

catalog_bp = Blueprint("catalog", __name__, url_prefix="/api/catalog")


@catalog_bp.route("/products", methods=["GET"])
def list_products():
    # Public endpoint — no auth required for browsing
    params = request.args.to_dict()
    tenant_id = request.headers.get("X-Tenant-ID", "public")
    resp = requests.get(
        f"{config.CATALOG_SERVICE_URL}/catalog/products",
        params=params,
        headers={"X-Tenant-ID": tenant_id},
        timeout=config.REQUEST_TIMEOUT,
    )
    return jsonify(resp.json()), resp.status_code


@catalog_bp.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    tenant_id = request.headers.get("X-Tenant-ID", "public")
    resp = requests.get(
        f"{config.CATALOG_SERVICE_URL}/catalog/products/{product_id}",
        headers={"X-Tenant-ID": tenant_id},
        timeout=config.REQUEST_TIMEOUT,
    )
    return jsonify(resp.json()), resp.status_code


@catalog_bp.route("/products", methods=["POST"])
@require_auth
def create_product():
    body = request.json
    resp = requests.post(
        f"{config.CATALOG_SERVICE_URL}/catalog/products",
        json=body,
        headers={"X-Tenant-ID": g.tenant_id},
        timeout=config.REQUEST_TIMEOUT,
    )
    return jsonify(resp.json()), resp.status_code
