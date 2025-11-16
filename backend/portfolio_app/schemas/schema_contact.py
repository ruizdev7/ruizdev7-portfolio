from marshmallow import Schema, fields, validate


class ContactFormSchema(Schema):
    """Schema for contact form validation"""

    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100),
        error_messages={
            "required": "Name is required",
            "invalid": "Invalid name format",
        },
    )
    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required",
            "invalid": "Invalid email format",
        },
    )
    subject = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=200),
        error_messages={
            "required": "Subject is required",
            "invalid": "Subject must be between 3 and 200 characters",
        },
    )
    message = fields.Str(
        required=True,
        validate=validate.Length(min=10, max=2000),
        error_messages={
            "required": "Message is required",
            "invalid": "Message must be between 10 and 2000 characters",
        },
    )


class ContactMessageResponseSchema(Schema):
    """Schema for contact message response"""

    ccn_contact_message = fields.Int(dump_only=True)
    name = fields.Str(dump_only=True)
    email = fields.Str(dump_only=True)
    subject = fields.Str(dump_only=True)
    message = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    read = fields.Bool(dump_only=True)
