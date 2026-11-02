
import os
import uuid

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt, get_jwt_identity
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

from app.extensions import db
from app.models import Document
from app.utils.auth_decorators import role_required


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
            successful.append(document)

        except Exception:
            current_app.logger.exception(
                "Failed to save uploaded file"
            )

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

    query = Document.query.filter_by(
        company_id=company_id
    )

    if role == "employee":
        query = query.filter_by(uploaded_by=user_id)

    elif role == "reviewer":
        query = query.filter_by(assigned_reviewer=user_id)

    documents = query.order_by(
        Document.created_at.desc()
    ).all()

    result = []

    for document in documents:
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
        "total_documents": len(result),
        "documents": result
    }), 200


@documents_bp.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(error):
    return jsonify({
        "message": "Request exceeds the 100 MB total upload limit"
    }), 413
