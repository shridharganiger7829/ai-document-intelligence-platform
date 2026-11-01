
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth_decorators import role_required

dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)


@dashboard_bp.route("/admin", methods=["GET"])
@jwt_required()
@role_required("admin")
def admin_dashboard():
    return jsonify({
        "message": "Welcome to Admin Dashboard"
    })


@dashboard_bp.route("/reviewer", methods=["GET"])
@jwt_required()
@role_required("reviewer")
def reviewer_dashboard():
    return jsonify({
        "message": "Welcome to Reviewer Dashboard"
    })


@dashboard_bp.route("/employee", methods=["GET"])
@jwt_required()
@role_required("employee")
def employee_dashboard():
    return jsonify({
        "message": "Welcome to Employee Dashboard"
    })
