
import os
import uuid

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt, get_jwt_identity
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

from app.extensions import db
from app.models import Document,User
from app.utils.auth_decorators import role_required
from datetime import datetime, timezone
from app.services.audit_service import log_action
from flask import send_file
from pathlib import Path

documents_bp = Blueprint(
    "documents",
    __name__,
    url_prefix="/api/documents"
)

ALLOWED_EXTENSIONS = {"pdf"}


def validate_pdf(file):
    if not file or not file.filename:
        return None, "No file selected"

    original_filename = secure_filename(file.filename)

    if not original_filename:
        return None, "Invalid filename"

    if "." not in original_filename:
        return None, "Invalid file extension"

    extension = original_filename.rsplit(".", 1)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        return None, "Only PDF files are allowed"

    file_signature = file.stream.read(5)
    file.stream.seek(0)

    if file_signature != b"%PDF-":
        return None, "Invalid PDF file"

    file.stream.seek(0, os.SEEK_END)
    file_size = file.stream.tell()
    file.stream.seek(0)

    if file_size == 0:
        return None, "Empty files are not allowed"

    if file_size > current_app.config["MAX_UPLOAD_FILE_SIZE"]:
        return None, "File exceeds the 16 MB limit"

    return {
        "original_filename": original_filename,
        "file_size": file_size
    }, None


def save_uploaded_documents(files, document_type=None):
    company_id = get_jwt().get("company_id")
    uploaded_by = int(get_jwt_identity())

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)

    successful = []
    failed = []
    saved_paths = []

    for file in files:
        metadata, error = validate_pdf(file)

        if error:
            failed.append({
                "filename": file.filename or "unknown",
                "error": error
            })
            continue

        stored_filename = f"{uuid.uuid4().hex}.pdf"
        file_path = os.path.join(upload_folder, stored_filename)

        try:
            file.save(file_path)
            saved_paths.append(file_path)

            document = Document(
                company_id=company_id,
                uploaded_by=uploaded_by,
                original_filename=metadata["original_filename"],
                stored_filename=stored_filename,
                file_path=file_path,
                mime_type="application/pdf",
                file_size=metadata["file_size"],
                document_type=document_type,
                status="uploaded"
            )

            db.session.add(document)

            # Generate document ID before creating audit record
            db.session.flush()

            # Record document upload in audit logs
            log_action(
                company_id=company_id,
                user_id=uploaded_by,
                action="DOCUMENT_UPLOADED",
                entity_type="Document",
                entity_id=document.id,
                details={
                    "filename": document.original_filename,
                    "document_type": document.document_type
                }
            )

            successful.append(document)

        except Exception:
            current_app.logger.exception(
                "Failed to save uploaded file"
            )

            db.session.rollback()

            failed.append({
                "filename": metadata["original_filename"],
                "error": "Unable to save this file"
            })

            if os.path.exists(file_path):
                os.remove(file_path)

            if file_path in saved_paths:
                saved_paths.remove(file_path)

    try:
        db.session.commit()

    except Exception:
        db.session.rollback()

        for path in saved_paths:
            if os.path.exists(path):
                os.remove(path)

        raise

    uploaded_results = []

    for document in successful:
        uploaded_results.append({
            "id": document.id,
            "original_filename": document.original_filename,
            "document_type": document.document_type,
            "file_size": document.file_size,
            "status": document.status
        })

    return uploaded_results, failed


@documents_bp.route("/upload", methods=["POST"])
@role_required("admin", "employee")
def upload_document():

    if "file" not in request.files:
        return jsonify({
            "message": "No file provided"
        }), 400

    files = [request.files["file"]]

    try:
        uploaded, failed = save_uploaded_documents(
            files,
            request.form.get("document_type")
        )

        if not uploaded:
            return jsonify({
                "message": "Document upload failed",
                "errors": failed
            }), 400

        return jsonify({
            "message": "Document uploaded successfully",
            "documents": uploaded,
            "errors": failed
        }), 201

    except Exception:
        current_app.logger.exception("Single upload failed")

        return jsonify({
            "message": "Document upload failed"
        }), 500


