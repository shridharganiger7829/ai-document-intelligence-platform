from flask import request

from app.extensions import db
from app.models.audit_log import AuditLog


def log_action(
    company_id,
    user_id,
    action,
    entity_type,
    entity_id=None,
    details=None
):
    try:
        audit = AuditLog(
            company_id=company_id,
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details or {},
            ip_address=request.remote_addr
        )

        db.session.add(audit)

        return True

    except Exception as error:
        print(f"Audit logging error: {error}")
        return False