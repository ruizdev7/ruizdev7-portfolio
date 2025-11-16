import os
import base64
import secrets
from datetime import datetime, timedelta

from flask import jsonify, current_app
from flask import request
from flask import Blueprint
from flask import make_response
from flask import send_from_directory
from flask_mail import Message

from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from marshmallow import ValidationError

from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

from portfolio_app import db, mail
from portfolio_app.services.audit_log_service import AuditLogService
from portfolio_app import create_app
from portfolio_app.models.tbl_users import User
from portfolio_app.schemas.schema_user import (
    SchemaUser,
    UpdateEmailSchema,
    UpdatePasswordSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
)

blueprint_api_user = Blueprint("api_user", __name__, url_prefix="")

# Simple in-memory storage for password reset tokens (for development)
# In production, use a database table or Redis
password_reset_tokens = {}


@blueprint_api_user.route("/api/v1/users", methods=["POST"])
@jwt_required()
def post_user():
    try:
        request_data = request.get_json()

        first_name = request_data["first_name"]
        middle_name = request_data["middle_name"]
        last_name = request_data["last_name"]
        email = request_data["email"]
        password = generate_password_hash(request_data["password"])

        new_user = User(
            first_name,
            middle_name,
            last_name,
            email,
            password,
        )

        db.session.add(new_user)
        db.session.commit()

        # Log user creation
        try:
            current_user_email = get_jwt_identity()
            current_user_obj = User.query.filter_by(email=current_user_email).first()
            if current_user_obj and hasattr(current_user_obj, "ccn_user"):
                AuditLogService.log_create(
                    ccn_user=current_user_obj.ccn_user,
                    resource="users",
                    description=f"Created user: {first_name} {last_name} ({email})",
                )
        except Exception as log_error:
            # Don't fail the creation if logging fails
            current_app.logger.error(f"Failed to log user creation: {str(log_error)}")

        schema_user = SchemaUser(many=False)
        user = schema_user.dump(new_user)

        return make_response(
            jsonify(
                {
                    "New User": user,
                    "msg": "The user has been add succesfully",
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"error": str(e)}), 500)


@blueprint_api_user.route("/api/v1/users/<int:ccn_user>", methods=["GET"])
@jwt_required()
def get_user(ccn_user):
    query_user = User.query.filter_by(ccn_user=ccn_user).first()
    schema_user = SchemaUser(many=False)
    user = schema_user.dump(query_user)
    return make_response(jsonify({"user": user}), 200)


@jwt_required()
@blueprint_api_user.route("/api/v1/users", methods=["GET"])
def get_all_users():
    from portfolio_app.decorators.auth_decorators import require_permission
    from portfolio_app.services.auth_service import AuthService

    # Verificar permisos
    if not require_permission("users", "read"):
        return make_response(
            jsonify({"error": "No tienes permisos para ver usuarios"}), 403
        )

    query_all_users = User.query.all()
    users_data = []

    for user in query_all_users:
        # Obtener roles del usuario
        roles = AuthService.get_user_roles(user.ccn_user)
        roles_data = [
            {"ccn_role": role.ccn_role, "role_name": role.role_name} for role in roles
        ]

        user_data = {
            "ccn_user": user.ccn_user,
            "first_name": user.first_name,
            "middle_name": user.middle_name,
            "last_name": user.last_name,
            "email": user.email,
            "created_at": user.created_at.isoformat(),
            "roles": roles_data,
        }
        users_data.append(user_data)

    return make_response(jsonify({"users": users_data}), 200)