@documents_bp.route("/bulk-upload", methods=["POST"])
@role_required("admin", "employee")
def bulk_upload_documents():

    files = request.files.getlist("files")

    if not files:
        return jsonify({
            "message": "No files provided"
        }), 400

    if len(files) > current_app.config["MAX_BULK_FILES"]:
        return jsonify({
            "message": "Maximum 10 files are allowed per request"
        }), 400

    try:
        uploaded, failed = save_uploaded_documents(
            files,
            request.form.get("document_type")
        )

        if not uploaded:
            return jsonify({
                "message": "No documents were uploaded",
                "uploaded_count": 0,
                "failed_count": len(failed),
                "errors": failed
            }), 400

        return jsonify({
            "message": "Bulk upload completed",
            "uploaded_count": len(uploaded),
            "failed_count": len(failed),
            "documents": uploaded,
            "errors": failed
        }), 201

    except Exception:
        current_app.logger.exception("Bulk upload failed")

        return jsonify({
            "message": "Bulk upload failed"
        }), 500


@documents_bp.route("/", methods=["GET"])
@role_required("admin", "employee", "reviewer")
def get_documents():

    claims = get_jwt()
    company_id = claims.get("company_id")
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    if not company_id:
        return jsonify({"message": "Company information missing"}), 401

    # Pagination
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(100, max(1, int(request.args.get("per_page", 10))))
    except ValueError:
        return jsonify({
            "message": "page and per_page must be valid integers"
        }), 400

    # Base company query
    query = Document.query.filter_by(company_id=company_id)

    # Role-based document visibility
    if role == "employee":
        query = query.filter_by(uploaded_by=user_id)

    elif role == "reviewer":
        query = query.filter_by(assigned_reviewer=user_id)

    # Search by filename
    search = request.args.get("search", "").strip()
    if search:
        query = query.filter(
            Document.original_filename.ilike(f"%{search}%")
        )

    # Filter by status
    status = request.args.get("status", "").strip()
    if status:
        query = query.filter(
            Document.status == status
        )

    # Filter by document type
    document_type = request.args.get("document_type", "").strip()
    if document_type:
        query = query.filter(
            Document.document_type == document_type
        )

    # Filter by upload date
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    if date_from:
        try:
            from datetime import datetime
            start_date = datetime.strptime(date_from, "%Y-%m-%d")
            query = query.filter(Document.created_at >= start_date)
        except ValueError:
            return jsonify({
                "message": "date_from must use YYYY-MM-DD format"
            }), 400

    if date_to:
        try:
            from datetime import datetime, timedelta
            end_date = datetime.strptime(date_to, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(Document.created_at < end_date)
        except ValueError:
            return jsonify({
                "message": "date_to must use YYYY-MM-DD format"
            }), 400

    # Newest documents first
    query = query.order_by(Document.created_at.desc())

    # Pagination
    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    result = []

    for document in pagination.items:
        result.append({
            "id": document.id,
            "original_filename": document.original_filename,
            "document_type": document.document_type,
            "file_size": document.file_size,
            "status": document.status,
            "uploaded_by": document.uploaded_by,
            "assigned_reviewer": document.assigned_reviewer,
            "created_at": (
                document.created_at.isoformat()
                if document.created_at else None
            )
        })

    return jsonify({
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_records": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_previous": pagination.has_prev
        },
        "total_documents": pagination.total,
        "documents": result
    }), 200



@documents_bp.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(error):
    return jsonify({
        "message": "Request exceeds the 100 MB total upload limit"
    }), 413



@documents_bp.route("/<int:document_id>/review", methods=["GET"])
@role_required("reviewer")
def get_document_for_review(document_id):

    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    company_id = claims.get("company_id")

    document = Document.query.filter_by(
        id=document_id,
        company_id=company_id,
        assigned_reviewer=current_user_id
    ).first()

    if not document:
        return jsonify({
            "message": "Document not found or not assigned to you"
        }), 404

    if document.status not in ["extracted", "review_submitted"]:
        return jsonify({
            "message": "Document is not ready for review",
            "current_status": document.status
        }), 400

    extracted_data = document.extracted_data or {}

    return jsonify({
        "document": {
            "id": document.id,
            "filename": document.original_filename,
            "document_type": document.document_type,
            "status": document.status,
            "file_size": document.file_size,
            "uploaded_at": (
                document.created_at.isoformat()
                if document.created_at else None
            )
        },
        "extraction": extracted_data,
        "previous_review": document.verification_result
    }), 200

