
from datetime import datetime, timezone

from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    company_id = db.Column(
        db.Integer,
        db.ForeignKey("companies.id"),
        nullable=False
    )

    name = db.Column(db.String(120), nullable=False)

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(db.String(255), nullable=False)

    role = db.Column(
        db.String(20),
        nullable=False,
        default="employee"
    )

    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    company = db.relationship(
        "Company",
        back_populates="users"
    )

    uploaded_documents = db.relationship(
        "Document",
        foreign_keys="Document.uploaded_by",
        back_populates="uploader"
    )

    assigned_documents = db.relationship(
        "Document",
        foreign_keys="Document.assigned_reviewer",
        back_populates="reviewer"
    )

    def __repr__(self):
        return f"<User {self.email}>"
