from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from portfolio_app.schemas.schema_contact import ContactFormSchema
from portfolio_app.models.tbl_contact_messages import ContactMessage
from portfolio_app.extensions import db

blueprint_api_contact = Blueprint("api_contact", __name__, url_prefix="")


@blueprint_api_contact.route("/api/v1/contact", methods=["POST"])
def submit_contact_form():
    """Handle contact form submission"""
    try:
        # Validate input data
        schema = ContactFormSchema()
        data = schema.load(request.json)

        # Extract form data
        name = data.get("name")
        email = data.get("email")
        subject = data.get("subject")
        message = data.get("message")

        # Create and save contact message
        contact_message = ContactMessage(
            name=name,
            email=email,
            subject=subject,
            message=message,
        )

        db.session.add(contact_message)
        db.session.commit()

        print(f"📧 Contact Form Submission Saved:")
        print(f"   ID: {contact_message.ccn_contact_message}")
        print(f"   Name: {name}")
        print(f"   Email: {email}")
        print(f"   Subject: {subject}")

        # Return success response
        return (
            jsonify(
                {
                    "message": "Thank you for your message! I'll get back to you soon.",
                    "status": "success",
                }
            ),
            200,
        )

    except ValidationError as e:
        return (
            jsonify(
                {
                    "error": "Validation error",
                    "details": e.messages,
                }
            ),
            400,
        )
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error processing contact form: {str(e)}")
        return (
            jsonify(
                {
                    "error": "An error occurred while processing your message. Please try again later.",
                    "details": str(e) if request.json else "Unknown error",
                }
            ),
            500,
        )


@blueprint_api_contact.route("/api/v1/contact", methods=["GET"])
@jwt_required()
def get_contact_messages():
    """Get all contact messages (requires authentication)"""
    try:
        # Get pagination parameters
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        # Get messages with pagination
        pagination = ContactMessage.query.order_by(
            ContactMessage.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)

        # Convert to dict format
        messages = [msg.to_dict() for msg in pagination.items]

        return (
            jsonify(
                {
                    "messages": messages,
                    "pagination": {
                        "page": page,
                        "per_page": per_page,
                        "total": pagination.total,
                        "pages": pagination.pages,
                        "has_next": pagination.has_next,
                        "has_prev": pagination.has_prev,
                    },
                }
            ),
            200,
        )

    except Exception as e:
        print(f"❌ Error getting contact messages: {str(e)}")
        return (
            jsonify(
                {
                    "error": "An error occurred while fetching messages.",
                    "details": str(e),
                }
            ),
            500,
        )


@blueprint_api_contact.route("/api/v1/contact/<int:message_id>/read", methods=["PUT"])
@jwt_required()
def mark_message_as_read(message_id):
    """Mark a contact message as read"""
    try:
        message = ContactMessage.query.get_or_404(message_id)
        message.read = True
        db.session.commit()

        return (
            jsonify({"message": "Message marked as read", "data": message.to_dict()}),
            200,
        )

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error marking message as read: {str(e)}")
        return (
            jsonify(
                {
                    "error": "An error occurred while updating the message.",
                    "details": str(e),
                }
            ),
            500,
        )
