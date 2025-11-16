"""Tests for audit log functionality in CRUD operations"""

import pytest
from flask_jwt_extended import create_access_token
from portfolio_app.models.tbl_users import User
from portfolio_app.models.tbl_audit_logs import AuditLog
from portfolio_app.models.tbl_roles import Roles
from portfolio_app.models.tbl_permissions import Permissions
from portfolio_app.models.tbl_pumps import Pump
from portfolio_app import db


def test_user_create_generates_audit_log(client, app, admin_user):
    """Test that creating a user generates an audit log"""
    # Get auth token
    with app.app_context():
        token = create_access_token(identity=admin_user.email)
        headers = {"Authorization": f"Bearer {token}"}
        admin_id = admin_user.ccn_user

    # Create a user
    response = client.post(
        "/api/v1/users",
        json={
            "first_name": "Test",
            "middle_name": "",
            "last_name": "User",
            "email": "testuser@test.com",
            "password": "testpass123",
        },
        headers=headers,
    )

    assert response.status_code == 201

    # Check that audit log was created
    with app.app_context():
        logs = AuditLog.query.filter_by(
            ccn_user=admin_id, event_type="create", resource="users"
        ).all()

        assert len(logs) >= 1
        latest_log = logs[0]
        assert "Created user: Test User" in latest_log.description
        assert latest_log.action == "create"


def test_user_update_generates_audit_log(client, app, admin_user):
    """Test that updating a user generates an audit log"""
    from werkzeug.security import generate_password_hash

    with app.app_context():
        # Get auth token
        token = create_access_token(identity=admin_user.email)
        headers = {"Authorization": f"Bearer {token}"}
        admin_id = admin_user.ccn_user

        # Create a test user first
        user = User(
            first_name="Update",
            middle_name="",
            last_name="Test",
            email="update@test.com",
            password=generate_password_hash("password123"),
        )
        db.session.add(user)
        db.session.commit()
        user_id = user.ccn_user

    # Update the user
    response = client.put(
        f"/api/v1/users/{user_id}",
        json={
            "email_user": "updated@test.com",
            "password_user": "no_change",
            "first_name": "Updated",
        },
        headers=headers,
    )

    assert response.status_code == 200

    # Check that audit log was created
    with app.app_context():
        logs = AuditLog.query.filter_by(
            ccn_user=admin_id, event_type="update", resource="users"
        ).all()

        assert len(logs) >= 1
        latest_log = logs[0]
        assert "Updated user: Updated Test" in latest_log.description
        assert latest_log.action == "update"


def test_user_delete_generates_audit_log(client, app, admin_user):
    """Test that deleting a user generates an audit log"""
    from werkzeug.security import generate_password_hash

    with app.app_context():
        # Get auth token
        token = create_access_token(identity=admin_user.email)
        headers = {"Authorization": f"Bearer {token}"}
        admin_id = admin_user.ccn_user

        # Create a test user first
        user = User(
            first_name="Delete",
            middle_name="",
            last_name="Test",
            email="delete@test.com",
            password=generate_password_hash("password123"),
        )
        db.session.add(user)
        db.session.commit()
        user_id = user.ccn_user

    # Delete the user
    response = client.delete(f"/api/v1/users/{user_id}", headers=headers)

    # Debug: print error if status is not 200
    if response.status_code != 200:
        print(f"❌ Response status: {response.status_code}")
        print(f"❌ Response data: {response.get_json()}")

    assert response.status_code == 200

    # Check that audit log was created
    with app.app_context():
        logs = AuditLog.query.filter_by(
            ccn_user=admin_id, event_type="delete", resource="users"
        ).all()

        assert len(logs) >= 1
        latest_log = logs[0]
        assert "Deleted user: Delete Test" in latest_log.description
        assert latest_log.action == "delete"


def test_role_create_generates_audit_log(client, app, admin_user):
    """Test that creating a role generates an audit log"""
    with app.app_context():
        # Get auth token
        token = create_access_token(identity=admin_user.email)
        headers = {"Authorization": f"Bearer {token}"}
        admin_id = admin_user.ccn_user

    # Create a role
    response = client.post(
        "/api/v1/roles", json={"role_name": "test_role"}, headers=headers
    )

    assert response.status_code == 201

    # Check that audit log was created
    with app.app_context():
        logs = AuditLog.query.filter_by(
            ccn_user=admin_id, event_type="create", resource="roles"
        ).all()

        assert len(logs) >= 1
        latest_log = logs[0]
        assert "Created role: test_role" in latest_log.description
        assert latest_log.action == "create"


def test_role_update_generates_audit_log(client, app, admin_user):
    """Test that updating a role generates an audit log"""
    with app.app_context():
        # Get auth token
        token = create_access_token(identity=admin_user.email)
        headers = {"Authorization": f"Bearer {token}"}
        admin_id = admin_user.ccn_user

        # Create a role first
        role = Roles(role_name="test_role")
        db.session.add(role)
        db.session.commit()
        role_id = role.ccn_role

    # Update the role
    response = client.put(
        f"/api/v1/roles/{role_id}",
        json={"role_name": "updated_role"},
        headers=headers,
    )

    assert response.status_code == 200

    # Check that audit log was created
    with app.app_context():
        logs = AuditLog.query.filter_by(
            ccn_user=admin_id, event_type="update", resource="roles"
        ).all()

        assert len(logs) >= 1
        latest_log = logs[0]
        assert "Updated role: test_role -> updated_role" in latest_log.description
        assert latest_log.action == "update"


def test_role_delete_generates_audit_log(client, app, admin_user):
    """Test that deleting a role generates an audit log"""
    with app.app_context():
        # Get auth token
        token = create_access_token(identity=admin_user.email)
        headers = {"Authorization": f"Bearer {token}"}
        admin_id = admin_user.ccn_user

        # Create a role first
        role = Roles(role_name="test_role")
        db.session.add(role)
        db.session.commit()
        role_id = role.ccn_role

    # Delete the role
    response = client.delete(f"/api/v1/roles/{role_id}", headers=headers)

    assert response.status_code == 200

    # Check that audit log was created
    with app.app_context():
        logs = AuditLog.query.filter_by(
            ccn_user=admin_id, event_type="delete", resource="roles"
        ).all()

        assert len(logs) >= 1
        latest_log = logs[0]
        assert "Deleted role: test_role" in latest_log.description
        assert latest_log.action == "delete"
