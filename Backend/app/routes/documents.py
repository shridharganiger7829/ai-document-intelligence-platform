
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


def is_allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


@documents_bp.route("/upload", methods=["POST"])
@role_required("admin", "employee")
def upload_document():

    if "file" not in request.files:
        return jsonify({"message": "No file provided"}), 400

    file = request.files["file"]

    if not file or not file.filename:
        return jsonify({"message": "Please select a file"}), 400

    original_filename = secure_filename(file.filename)

    if not original_filename or not is_allowed_file(original_filename):
        return jsonify({
            "message": "Only PDF documents are allowed"
        }), 400

    # Validate PDF file signature
    file_signature = file.stream.read(5)
    file.stream.seek(0)

    if file_signature != b"%PDF-":
        return jsonify({
            "message": "Invalid PDF file"
        }), 400

    # Check file size
    file.stream.seek(0, os.SEEK_END)
    file_size = file.stream.tell()
    file.stream.seek(0)

    if file_size == 0:
        return jsonify({"message": "Empty files are not allowed"}), 400

    if file_size > current_app.config["MAX_CONTENT_LENGTH"]:
        return jsonify({"message": "File exceeds the 16 MB limit"}), 413

    company_id = get_jwt().get("company_id")
    uploaded_by = int(get_jwt_identity())

    # Generate a unique filename
    stored_filename = f"{uuid.uuid4().hex}.pdf"

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, stored_filename)

    try:
        file.save(file_path)

        document = Document(
            company_id=company_id,
            uploaded_by=uploaded_by,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            mime_type="application/pdf",
            file_size=file_size,
            document_type=request.form.get("document_type"),
            status="uploaded"
        )

        db.session.add(document)
        db.session.commit()

        return jsonify({
            "message": "Document uploaded successfully",
            "document": {
                "id": document.id,
                "original_filename": document.original_filename,
                "document_type": document.document_type,
                "file_size": document.file_size,
                "status": document.status,
                "created_at": (
                    document.created_at.isoformat()
                    if document.created_at else None
                )
            }
        }), 201

    except Exception:
        db.session.rollback()

        if os.path.exists(file_path):
            os.remove(file_path)

        current_app.logger.exception("Document upload failed")

        return jsonify({
            "message": "Document upload failed"
        }), 500


@documents_bp.route("/", methods=["GET"])
@role_required("admin", "employee", "reviewer")
def get_documents():

    claims = get_jwt()
    company_id = claims.get("company_id")
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    query = Document.query.filter_by(company_id=company_id)

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
        "message": "File exceeds the 16 MB upload limit"
    }), 413
