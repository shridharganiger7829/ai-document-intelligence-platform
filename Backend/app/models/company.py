
from datetime import datetime, timezone

from app.extensions import db


class Company(db.Model):
    __tablename__ = "companies"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)

    email = db.Column(db.String(150), nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    users = db.relationship(
        "User",
        back_populates="company",
        cascade="all, delete-orphan"
    )

    documents = db.relationship(
        "Document",
        back_populates="company"
    )

    def __repr__(self):
        return f"<Company {self.name}>"
