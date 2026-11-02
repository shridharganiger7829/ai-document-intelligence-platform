
import os


from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt, get_jwt_identity

from app.extensions import db
from app.models import Document
from app.utils.auth_decorators import role_required
from app.services.ocr_service import extract_text_from_pdf
from app.services.extraction_service import extract_structured_data


processing_bp = Blueprint(
    "processing",
    __name__,
    url_prefix="/api/processing"
)


def process_one_document(document):
    """
    Run OCR and structured AI extraction for one document.
    """

    document_id = document.id
    company_id = document.company_id

    try:
        if not os.path.exists(document.file_path):
            raise FileNotFoundError("Stored PDF file not found")

        document.status = "processing"
        db.session.commit()

        # Stage 1: OCR
        ocr_result = extract_text_from_pdf(document.file_path)

        if ocr_result["extraction_status"] != "completed":
            document.status = "extraction_failed"
            document.extracted_data = {
                "ocr": ocr_result,
                "structured_data": None
            }
            db.session.commit()

            return {
                "document_id": document_id,
                "status": "extraction_failed",
                "message": "No readable text found"
            }

        # Stage 2: AI structured extraction
        structured_data = extract_structured_data(
            ocr_result["text"]
        )

        # Save both results in JSONB
        document.extracted_data = {
            "ocr": ocr_result,
            "structured_data": structured_data
        }

        document.status = "extracted"
        db.session.commit()

        return {
            "document_id": document_id,
            "filename": document.original_filename,
            "status": "extracted",
            "structured_data": structured_data
        }

    except Exception:
        db.session.rollback()

        current_app.logger.exception(
            "Processing failed for document %s",
            document_id
        )

        try:
            failed_document = Document.query.filter_by(
                id=document_id,
                company_id=company_id
            ).first()

            if failed_document:
                failed_document.status = "extraction_failed"
                db.session.commit()

        except Exception:
            db.session.rollback()

        return {
            "document_id": document_id,
            "status": "extraction_failed",
            "message": "OCR or AI extraction failed. Check backend logs."
        }


@processing_bp.route(
    "/<int:document_id>/extract",
    methods=["POST"]
)
@role_required("admin", "reviewer")
def process_document(document_id):

    claims = get_jwt()
    company_id = claims.get("company_id")
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    document = Document.query.filter_by(
        id=document_id,
        company_id=company_id
    ).first()

    if not document:
        return jsonify({
            "message": "Document not found"
        }), 404

    if role == "reviewer" and document.assigned_reviewer != user_id:
        return jsonify({
            "message": "You are not assigned to this document"
        }), 403

    result = process_one_document(document)

    if result["status"] != "extracted":
        return jsonify({
            "message": "Document processing failed",
            "result": result
        }), 422

    return jsonify({
        "message": "Document OCR and AI extraction completed",
        "result": result
    }), 200



@processing_bp.route("/bulk-extract", methods=["POST"])
@role_required("admin", "reviewer")
def bulk_extract_documents():
    from app.tasks.document_tasks import process_document_task
    data = request.get_json(silent=True) or {}
    document_ids = data.get("document_ids")

    if not isinstance(document_ids, list) or not document_ids:
        return jsonify({
            "message": "document_ids must be a non-empty list"
        }), 400

    if len(document_ids) > 10:
        return jsonify({
            "message": "Maximum 10 documents allowed per request"
        }), 400

    if any(
        not isinstance(doc_id, int) or isinstance(doc_id, bool) or doc_id <= 0
        for doc_id in document_ids
    ):
        return jsonify({
            "message": "All document IDs must be positive integers"
        }), 400

    # Remove duplicate IDs
    document_ids = list(dict.fromkeys(document_ids))

    claims = get_jwt()
    company_id = claims.get("company_id")
    user_role = claims.get("role")

    # Fetch only documents belonging to this company
    documents = Document.query.filter(
        Document.id.in_(document_ids),
        Document.company_id == company_id
    ).all()

    found_ids = {doc.id for doc in documents}
    missing_ids = [
        doc_id for doc_id in document_ids
        if doc_id not in found_ids
    ]

    if missing_ids:
        return jsonify({
            "message": "Some documents were not found",
            "missing_document_ids": missing_ids
        }), 404

    # Reviewers can process only their assigned documents
    if user_role == "reviewer":
        if any(
            doc.assigned_reviewer != get_jwt_identity()
            for doc in documents
        ):
            return jsonify({
                "message": "You can process only assigned documents"
            }), 403

    queued_tasks = []
    failed_tasks = []

    for document in documents:

        try:
            # Mark document as queued before sending the task
            document.status = "queued"
            db.session.commit()

            # Send document to Celery
            task = process_document_task.delay(
                document.id,
                company_id
            )

            queued_tasks.append({
                "document_id": document.id,
                "task_id": task.id,
                "status": "queued"
            })

        except Exception as error:
            db.session.rollback()

            failed_tasks.append({
                "document_id": document.id,
                "status": "queue_failed",
                "message": str(error)
            })

    return jsonify({
        "message": "Background processing tasks submitted",
        "total": len(document_ids),
        "queued": len(queued_tasks),
        "failed": len(failed_tasks),
        "tasks": queued_tasks,
        "errors": failed_tasks
    }), 202



@processing_bp.route("/status/<int:document_id>", methods=["GET"])
@role_required("admin", "reviewer", "employee")
def get_document_processing_status(document_id):

    claims = get_jwt()
    company_id = claims.get("company_id")
    user_role = claims.get("role")
    current_user_id = int(get_jwt_identity())

    document = Document.query.filter_by(
        id=document_id,
        company_id=company_id
    ).first()

    if not document:
        return jsonify({
            "message": "Document not found"
        }), 404

    # Employee can view only their own documents
    if user_role == "employee":
        if document.uploaded_by != current_user_id:
            return jsonify({
                "message": "You cannot access this document"
            }), 403

    # Reviewer can view only assigned documents
    if user_role == "reviewer":
        if document.assigned_reviewer != current_user_id:
            return jsonify({
                "message": "You are not assigned to this document"
            }), 403

    return jsonify({
        "document_id": document.id,
        "filename": document.original_filename,
        "status": document.status,
        "created_at": document.created_at.isoformat()
            if document.created_at else None,
        "updated_at": document.updated_at.isoformat()
            if document.updated_at else None
    }), 200

