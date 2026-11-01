
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

    # Import database models
    from app.models import Company, User, Document

    migrate.init_app(app, db)

    # Import API blueprints
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.users import users_bp
    from app.routes.documents import documents_bp
    from app.routes.processing import processing_bp

    # Register API blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(processing_bp)

    @app.route("/")
    def home():
        return jsonify({
            "message": "AI Document Intelligence API is running"
        })

    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "healthy"
        })

    return app
