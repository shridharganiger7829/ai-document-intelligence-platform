
from app.celery_app import celery
from app.extensions import db
from app.models import Document
from app.services.ocr_service import extract_text_from_pdf
from app.services.extraction_service import extract_structured_data


@celery.task(
    bind=True,
    name="app.tasks.document_tasks.process_document_task"
)
def process_document_task(self, document_id, company_id):

    try:
        # Find document within the correct company
        document = Document.query.filter_by(
            id=document_id,
            company_id=company_id
        ).first()

        if not document:
            return {
                "status": "failed",
                "document_id": document_id,
                "message": "Document not found"
            }

        # Update processing status
        document.status = "processing"
        db.session.commit()

        # Step 1: Extract text using PyMuPDF / Groq Vision
        ocr_result = extract_text_from_pdf(document.file_path)

        # Step 2: Extract structured data using Groq AI
        structured_data = extract_structured_data(
            ocr_result["text"]
        )

        # Step 3: Store both extraction results
        document.extracted_data = {
            "ocr": ocr_result,
            "structured_data": structured_data
        }

        # Step 4: Update document status
        document.status = "extracted"

        db.session.commit()

        return {
            "status": "success",
            "document_id": document_id,
            "message": "Document processed successfully"
        }

    except Exception as error:

        db.session.rollback()

        # Update failed document status
        document = Document.query.filter_by(
            id=document_id,
            company_id=company_id
        ).first()

        if document:
            document.status = "extraction_failed"
            db.session.commit()

        return {
            "status": "failed",
            "document_id": document_id,
            "message": str(error)
        }

    finally:
        db.session.remove()
