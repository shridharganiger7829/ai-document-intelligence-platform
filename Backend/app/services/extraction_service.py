
import json
from groq import Groq
from flask import current_app


def get_groq_client():
    api_key = current_app.config.get("GROQ_API_KEY")

    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured")

    return Groq(api_key=api_key)


def extract_structured_data(ocr_text):
    if not ocr_text or not ocr_text.strip():
        raise ValueError("OCR text is empty")

    client = get_groq_client()
    model = current_app.config["GROQ_MODEL"]

    prompt = """
You are an enterprise document data extraction system.

Extract information from the supplied document text.

Return ONLY a valid JSON object. Do not include Markdown,
explanations, or text outside the JSON object.

Rules:
1. Extract only information explicitly present in the document.
2. Do not invent or assume missing values.
3. Use null for missing values.
4. Keep invoice numbers and other identifiers as strings.
5. Use numbers for monetary amounts and quantities when possible.
6. Preserve the original currency where identifiable.
7. Do not calculate or modify amounts.
8. Preserve every line item found in the document.
9. If the document is not an invoice, identify its document_type
   and populate only fields that can be reliably extracted.
10. Use the exact JSON structure below.

JSON structure:

{
  "document_type": "invoice",
  "invoice_details": {
    "invoice_number": null,
    "invoice_date": null,
    "due_date": null,
    "purchase_order_number": null
  },
  "vendor": {
    "name": null,
    "address": null
  },
  "bill_to": {
    "name": null,
    "address": null
  },
  "ship_to": {
    "name": null,
    "address": null
  },
  "line_items": [
    {
      "quantity": null,
      "description": null,
      "unit_price": null,
      "amount": null
    }
  ],
  "financial_summary": {
    "subtotal": null,
    "tax_rate": null,
    "tax_amount": null,
    "total": null,
    "currency": null
  },
  "payment_terms": null
}

Document text:

""" + ocr_text

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You extract business document information "
                    "and return valid JSON only."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={"type": "json_object"},
        temperature=0,
        max_completion_tokens=4000,
        stream=False
    )

    response_text = response.choices[0].message.content

    if not response_text:
        raise ValueError("Groq returned an empty response")

    try:
        extracted_data = json.loads(response_text)
    except json.JSONDecodeError as error:
        raise ValueError(
            "Groq returned invalid JSON"
        ) from error

    if not isinstance(extracted_data, dict):
        raise ValueError("AI response must be a JSON object")

    required_sections = [
        "document_type",
        "invoice_details",
        "vendor",
        "bill_to",
        "ship_to",
        "line_items",
        "financial_summary",
        "payment_terms"
    ]

    for section in required_sections:
        if section not in extracted_data:
            raise ValueError(
                f"AI response is missing the {section} field"
            )

    return extracted_data
