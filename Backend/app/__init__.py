
from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate, jwt


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    jwt.init_app(app)

    # Import models
    from app.models import Company, User, Document

    # Initialize migrations
    migrate.init_app(app, db)

    # Register routes
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)

    # Home route
    @app.route("/")
    def home():
        return jsonify({
            "message": "AI Document Intelligence API is running"
        })

    # Health check
    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "healthy"
        })

    return app
