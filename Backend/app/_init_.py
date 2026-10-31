from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)

    @app.route("/")
    def home():
        return jsonify({
            "message": "AI Document Intelligence API is running"
        })

    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "healthy",
            "application": "AI Document Intelligence"
        })

    return app