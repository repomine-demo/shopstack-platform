import os
from flask import Flask, jsonify
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.catalog_routes import catalog_bp
from routes.payments_routes import payments_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(catalog_bp)
app.register_blueprint(payments_bp)


@app.get("/health")
def health():
    return jsonify({"status": "healthy", "service": "api-gateway"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
