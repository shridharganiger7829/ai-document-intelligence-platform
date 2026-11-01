
import os
import base64

import fitz
from groq import Groq
from flask import current_app


MINIMUM_TEXT_LENGTH = 30
MAX_PAGES = 20


def get_groq_client():
    api_key = current_app.config.get("GROQ_API_KEY")

    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured")

    return Groq(api_key=api_key)


def extract_scanned_page(client, page):
    """
    Convert a PDF page to an image and extract its text
    using Groq Vision.
    """

    vision_model = current_app.config["GROQ_VISION_MODEL"]

    # Render PDF page as an image in memory
    pixmap = page.get_pixmap(
        matrix=fitz.Matrix(1.5, 1.5),
        alpha=False
    )

    image_bytes = pixmap.tobytes("jpeg")

    # Convert image to base64
    encoded_image = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    image_data = f"data:image/jpeg;base64,{encoded_image}"

    response = client.chat.completions.create(
        model=vision_model,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Extract all readable text from this "
                            "document page. Preserve the original "
                            "wording, numbers, dates, tables and "
                            "identifiers as accurately as possible. "
                            "Do not summarize or invent missing text. "
                            "Return only the extracted text."
                        )
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_data
                        }
                    }
                ]
            }
        ],
        temperature=0,
        max_completion_tokens=4000,
        stream=False
    )

    return response.choices[0].message.content or ""


def extract_text_from_pdf(file_path):
    """
    Extract text from both normal and scanned PDF pages.

    Normal PDFs:
        PyMuPDF text extraction.

    Scanned PDFs:
        Groq Vision OCR.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError("PDF file not found")

    client = get_groq_client()

    extracted_pages = []

    try:
        pdf_document = fitz.open(file_path)

        if pdf_document.page_count == 0:
            raise ValueError("PDF contains no pages")

        if pdf_document.page_count > MAX_PAGES:
            raise ValueError(
                f"PDF exceeds the maximum of {MAX_PAGES} pages"
            )

        for page_number, page in enumerate(pdf_document):

            # First attempt normal PDF text extraction
            page_text = page.get_text("text").strip()

            extraction_method = "pymupdf"

            # Use vision OCR if selectable text is insufficient
            if len(page_text) < MINIMUM_TEXT_LENGTH:

                page_text = extract_scanned_page(
                    client,
                    page
                )

                extraction_method = "groq_vision"

            extracted_pages.append({
                "page": page_number + 1,
                "method": extraction_method,
                "text": page_text.strip()
            })

        pdf_document.close()

        combined_text = "\n\n".join(
            f"--- Page {item['page']} ---\n{item['text']}"
            for item in extracted_pages
        )

        return {
            "text": combined_text,
            "page_count": len(extracted_pages),
            "pages": extracted_pages,
            "extraction_status": (
                "completed" if combined_text.strip()
                else "no_text_found"
            )
        }

    except Exception:
        raise
