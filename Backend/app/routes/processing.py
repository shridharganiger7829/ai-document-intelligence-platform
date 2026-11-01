
from flask import Blueprint, jsonify, current_app
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


@processing_bp.route("/<int:document_id>/extract", methods=["POST"])
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

    try:
        document.status = "processing"
        db.session.commit()

        # Stage 1: Extract raw text from PDF
        ocr_result = extract_text_from_pdf(document.file_path)

        if ocr_result["extraction_status"] != "completed":
            document.status = "extraction_failed"
            document.extracted_data = {
                "ocr": ocr_result,
                "structured_data": None
            }
            db.session.commit()

            return jsonify({
                "message": "No readable text found",
                "document_id": document.id,
                "status": document.status
            }), 422

        # Stage 2: Convert raw text into structured JSON
        structured_data = extract_structured_data(
            ocr_result["text"]
        )

        # Save both OCR text and AI-extracted JSON
        document.extracted_data = {
            "ocr": ocr_result,
            "structured_data": structured_data
        }

        document.status = "extracted"
        db.session.commit()

        return jsonify({
            "message": "Document OCR and AI extraction completed",
            "document_id": document.id,
            "status": document.status,
            "structured_data": structured_data
        }), 200

    except Exception:
        db.session.rollback()

        current_app.logger.exception(
            "Document processing failed"
        )

        # Preserve the fact that processing failed
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

        return jsonify({
            "message": "Document processing failed. Check backend logs."
        }), 500
