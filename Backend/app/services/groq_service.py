
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


def analyze_document(document_text):

    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": """
                You are an enterprise document analysis assistant.
                Extract accurate information from the provided document.
                Do not invent missing information.
                Return structured JSON.
                """
            },
            {
                "role": "user",
                "content": f"""
                Analyze this document and extract:

                1. Document type
                2. Document number
                3. Person or company name
                4. Date
                5. Amount
                6. Important details

                Document:
                {document_text}
                """
            }
        ],
        temperature=1,
        max_completion_tokens=2048,
        top_p=1,
        reasoning_effort="medium",
        stream=False
    )

    return completion.choices[0].message.content