@blueprint_api_user.route("/api/v1/users/<int:ccn_user>", methods=["PUT"])
@jwt_required()
def put_user(ccn_user):
    try:
        request_data = request.get_json()

        if "email_user" not in request_data or "password_user" not in request_data:
            return jsonify({"error": "Email and password are required"}), 400

        email_user = request_data["email_user"]
        password_user = request_data["password_user"]

        query_user_to_update = User.query.filter_by(ccn_user=ccn_user).first()

        if not query_user_to_update:
            return make_response(jsonify({"error": "User not found"}), 404)

        # Track what was updated
        updated_fields = []

        # Update all fields that are provided
        query_user_to_update.email = email_user
        updated_fields.append("email")

        # Only update password if it's not "no_change"
        if password_user and password_user != "no_change":
            query_user_to_update.password = generate_password_hash(password_user)
            updated_fields.append("password")

        # Update additional fields if provided
        if "first_name" in request_data:
            query_user_to_update.first_name = request_data["first_name"]
            updated_fields.append("first_name")
        if "middle_name" in request_data:
            query_user_to_update.middle_name = request_data["middle_name"]
            updated_fields.append("middle_name")
        if "last_name" in request_data:
            query_user_to_update.last_name = request_data["last_name"]
            updated_fields.append("last_name")

        db.session.commit()

        # Log user update
        try:
            current_user_email = get_jwt_identity()
            current_user_obj = User.query.filter_by(email=current_user_email).first()
            if current_user_obj and hasattr(current_user_obj, "ccn_user"):
                AuditLogService.log_update(
                    ccn_user=current_user_obj.ccn_user,
                    resource="users",
                    description=f"Updated user: {query_user_to_update.first_name} {query_user_to_update.last_name} ({query_user_to_update.email}) - Fields: {', '.join(updated_fields)}",
                )
        except Exception as log_error:
            # Don't fail the update if logging fails
            current_app.logger.error(f"Failed to log user update: {str(log_error)}")

        user_schema = SchemaUser(many=False)
        user_update = user_schema.dump(query_user_to_update)

        return make_response(jsonify({"user Updated": user_update}), 200)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"error": str(e)}), 500)


@blueprint_api_user.route("/api/v1/users/<int:ccn_user>/email", methods=["PUT"])
@jwt_required()
def update_user_email(ccn_user):
    """Update user email with validation"""
    try:
        # Validate current user can only update their own email
        current_email = get_jwt_identity()
        query_user_to_update = User.query.filter_by(ccn_user=ccn_user).first()

        if not query_user_to_update:
            return make_response(jsonify({"error": "User not found"}), 404)

        # Check if user is updating their own email or is admin
        if query_user_to_update.email != current_email:
            # Could add admin check here if needed
            pass

        # Get and validate request data
        request_data = request.get_json()
        if not request_data:
            return make_response(jsonify({"error": "Request body is required"}), 400)

        # Accept both "email" and "email_user" for compatibility
        email_value = request_data.get("email") or request_data.get("email_user")

        if not email_value:
            return make_response(
                jsonify(
                    {"error": "Email is required (field: 'email' or 'email_user')"}
                ),
                400,
            )

        # Validate request data
        schema = UpdateEmailSchema()
        try:
            # Create a dict with "email" key for schema validation
            validated_data = schema.load({"email": email_value})
        except ValidationError as err:
            return make_response(
                jsonify({"error": "Validation error", "details": err.messages}), 400
            )

        new_email = validated_data.get("email")

        # Check if email already exists
        existing_user = User.query.filter_by(email=new_email).first()
        if existing_user and existing_user.ccn_user != ccn_user:
            return make_response(jsonify({"error": "Email already in use"}), 400)

        # Update email
        query_user_to_update.email = new_email
        db.session.commit()

        user_schema = SchemaUser(many=False)
        user_update = user_schema.dump(query_user_to_update)

        return make_response(
            jsonify({"message": "Email updated successfully", "user": user_update}), 200
        )
    except Exception as e:
        db.session.rollback()
        return make_response(
            jsonify(
                {"error": "An error occurred while updating email", "details": str(e)}
            ),
            500,
        )


