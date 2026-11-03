
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from sqlalchemy.exc import IntegrityError


from app.extensions import db
from app.models import User
from app.utils.auth_decorators import role_required
from flask_jwt_extended import get_jwt,get_jwt_identity
from flask import current_app
from app.services.audit_service import log_action

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


def get_company_id():
    return get_jwt().get("company_id")


@users_bp.route("/", methods=["POST"])
@role_required("admin")
def create_user():

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "").strip().lower()

    admin_id = int(get_jwt_identity())
    company_id = get_company_id()

    # Validate required fields
    if not name or not email or not password or not role:
        return jsonify({
            "message": "Name, email, password and role are required"
        }), 400

    if role not in ["employee", "reviewer"]:
        return jsonify({
            "message": "Role must be employee or reviewer"
        }), 400

    if len(password) < 8:
        return jsonify({
            "message": "Password must contain at least 8 characters"
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({
            "message": "This email is already registered"
        }), 409

    user = User(
        company_id=company_id,
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        role=role,
        is_active=True
    )

    try:
        db.session.add(user)

        # Generate the new user's ID
        db.session.flush()

        # Record user creation
        log_action(
            company_id=company_id,
            user_id=admin_id,
            action="USER_CREATED",
            entity_type="User",
            entity_id=user.id,
            details={
                "created_user_name": user.name,
                "created_user_email": user.email,
                "created_user_role": user.role
            }
        )

        db.session.commit()

        return jsonify({
            "message": f"{role.capitalize()} account created successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active
            }
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "message": "An account with this email already exists"
        }), 409

    except Exception:
        db.session.rollback()
        current_app.logger.exception(
            "Failed to create user or save audit log"
        )
        return jsonify({
            "message": "Unable to create user"
        }), 500
    
@users_bp.route("/", methods=["GET"])
@role_required("admin")
def get_users():
    company_id = get_company_id()

    users = User.query.filter_by(
        company_id=company_id
    ).order_by(User.created_at.desc()).all()

    result = []

    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": (
                user.created_at.isoformat()
                if user.created_at else None
            )
        })

    return jsonify({
        "total_users": len(result),
        "users": result
    }), 200


@users_bp.route("/<int:user_id>/status", methods=["PATCH"])
@role_required("admin")
def update_user_status(user_id):
    company_id = get_company_id()
    admin_id = int(get_jwt_identity())

    data = request.get_json() or {}

    if "is_active" not in data or not isinstance(data["is_active"], bool):
        return jsonify({
            "message": "is_active must be true or false"
        }), 400

    user = User.query.filter_by(
        id=user_id,
        company_id=company_id
    ).first()

    if not user:
        return jsonify({
            "message": "User not found in your company"
        }), 404

    if user.role == "admin":
        return jsonify({
            "message": "Admin accounts cannot be deactivated through this API"
        }), 403

    previous_status = user.is_active
    new_status = data["is_active"]

    if previous_status == new_status:
        return jsonify({
            "message": "User already has this status"
        }), 200

    user.is_active = new_status

    action = "USER_ACTIVATED" if new_status else "USER_DEACTIVATED"

    try:
        log_action(
            company_id=company_id,
            user_id=admin_id,
            action=action,
            entity_type="User",
            entity_id=user.id,
            details={
                "target_user_name": user.name,
                "target_user_email": user.email,
                "previous_status": previous_status,
                "new_status": new_status
            }
        )

        db.session.commit()

        return jsonify({
            "message": "User status updated successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active
            }
        }), 200

    except Exception as error:
        db.session.rollback()
        print(f"User status update error: {error}")

        return jsonify({
            "message": "Unable to update user status"
        }), 500
