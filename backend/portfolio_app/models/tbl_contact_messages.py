from portfolio_app.extensions import db
from datetime import datetime


class ContactMessage(db.Model):
    __tablename__ = "tbl_contact_messages"

    ccn_contact_message = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    read = db.Column(db.Boolean, default=False, nullable=False)

    def __init__(self, name, email, subject, message):
        self.name = name
        self.email = email
        self.subject = subject
        self.message = message
        self.created_at = datetime.utcnow()
        self.read = False

    def to_dict(self):
        return {
            "ccn_contact_message": self.ccn_contact_message,
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read": self.read,
        }

    def __repr__(self):
        return f"ContactMessage('{self.name}', Email: '{self.email}', Subject: '{self.subject}')"
