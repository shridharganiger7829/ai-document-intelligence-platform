
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy import func
from datetime import datetime, timezone

from app.extensions import db
from app.models import Document, User
from app.utils.auth_decorators import role_required


dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)


def get_company_id():
    return get_jwt().get("company_id")


def get_document_count(company_id, *statuses):
    query = Document.query.filter_by(company_id=company_id)

    if statuses:
        query = query.filter(Document.status.in_(statuses))

    return query.count()


# =========================
# ADMIN DASHBOARD
# =========================

@dashboard_bp.route("/admin", methods=["GET"])
@jwt_required()
@role_required("admin")
def admin_dashboard():

    company_id = get_company_id()

    if not company_id:
        return jsonify({"message": "Company information missing"}), 401

    today = datetime.now(timezone.utc).date()

    total_documents = Document.query.filter_by(
        company_id=company_id
    ).count()

    total_employees = User.query.filter_by(
        company_id=company_id,
        role="employee"
    ).count()

    total_reviewers = User.query.filter_by(
        company_id=company_id,
        role="reviewer"
    ).count()

    active_users = User.query.filter_by(
        company_id=company_id,
        is_active=True
    ).count()

    pending_reviews = get_document_count(
        company_id, "extracted", "pending_review"
    )

    approved = get_document_count(
        company_id, "approved"
    )

    rejected = get_document_count(
        company_id, "rejected"
    )

    corrections_requested = get_document_count(
        company_id, "corrections_requested"
    )

    processing = get_document_count(
        company_id, "processing"
    )

    uploaded_today = Document.query.filter(
        Document.company_id == company_id,
        func.date(Document.created_at) == today
    ).count()

    failed = get_document_count(
        company_id, "failed", "processing_failed"
    )

    # Reviewer workload
    reviewer_workload = db.session.query(
        User.id,
        User.name,
        func.count(Document.id).label("assigned_documents")
    ).outerjoin(
        Document,
        (Document.assigned_reviewer == User.id) &
        (Document.company_id == company_id)
    ).filter(
        User.company_id == company_id,
        User.role == "reviewer"
    ).group_by(
        User.id, User.name
    ).all()

    workload = [
        {
            "reviewer_id": row.id,
            "reviewer_name": row.name,
            "assigned_documents": row.assigned_documents
        }
        for row in reviewer_workload
    ]

    return jsonify({
        "message": "Admin dashboard statistics retrieved successfully",
        "statistics": {
            "total_documents": total_documents,
            "total_employees": total_employees,
            "total_reviewers": total_reviewers,
            "active_users": active_users,
            "pending_reviews": pending_reviews,
            "approved_documents": approved,
            "rejected_documents": rejected,
            "corrections_requested": corrections_requested,
            "processing_documents": processing,
            "failed_documents": failed,
            "uploaded_today": uploaded_today
        },
        "reviewer_workload": workload
    }), 200


# =========================
# REVIEWER DASHBOARD
# =========================

@dashboard_bp.route("/reviewer", methods=["GET"])
@jwt_required()
@role_required("reviewer")
def reviewer_dashboard():

    claims = get_jwt()
    company_id = claims.get("company_id")
    reviewer_id = int(claims.get("sub")) if claims.get("sub") else None

    if not company_id or not reviewer_id:
        return jsonify({"message": "User information missing"}), 401

    query = Document.query.filter_by(
        company_id=company_id,
        assigned_reviewer=reviewer_id
    )

    return jsonify({
        "message": "Reviewer dashboard statistics retrieved successfully",
        "statistics": {
            "total_assigned": query.count(),
            "pending_reviews": query.filter(
                Document.status.in_(["extracted", "pending_review"])
            ).count(),
            "verified_documents": query.filter_by(
                status="verified"
            ).count(),
            "corrections_requested": query.filter_by(
                status="corrections_requested"
            ).count(),
            "flagged_documents": query.filter_by(
                status="flagged_for_admin"
            ).count()
        }
    }), 200


# =========================
# EMPLOYEE DASHBOARD
# =========================

@dashboard_bp.route("/employee", methods=["GET"])
@jwt_required()
@role_required("employee")
def employee_dashboard():

    claims = get_jwt()
    company_id = claims.get("company_id")
    employee_id = int(claims.get("sub")) if claims.get("sub") else None

    if not company_id or not employee_id:
        return jsonify({"message": "User information missing"}), 401

    query = Document.query.filter_by(
        company_id=company_id,
        uploaded_by=employee_id
    )

    today = datetime.now(timezone.utc).date()

    uploaded_today = query.filter(
        func.date(Document.created_at) == today
    ).count()

    return jsonify({
        "message": "Employee dashboard statistics retrieved successfully",
        "statistics": {
            "total_uploaded": query.count(),
            "uploaded_today": uploaded_today,
            "processing_documents": query.filter_by(
                status="processing"
            ).count(),
            "pending_reviews": query.filter(
                Document.status.in_(["extracted", "pending_review"])
            ).count(),
            "approved_documents": query.filter_by(
                status="approved"
            ).count(),
            "rejected_documents": query.filter_by(
                status="rejected"
            ).count(),
            "corrections_requested": query.filter_by(
                status="corrections_requested"
            ).count()
        }
    }), 200
