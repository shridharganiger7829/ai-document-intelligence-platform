
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Company, User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json() or {}

    company_name = data.get("company_name", "").strip()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not all([company_name, name, email, password]):
        return jsonify({
            "error": "All fields are required"
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "Password must contain at least 8 characters"
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({
            "error": "Email is already registered"
        }), 409

    try:
        company = Company(
            name=company_name,
            email=email
        )

        db.session.add(company)
        db.session.flush()

        admin = User(
            company_id=company.id,
            name=name,
            email=email,
            password_hash=generate_password_hash(password),
            role="admin"
        )

        db.session.add(admin)
        db.session.commit()

        return jsonify({
            "message": "Company registered successfully",
            "company_id": company.id,
            "user": {
                "id": admin.id,
                "name": admin.name,
                "email": admin.email,
                "role": admin.role
            }
        }), 201

    except IntegrityError:
        db.session.rollback()

        return jsonify({
            "error": "Registration could not be completed"
        }), 409

    except Exception:
        db.session.rollback()

        return jsonify({
            "error": "An internal error occurred"
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(
        user.password_hash, password
    ):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    if not user.is_active:
        return jsonify({
            "error": "Your account is inactive"
        }), 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "company_id": user.company_id,
            "role": user.role
        }
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "company_id": user.company_id
        }
    }), 200
