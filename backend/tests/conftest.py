"""Pytest configuration and fixtures"""

import os
import pytest

# Set FLASK_ENV before importing app modules
os.environ["FLASK_ENV"] = "testing"

from portfolio_app import create_app
from portfolio_app import db
from portfolio_app.models.tbl_users import User
from portfolio_app.models.tbl_audit_logs import AuditLog
from werkzeug.security import generate_password_hash


@pytest.fixture(scope="function")
def app():
    """Create a Flask test app"""
    app = create_app()

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """Create a test client"""
    return app.test_client()


@pytest.fixture
def admin_user(app):
    """Create an admin user for testing"""
    with app.app_context():
        # Initialize roles and permissions first
        from portfolio_app.services.auth_service import AuthService
        from portfolio_app.models.tbl_roles import Roles

        # Check if roles already exist
        if not Roles.query.first():
            AuthService.create_default_roles_and_permissions()

        user = User(
            first_name="Admin",
            middle_name="",
            last_name="Test",
            email="admin@test.com",
            password=generate_password_hash("admin123"),
        )
        db.session.add(user)
        db.session.commit()

        # Add admin role
        AuthService.assign_role_to_user(user.ccn_user, "admin")

        # Save user ID for access later
        user_id = user.ccn_user

    # Return user object that can be accessed outside app_context
    with app.app_context():
        return User.query.get(user_id)


@pytest.fixture
def sample_user(app):
    """Create a regular user for testing"""
    with app.app_context():
        user = User(
            first_name="John",
            middle_name="",
            last_name="Doe",
            email="john@test.com",
            password=generate_password_hash("password123"),
        )
        db.session.add(user)
        db.session.commit()

        # Save user ID
        user_id = user.ccn_user

    # Return user object that can be accessed outside app_context
    with app.app_context():
        return User.query.get(user_id)
