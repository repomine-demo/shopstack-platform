import requests
from flask import Blueprint, request, jsonify, g

import config
from middleware.auth_guard import require_auth

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


@payments_bp.route("/subscribe", methods=["POST"])
@require_auth
def subscribe():
    resp = requests.post(
        f"{config.PAYMENTS_SERVICE_URL}/payments/subscribe",
        json=request.json,
        headers={"Authorization": request.headers.get("Authorization")},
        timeout=config.REQUEST_TIMEOUT,
    )
    return jsonify(resp.json()), resp.status_code


@payments_bp.route("/subscribe/<subscription_id>", methods=["DELETE"])
@require_auth
def cancel_subscription(subscription_id):
    resp = requests.delete(
        f"{config.PAYMENTS_SERVICE_URL}/payments/subscribe/{subscription_id}",
        headers={"Authorization": request.headers.get("Authorization")},
        timeout=config.REQUEST_TIMEOUT,
    )
    return jsonify(resp.json()), resp.status_code


@payments_bp.route("/invoices", methods=["GET"])
@require_auth
def invoices():
    resp = requests.get(
        f"{config.PAYMENTS_SERVICE_URL}/payments/invoices",
        headers={"Authorization": request.headers.get("Authorization")},
        timeout=config.REQUEST_TIMEOUT,
    )
    return jsonify(resp.json()), resp.status_code