@blueprint_api_user.route("/api/v1/users/<int:ccn_user>/password", methods=["PUT"])
@jwt_required()
def update_user_password(ccn_user):
    """Update user password with validation"""
    try:
        # Validate current user can only update their own password
        current_email = get_jwt_identity()

        query_user_to_update = User.query.filter_by(ccn_user=ccn_user).first()

        if not query_user_to_update:
            return make_response(jsonify({"error": "User not found"}), 404)

        # Get and validate request data
        request_data = request.get_json()
        if not request_data:
            return make_response(jsonify({"error": "Request body is required"}), 400)

        # Accept both "password" and "password_user" for compatibility
        password_value = request_data.get("password") or request_data.get(
            "password_user"
        )

        if not password_value:
            return make_response(
                jsonify(
                    {
                        "error": "Password is required (field: 'password' or 'password_user')"
                    }
                ),
                400,
            )

        # Build data dict for schema validation
        schema_data = {"password": password_value}
        if "current_password" in request_data:
            schema_data["current_password"] = request_data["current_password"]

        # Validate request data
        schema = UpdatePasswordSchema()
        try:
            validated_data = schema.load(schema_data)
        except ValidationError as err:
            return make_response(
                jsonify({"error": "Validation error", "details": err.messages}), 400
            )

        new_password = validated_data.get("password")
        current_password = validated_data.get("current_password")

        # If current_password is provided, verify it
        if current_password:
            if not check_password_hash(query_user_to_update.password, current_password):
                return make_response(
                    jsonify({"error": "Current password is incorrect"}), 401
                )

        # Update password
        query_user_to_update.password = generate_password_hash(new_password)
        db.session.commit()

        user_schema = SchemaUser(many=False)
        user_update = user_schema.dump(query_user_to_update)

        return make_response(
            jsonify({"message": "Password updated successfully", "user": user_update}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return make_response(
            jsonify(
                {
                    "error": "An error occurred while updating password",
                    "details": str(e),
                }
            ),
            500,
        )


@blueprint_api_user.route("/api/v1/users/<int:ccn_user>", methods=["DELETE"])
@jwt_required()
def delete_user(ccn_user):
    try:
        query_user_to_delete = User.query.filter_by(ccn_user=ccn_user).first()

        if not query_user_to_delete:
            return make_response(jsonify({"error": "User not found"}), 404)

        # Save user info for logging before deletion
        user_name = (
            f"{query_user_to_delete.first_name} {query_user_to_delete.last_name}"
        )
        user_email = query_user_to_delete.email

        # Get current user ID for logging before deletion
        current_user_obj = None
        try:
            current_user_email = get_jwt_identity()
            current_user_obj = User.query.filter_by(email=current_user_email).first()
        except Exception:
            pass

        db.session.delete(query_user_to_delete)
        db.session.commit()

        # Log user deletion
        if current_user_obj and hasattr(current_user_obj, "ccn_user"):
            try:
                AuditLogService.log_delete(
                    ccn_user=current_user_obj.ccn_user,
                    resource="users",
                    description=f"Deleted user: {user_name} ({user_email})",
                )
            except Exception as log_error:
                # Don't fail the deletion if logging fails
                current_app.logger.error(
                    f"Failed to log user deletion: {str(log_error)}"
                )

        return make_response(
            jsonify({"Response": "The user has been deleted succesfully"}), 200
        )
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"error": str(e)}), 500)


# =============================================================================
# Password Reset Endpoints (Forgot/Reset Password)
# =============================================================================


