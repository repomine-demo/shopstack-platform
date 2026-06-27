import requests
from functools import wraps
from flask import request, jsonify, g

import config


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing authorization header"}), 401

        token = auth_header[7:]
        try:
            resp = requests.post(
                f"{config.AUTH_SERVICE_URL}/auth/verify",
                params={"token": token},
                timeout=config.REQUEST_TIMEOUT,
            )
            data = resp.json()
            if not data.get("valid"):
                return jsonify({"error": "Invalid token"}), 401
            g.user_id = data["user_id"]
            g.tenant_id = data["tenant_id"]
        except requests.exceptions.RequestException:
            return jsonify({"error": "Auth service unavailable"}), 503

        return f(*args, **kwargs)
    return decorated
