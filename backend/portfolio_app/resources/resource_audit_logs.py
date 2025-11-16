from typing import Tuple, List, Dict, Any, Optional
from flask import Blueprint, request, jsonify, make_response, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from portfolio_app.decorators.auth_decorators import require_permission
from portfolio_app.models.tbl_audit_logs import AuditLog
from portfolio_app.models.tbl_users import User
from portfolio_app import db
from sqlalchemy import desc


blueprint_api_audit_logs = Blueprint("api_audit_logs", __name__, url_prefix="")


@blueprint_api_audit_logs.route("/api/v1/audit-logs", methods=["GET"])
@jwt_required()
@require_permission("users", "read")
def get_audit_logs() -> Response:
    """Get audit logs with pagination and filtering"""
    try:
        # Get query parameters
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 50, type=int)
        user_id = request.args.get("user_id", type=int)
        event_type = request.args.get("event_type")
        resource = request.args.get("resource")
        action = request.args.get("action")

        # Build query
        query = AuditLog.query

        # Apply filters
        if user_id:
            query = query.filter(AuditLog.ccn_user == user_id)
        if event_type:
            query = query.filter(AuditLog.event_type == event_type)
        if resource:
            query = query.filter(AuditLog.resource == resource)
        if action:
            query = query.filter(AuditLog.action == action)

        # Order by created_at descending (newest first)
        query = query.order_by(desc(AuditLog.created_at))

        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        # Convert to dict
        logs_data = [log.to_dict() for log in pagination.items]

        # Include user information for each log
        for log in logs_data:
            if log["ccn_user"]:
                user = User.query.get(log["ccn_user"])
                if user:
                    log["user"] = {
                        "ccn_user": user.ccn_user,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "email": user.email,
                    }
                else:
                    log["user"] = None
            else:
                log["user"] = None

        return make_response(
            jsonify(
                {
                    "logs": logs_data,
                    "pagination": {
                        "page": pagination.page,
                        "per_page": pagination.per_page,
                        "total": pagination.total,
                        "pages": pagination.pages,
                    },
                }
            ),
            200,
        )
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)


@blueprint_api_audit_logs.route("/api/v1/audit-logs/<int:log_id>", methods=["GET"])
@jwt_required()
@require_permission("users", "read")
def get_audit_log(log_id: int) -> Response:
    """Get a specific audit log"""
    try:
        log = AuditLog.query.get(log_id)
        if not log:
            return make_response(jsonify({"error": "Audit log not found"}), 404)

        log_data = log.to_dict()

        # Include user information
        if log_data["ccn_user"]:
            user = User.query.get(log_data["ccn_user"])
            if user:
                log_data["user"] = {
                    "ccn_user": user.ccn_user,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                }
            else:
                log_data["user"] = None
        else:
            log_data["user"] = None

        return make_response(jsonify({"log": log_data}), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)


@blueprint_api_audit_logs.route("/api/v1/audit-logs/my-logs", methods=["GET"])
@jwt_required()
def get_my_audit_logs() -> Response:
    """Get current user's audit logs"""
    try:
        current_user_email = get_jwt_identity()

        # Get user by email
        user = User.query.filter_by(email=current_user_email).first()
        if not user:
            return make_response(jsonify({"error": "User not found"}), 404)

        current_user_id = user.ccn_user

        # Get query parameters
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 50, type=int)
        event_type = request.args.get("event_type")
        resource = request.args.get("resource")
        action = request.args.get("action")

        # Build query for current user
        query = AuditLog.query.filter(AuditLog.ccn_user == current_user_id)

        # Apply filters
        if event_type:
            query = query.filter(AuditLog.event_type == event_type)
        if resource:
            query = query.filter(AuditLog.resource == resource)
        if action:
            query = query.filter(AuditLog.action == action)

        # Order by created_at descending (newest first)
        query = query.order_by(desc(AuditLog.created_at))

        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        # Convert to dict
        logs_data = [log.to_dict() for log in pagination.items]

        return make_response(
            jsonify(
                {
                    "logs": logs_data,
                    "pagination": {
                        "page": pagination.page,
                        "per_page": pagination.per_page,
                        "total": pagination.total,
                        "pages": pagination.pages,
                    },
                }
            ),
            200,
        )
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)
