from typing import Optional
from flask import request
from portfolio_app.models.tbl_audit_logs import AuditLog
from portfolio_app import db


class AuditLogService:
    @staticmethod
    def create_log(
        ccn_user: Optional[int],
        event_type: str,
        resource: str,
        action: str,
        description: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        additional_data: Optional[str] = None,
    ) -> AuditLog:
        """Create an audit log entry"""
        # Get IP address and user agent from request if not provided
        if ip_address is None:
            ip_address = request.remote_addr if request else None
        if user_agent is None:
            user_agent = request.headers.get("User-Agent") if request else None

        log = AuditLog(
            ccn_user=ccn_user,
            event_type=event_type,
            resource=resource,
            action=action,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            additional_data=additional_data,
        )
        db.session.add(log)
        db.session.commit()
        return log

    @staticmethod
    def log_login(
        ccn_user: int, email: str, ip_address: Optional[str] = None
    ) -> AuditLog:
        """Log a successful user login"""
        return AuditLogService.create_log(
            ccn_user=ccn_user,
            event_type="login",
            resource="auth",
            action="read",
            description=f"User {email} logged in successfully",
            ip_address=ip_address,
        )

    @staticmethod
    def log_logout(ccn_user: int, email: str) -> AuditLog:
        """Log a user logout"""
        return AuditLogService.create_log(
            ccn_user=ccn_user,
            event_type="logout",
            resource="auth",
            action="read",
            description=f"User {email} logged out",
        )

    @staticmethod
    def log_create(ccn_user: int, resource: str, description: str) -> AuditLog:
        """Log a resource creation"""
        return AuditLogService.create_log(
            ccn_user=ccn_user,
            event_type="create",
            resource=resource,
            action="create",
            description=description,
        )

    @staticmethod
    def log_update(ccn_user: int, resource: str, description: str) -> AuditLog:
        """Log a resource update"""
        return AuditLogService.create_log(
            ccn_user=ccn_user,
            event_type="update",
            resource=resource,
            action="update",
            description=description,
        )

    @staticmethod
    def log_delete(ccn_user: int, resource: str, description: str) -> AuditLog:
        """Log a resource deletion"""
        return AuditLogService.create_log(
            ccn_user=ccn_user,
            event_type="delete",
            resource=resource,
            action="delete",
            description=description,
        )

    @staticmethod
    def log_failed_login(email: str, ip_address: Optional[str] = None) -> AuditLog:
        """Log a failed login attempt"""
        return AuditLogService.create_log(
            ccn_user=None,
            event_type="login_failed",
            resource="auth",
            action="read",
            description=f"Failed login attempt for email: {email}",
            ip_address=ip_address,
        )
