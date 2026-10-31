
from datetime import datetime, timezone

from sqlalchemy.dialects.postgresql import JSONB

from app.extensions import db


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)

    company_id = db.Column(
        db.Integer,
        db.ForeignKey("companies.id"),
        nullable=False
    )

    uploaded_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    assigned_reviewer = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    original_filename = db.Column(
        db.String(255),
        nullable=False
    )

    stored_filename = db.Column(
        db.String(255),
        nullable=False
    )

    file_path = db.Column(
        db.String(500),
        nullable=False
    )

    mime_type = db.Column(db.String(100))

    file_size = db.Column(db.BigInteger)

    document_type = db.Column(db.String(100))

    status = db.Column(
        db.String(30),
        nullable=False,
        default="uploaded"
    )

    extracted_data = db.Column(JSONB, nullable=True)

    verification_result = db.Column(JSONB, nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    company = db.relationship(
        "Company",
        back_populates="documents"
    )

    uploader = db.relationship(
        "User",
        foreign_keys=[uploaded_by],
        back_populates="uploaded_documents"
    )

    reviewer = db.relationship(
        "User",
        foreign_keys=[assigned_reviewer],
        back_populates="assigned_documents"
    )

    def __repr__(self):
        return f"<Document {self.original_filename}>"
