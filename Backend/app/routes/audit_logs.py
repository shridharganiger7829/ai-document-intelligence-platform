
from flask import Blueprint, request, jsonify
from sqlalchemy import desc

from app.models.audit_log import AuditLog
from app.utils.auth_decorators import role_required
from flask_jwt_extended import get_jwt


audit_bp = Blueprint("audit_logs", __name__)


def get_company_id():
    return get_jwt().get("company_id")


@audit_bp.route("/", methods=["GET"])
@role_required("admin")
def get_audit_logs():

    company_id = get_company_id()

    if not company_id:
        return jsonify({
            "message": "Company information missing from token"
        }), 401

    # Pagination parameters
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(100, max(1, int(request.args.get("per_page", 20))))
    except ValueError:
        return jsonify({
            "message": "Page and per_page must be valid integers"
        }), 400

    # Base query: only this company's audit logs
    query = AuditLog.query.filter_by(
        company_id=company_id
    )

    # Optional action filter
    action = request.args.get("action")
    if action:
        query = query.filter(
            AuditLog.action == action.upper()
        )

    # Optional entity type filter
    entity_type = request.args.get("entity_type")
    if entity_type:
        query = query.filter(
            AuditLog.entity_type == entity_type
        )

    # Optional user ID filter
    user_id = request.args.get("user_id")
    if user_id:
        try:
            query = query.filter(
                AuditLog.user_id == int(user_id)
            )
        except ValueError:
            return jsonify({
                "message": "user_id must be a valid integer"
            }), 400

    # Newest records first
    query = query.order_by(
        desc(AuditLog.created_at),
        desc(AuditLog.id)
    )

    # Paginated results
    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    logs = []

    for log in pagination.items:
        logs.append({
            "id": log.id,
            "company_id": log.company_id,
            "user_id": log.user_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": (
                log.created_at.isoformat()
                if log.created_at else None
            )
        })

    return jsonify({
        "message": "Audit logs retrieved successfully",
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_records": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_previous": pagination.has_prev
        },
        "audit_logs": logs
    }), 200