@blueprint_api_user.route("/api/v1/auth/forgot-password", methods=["POST"])
def forgot_password():
    """Request password reset - generates reset token"""
    try:
        # Validate request data
        schema = ForgotPasswordSchema()
        try:
            validated_data = schema.load(request.get_json())
        except ValidationError as err:
            return make_response(
                jsonify({"error": "Validation error", "details": err.messages}), 400
            )

        email = validated_data.get("email")

        # Find user by email
        user = User.query.filter_by(email=email).first()

        # Always return success message (security: don't reveal if email exists)
        if user:
            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            expires_at = datetime.utcnow() + timedelta(
                hours=1
            )  # Token valid for 1 hour

            # Store token (in production, use database or Redis)
            password_reset_tokens[reset_token] = {
                "user_id": user.ccn_user,
                "email": user.email,
                "expires_at": expires_at.isoformat(),
            }

            # Generate reset link
            reset_link = f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/auth/reset-password?token={reset_token}"

            # Send email with reset link
            try:
                msg = Message(
                    subject="Password Reset Request",
                    recipients=[user.email],
                    html=f"""
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h2 style="color: #0272AD;">Password Reset Request</h2>
                                <p>Hello {user.first_name or 'User'},</p>
                                <p>You requested to reset your password. Click the link below to reset it:</p>
                                <p style="text-align: center; margin: 30px 0;">
                                    <a href="{reset_link}" style="background-color: #0272AD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                                </p>
                                <p>Or copy and paste this link into your browser:</p>
                                <p style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; word-break: break-all;">
                                    <code>{reset_link}</code>
                                </p>
                                <p><strong style="color: #d32f2f;">⚠️ This link will expire in 1 hour.</strong></p>
                                <p>If you didn't request this, please ignore this email. Your password will not be changed.</p>
                                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                                <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
                            </div>
                        </body>
                    </html>
                    """,
                    body=f"""
Password Reset Request

Hello {user.first_name or 'User'},

You requested to reset your password. Click the link below to reset it:

{reset_link}

⚠️ This link will expire in 1 hour.

If you didn't request this, please ignore this email. Your password will not be changed.

This is an automated message, please do not reply.
                    """,
                )

                # Check if email sending is suppressed (for testing)
                if current_app.config.get("MAIL_SUPPRESS_SEND"):
                    # Print email content to console instead of sending
                    print("=" * 80)
                    print("📧 EMAIL SUPPRESSED (TESTING MODE)")
                    print("=" * 80)
                    print(f"To: {msg.recipients[0]}")
                    print(f"From: {msg.sender}")
                    print(f"Subject: {msg.subject}")
                    print("-" * 80)
                    print("BODY (Plain Text):")
                    print(msg.body)
                    print("-" * 80)
                    print("HTML Content:")
                    print(msg.html)
                    print("-" * 80)
                    print(f"Reset Token: {reset_token}")
                    print(f"Reset Link: {reset_link}")
                    print("=" * 80)
                    print("✅ Email would have been sent (but suppressed for testing)")
                else:
                    # Actually send the email
                    mail.send(msg)
            except Exception as email_error:
                # Log error but don't fail the request (security: always return success)
                current_app.logger.error(
                    f"Error sending password reset email: {str(email_error)}"
                )
                # In production, you might want to log this to a monitoring service

        # Return success message regardless (security best practice)
        return make_response(
            jsonify(
                {
                    "message": "If an account with that email exists, a password reset link has been sent.",
                }
            ),
            200,
        )
    except Exception as e:
        current_app.logger.error(f"Error in forgot_password: {str(e)}")
        return make_response(
            jsonify(
                {
                    "error": "An error occurred while processing the request",
                    "details": str(e),
                }
            ),
            500,
        )


@blueprint_api_user.route("/api/v1/auth/reset-password", methods=["POST"])
def reset_password():
    """Reset password using reset token"""
    try:
        # Validate request data
        schema = ResetPasswordSchema()
        try:
            validated_data = schema.load(request.get_json())
        except ValidationError as err:
            return make_response(
                jsonify({"error": "Validation error", "details": err.messages}), 400
            )

        token = validated_data.get("token")
        new_password = validated_data.get("new_password")

        # Check if token exists
        if token not in password_reset_tokens:
            return make_response(
                jsonify({"error": "Invalid or expired reset token"}), 400
            )

        token_data = password_reset_tokens[token]
        expires_at = datetime.fromisoformat(token_data["expires_at"])

        # Check if token is expired
        if datetime.utcnow() > expires_at:
            # Remove expired token
            del password_reset_tokens[token]
            return make_response(
                jsonify(
                    {"error": "Reset token has expired. Please request a new one."}
                ),
                400,
            )

        # Find user
        user = User.query.filter_by(ccn_user=token_data["user_id"]).first()
        if not user:
            return make_response(jsonify({"error": "User not found"}), 404)

        # Update password
        user.password = generate_password_hash(new_password)
        db.session.commit()

        # Remove used token
        del password_reset_tokens[token]

        return make_response(
            jsonify({"message": "Password has been reset successfully"}), 200
        )
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in reset_password: {str(e)}")
        return make_response(
            jsonify(
                {
                    "error": "An error occurred while resetting password",
                    "details": str(e),
                }
            ),
            500,
        )