@documents_bp.route("/<int:document_id>/assign-reviewer", methods=["PATCH"])
@role_required("admin")
def assign_reviewer(document_id):

    claims = get_jwt()
    company_id = claims.get("company_id")
    admin_id = int(get_jwt_identity())

    data = request.get_json(silent=True) or {}
    reviewer_id = data.get("reviewer_id")

    # Validate reviewer ID
    if not isinstance(reviewer_id, int) or isinstance(reviewer_id, bool):
        return jsonify({
            "message": "A valid reviewer_id is required"
        }), 400

    # Find document within Admin's company
    document = Document.query.filter_by(
        id=document_id,
        company_id=company_id
    ).first()

    if not document:
        return jsonify({
            "message": "Document not found"
        }), 404

    # Find an active reviewer in the same company
    reviewer = User.query.filter_by(
        id=reviewer_id,
        company_id=company_id,
        role="reviewer",
        is_active=True
    ).first()

    if not reviewer:
        return jsonify({
            "message": "Reviewer not found, inactive, or does not belong to your company"
        }), 404

    # Assign reviewer
    previous_reviewer_id = document.assigned_reviewer
    document.assigned_reviewer = reviewer.id

    try:
        # Add audit record
        log_action(
            company_id=company_id,
            user_id=admin_id,
            action="REVIEWER_ASSIGNED",
            entity_type="Document",
            entity_id=document.id,
            details={
                "previous_reviewer_id": previous_reviewer_id,
                "new_reviewer_id": reviewer.id,
                "reviewer_name": reviewer.name
            }
        )

        db.session.commit()

    except Exception:
        db.session.rollback()
        current_app.logger.exception("Reviewer assignment failed")

        return jsonify({
            "message": "Failed to assign reviewer"
        }), 500

    return jsonify({
        "message": "Reviewer assigned successfully",
        "document_id": document.id,
        "reviewer_id": reviewer.id,
        "reviewer_name": reviewer.name,
        "document_status": document.status
    }), 200

@documents_bp.route("/<int:document_id>/review", methods=["POST"])
@role_required("reviewer")
def submit_document_review(document_id):

    claims = get_jwt()
    company_id = claims.get("company_id")
    reviewer_id = int(get_jwt_identity())

    data = request.get_json(silent=True) or {}

    decision = data.get("decision")
    comments = data.get("comments", "")
    findings = data.get("findings", [])
    corrected_data = data.get("corrected_data")

    # Validate decision
    allowed_decisions = [
        "verified",
        "corrections_requested",
        "flagged_for_admin"
    ]

    if decision not in allowed_decisions:
        return jsonify({
            "message": "Invalid decision",
            "allowed_decisions": allowed_decisions
        }), 400

    if not isinstance(comments, str):
        return jsonify({"message": "Comments must be text"}), 400

    if not isinstance(findings, list):
        return jsonify({"message": "Findings must be a list"}), 400

    if corrected_data is not None and not isinstance(corrected_data, dict):
        return jsonify({
            "message": "corrected_data must be a JSON object"
        }), 400

    # Find document assigned to this reviewer
    document = Document.query.filter_by(
        id=document_id,
        company_id=company_id,
        assigned_reviewer=reviewer_id
    ).first()

    if not document:
        return jsonify({
            "message": "Document not found or not assigned to you"
        }), 404

    if document.status not in ["extracted", "review_submitted"]:
        return jsonify({
            "message": "Document is not ready for review",
            "current_status": document.status
        }), 400

    # Preserve previous review history
    previous_result = dict(document.verification_result or {})

    review_history = previous_result.get("review_history", [])

    if previous_result.get("decision"):
        review_history.append({
            "reviewer_id": previous_result.get("reviewer_id"),
            "decision": previous_result.get("decision"),
            "comments": previous_result.get("comments"),
            "findings": previous_result.get("findings"),
            "corrected_data": previous_result.get("corrected_data"),
            "submitted_at": previous_result.get("submitted_at"),
            "admin_decision": previous_result.get("admin_decision"),
            "employee_resubmission": previous_result.get("employee_resubmission")
        })

    # Save reviewer findings
    document.verification_result = {
        "reviewer_id": reviewer_id,
        "decision": decision,
        "comments": comments,
        "findings": findings,
        "corrected_data": corrected_data,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "review_history": review_history
    }

    # Send to Admin for final decision
    document.status = "review_submitted"

    # Map reviewer decisions to audit actions
    audit_actions = {
        "verified": "DOCUMENT_VERIFIED",
        "corrections_requested": "CORRECTIONS_REQUESTED",
        "flagged_for_admin": "DOCUMENT_FLAGGED"
    }

    try:
        log_action(
            company_id=company_id,
            user_id=reviewer_id,
            action=audit_actions[decision],
            entity_type="Document",
            entity_id=document.id,
            details={
                "decision": decision,
                "comments": comments,
                "findings": findings
            }
        )

        db.session.commit()

    except Exception:
        db.session.rollback()

        current_app.logger.exception(
            "Failed to submit reviewer decision or save audit log"
        )

        return jsonify({
            "message": "Failed to submit review"
        }), 500

    return jsonify({
        "message": "Review submitted successfully",
        "document_id": document.id,
        "decision": decision,
        "status": document.status
    }), 200

