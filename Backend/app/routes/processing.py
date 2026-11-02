
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


@processing_bp.route(
    "/bulk-extract",
    methods=["POST"]
)
@role_required("admin", "reviewer")
def bulk_extract_documents():

    claims = get_jwt()
    company_id = claims.get("company_id")
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    data = request.get_json() or {}
    document_ids = data.get("document_ids")

    if not isinstance(document_ids, list) or not document_ids:
        return jsonify({
            "message": "Provide a non-empty document_ids list"
        }), 400

    if len(document_ids) > 10:
        return jsonify({
            "message": "Maximum 10 documents are allowed per request"
        }), 400

    if any(
        not isinstance(document_id, int) or isinstance(document_id, bool)
        or document_id <= 0
        for document_id in document_ids
    ):
        return jsonify({
            "message": "All document IDs must be positive integers"
        }), 400

    # Remove duplicate IDs while preserving order
    document_ids = list(dict.fromkeys(document_ids))

    documents = Document.query.filter(
        Document.company_id == company_id,
        Document.id.in_(document_ids)
    ).all()

    found_ids = {document.id for document in documents}
    missing_ids = [
        document_id
        for document_id in document_ids
        if document_id not in found_ids
    ]

    if missing_ids:
        return jsonify({
            "message": "Some documents were not found in your company",
            "missing_document_ids": missing_ids
        }), 404

    # Reviewers can process only documents assigned to them
    if role == "reviewer":
        unauthorized_ids = [
            document.id
            for document in documents
            if document.assigned_reviewer != user_id
        ]

        if unauthorized_ids:
            return jsonify({
                "message": "You are not assigned to all selected documents",
                "unauthorized_document_ids": unauthorized_ids
            }), 403

    # Process documents in the requested order
    document_map = {
        document.id: document
        for document in documents
    }

    results = []

    for document_id in document_ids:
        document = document_map[document_id]

        result = process_one_document(document)
        results.append(result)

    successful = sum(
        1 for result in results
        if result["status"] == "extracted"
    )

    failed = len(results) - successful

    return jsonify({
        "message": "Bulk document processing completed",
        "total_documents": len(results),
        "successful": successful,
        "failed": failed,
        "results": results
    }), 200
