import requests
from flask import Blueprint, request, jsonify

import config

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    resp = requests.post(f"{config.AUTH_SERVICE_URL}/auth/register", json=request.json, timeout=config.REQUEST_TIMEOUT)
    return jsonify(resp.json()), resp.status_code


@auth_bp.route("/login", methods=["POST"])
def login():
    resp = requests.post(f"{config.AUTH_SERVICE_URL}/auth/login", data=request.form, timeout=config.REQUEST_TIMEOUT)
    return jsonify(resp.json()), resp.status_code


@auth_bp.route("/logout", methods=["POST"])
def logout():
    resp = requests.post(f"{config.AUTH_SERVICE_URL}/auth/logout", params=request.args, timeout=config.REQUEST_TIMEOUT)
    return jsonify(resp.json()), resp.status_code