@documents_bp.route("/pending-reviews", methods=["GET"])
@role_required("admin")
def get_pending_reviews():

    company_id = get_jwt().get("company_id")

    documents = Document.query.filter_by(
        company_id=company_id,
        status="review_submitted"
    ).order_by(Document.updated_at.desc()).all()

    result = []

    for document in documents:
        result.append({
            "document_id": document.id,
            "filename": document.original_filename,
            "document_type": document.document_type,
            "status": document.status,
            "uploaded_by": document.uploader.name if document.uploader else None,
            "reviewer": document.reviewer.name if document.reviewer else None,
            "extracted_data": document.extracted_data,
            "reviewer_result": document.verification_result,
            "created_at": document.created_at.isoformat() if document.created_at else None
        })

    return jsonify({
        "total": len(result),
        "documents": result
    }), 200

@documents_bp.route("/<int:document_id>/admin-decision", methods=["PATCH"])
@role_required("admin")
def admin_document_decision(document_id):

    claims = get_jwt()
    company_id = claims.get("company_id")
    admin_id = int(get_jwt_identity())

    data = request.get_json(silent=True) or {}

    decision = data.get("decision")
    comments = data.get("comments", "")

    # Validate decision
    if decision not in [
        "approved",
        "rejected",
        "corrections_requested"
    ]:
        return jsonify({
            "message": "Decision must be approved, rejected, or corrections_requested"
        }), 400

    if not isinstance(comments, str):
        return jsonify({
            "message": "Comments must be text"
        }), 400

    # Find document within Admin's company
    document = Document.query.filter_by(
        id=document_id,
        company_id=company_id
    ).first()

    if not document:
        return jsonify({
            "message": "Document not found"
        }), 404

    if document.status != "review_submitted":
        return jsonify({
            "message": "Document is not waiting for Admin review",
            "current_status": document.status
        }), 400

    if not document.verification_result:
        return jsonify({
            "message": "Reviewer submission not found"
        }), 400

    # Preserve reviewer findings and add Admin's final decision
    verification_result = dict(document.verification_result)

    verification_result["admin_decision"] = {
        "decision": decision,
        "comments": comments,
        "decided_at": datetime.now(timezone.utc).isoformat()
    }

    document.verification_result = verification_result
    document.status = decision

    # Map Admin decisions to audit actions
    audit_actions = {
        "approved": "DOCUMENT_APPROVED",
        "rejected": "DOCUMENT_REJECTED",
        "corrections_requested": "ADMIN_CORRECTIONS_REQUESTED"
    }

    try:
        log_action(
            company_id=company_id,
            user_id=admin_id,
            action=audit_actions[decision],
            entity_type="Document",
            entity_id=document.id,
            details={
                "decision": decision,
                "comments": comments,
                "reviewer_id": document.assigned_reviewer
            }
        )

        db.session.commit()

    except Exception:
        db.session.rollback()

        current_app.logger.exception(
            "Failed to save Admin decision or audit log"
        )

        return jsonify({
            "message": "Failed to save Admin decision"
        }), 500

    return jsonify({
        "message": f"Document {decision} successfully",
        "document_id": document.id,
        "status": document.status,
        "admin_decision": decision
    }), 200

@documents_bp.route("/<int:document_id>/tracking", methods=["GET"])
@role_required("employee")
def track_employee_document(document_id):

    claims = get_jwt()
    company_id = claims.get("company_id")
    employee_id = int(get_jwt_identity())

    # Employee can only access their own documents
    document = Document.query.filter_by(
        id=document_id,
        company_id=company_id,
        uploaded_by=employee_id
    ).first()

    if not document:
        return jsonify({
            "message": "Document not found"
        }), 404

    review = document.verification_result or {}

    reviewer_feedback = None
    admin_decision = None

    if review:
        reviewer_feedback = {
            "decision": review.get("decision"),
            "comments": review.get("comments"),
            "findings": review.get("findings", []),
            "corrected_data": review.get("corrected_data")
        }

        admin_decision = review.get("admin_decision")

    return jsonify({
        "document": {
            "id": document.id,
            "filename": document.original_filename,
            "document_type": document.document_type,
            "status": document.status,
            "file_size": document.file_size,
            "uploaded_at": (
                document.created_at.isoformat()
                if document.created_at else None
            ),
            "updated_at": (
                document.updated_at.isoformat()
                if document.updated_at else None
            )
        },
        "reviewer_feedback": reviewer_feedback,
        "admin_decision": admin_decision
    }), 200


@documents_bp.route(
    "/<int:document_id>/resubmit-corrections",
    methods=["POST"]
)
@role_required("employee")
def resubmit_document_corrections(document_id):

    company_id = get_jwt().get("company_id")
    employee_id = int(get_jwt_identity())

    data = request.get_json(silent=True) or {}

    corrected_data = data.get("corrected_data")
    comments = data.get("comments", "")

    # Validate corrected data
    if not isinstance(corrected_data, dict):
        return jsonify({
            "message": "corrected_data must be a JSON object"
        }), 400

    if not isinstance(comments, str):
        return jsonify({
            "message": "Comments must be text"
        }), 400

    # Find document uploaded by this Employee
    document = Document.query.filter_by(
        id=document_id,
        company_id=company_id,
        uploaded_by=employee_id
    ).first()

    if not document:
        return jsonify({
            "message": "Document not found"
        }), 404

    # Only allow resubmission when corrections are requested
    if document.status != "corrections_requested":
        return jsonify({
            "message": "Document is not waiting for corrections",
            "current_status": document.status
        }), 400

    # Preserve existing verification information
    verification_result = dict(document.verification_result or {})

    verification_result["employee_resubmission"] = {
        "employee_id": employee_id,
        "corrected_data": corrected_data,
        "comments": comments,
        "resubmitted_at": datetime.now(timezone.utc).isoformat()
    }

    document.verification_result = verification_result

    # Send document back for review
    document.status = "extracted"

    try:
        log_action(
            company_id=company_id,
            user_id=employee_id,
            action="CORRECTIONS_RESUBMITTED",
            entity_type="Document",
            entity_id=document.id,
            details={
                "comments": comments,
                "corrected_data": corrected_data
            }
        )

        db.session.commit()

    except Exception:
        db.session.rollback()

        current_app.logger.exception(
            "Failed to resubmit corrections or save audit log"
        )

        return jsonify({
            "message": "Failed to resubmit corrections"
        }), 500

    return jsonify({
        "message": "Corrections resubmitted successfully",
        "document_id": document.id,
        "status": document.status
    }), 200

def get_accessible_document(document_id):
    claims = get_jwt()
    company_id = claims.get("company_id")
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    query = Document.query.filter_by(
        id=document_id,
        company_id=company_id
    )

    if role == "employee":
        query = query.filter_by(uploaded_by=user_id)

    elif role == "reviewer":
        query = query.filter_by(assigned_reviewer=user_id)

    elif role != "admin":
        return None

    return query.first()

@documents_bp.route("/<int:document_id>/preview", methods=["GET"])
@role_required("admin", "employee", "reviewer")
def preview_document(document_id):

    document = get_accessible_document(document_id)

    if not document:
        return jsonify({
            "message": "Document not found or access denied"
        }), 404

    file_path = Path(document.file_path).resolve()
    upload_folder = Path(
        current_app.config["UPLOAD_FOLDER"]
    ).resolve()

    # Prevent access outside the upload directory
    if not file_path.is_relative_to(upload_folder):
        return jsonify({
            "message": "Invalid document storage path"
        }), 403

    if not file_path.is_file():
        return jsonify({
            "message": "Document file not found"
        }), 404

    return send_file(
        file_path,
        mimetype="application/pdf",
        as_attachment=False,
        download_name=document.original_filename
    )

@documents_bp.route("/<int:document_id>/download", methods=["GET"])
@role_required("admin", "employee", "reviewer")
def download_document(document_id):

    document = get_accessible_document(document_id)

    if not document:
        return jsonify({
            "message": "Document not found or access denied"
        }), 404

    file_path = Path(document.file_path).resolve()
    upload_folder = Path(
        current_app.config["UPLOAD_FOLDER"]
    ).resolve()

    if not file_path.is_relative_to(upload_folder):
        return jsonify({
            "message": "Invalid document storage path"
        }), 403

    if not file_path.is_file():
        return jsonify({
            "message": "Document file not found"
        }), 404

    return send_file(
        file_path,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=document.original_filename
    )