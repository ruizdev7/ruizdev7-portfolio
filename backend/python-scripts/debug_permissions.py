#!/usr/bin/env python3
"""
Debug script to check user permissions
"""

import sys

sys.path.insert(0, "/Users/ruizdev7/Documents/GitHub/ruizdev7-portfolio/backend")

from portfolio_app import create_app, db
from portfolio_app.models.tbl_users import User
from portfolio_app.models.tbl_permissions import Permissions
from portfolio_app.models.tbl_roles import Roles
from portfolio_app.models.tbl_user_roles import UserRoles
from portfolio_app.models.tbl_role_permissions import RolePermissions

app = create_app()

with app.app_context():
    email = input("Enter user email to check: ").strip()

    user = User.query.filter_by(email=email).first()

    if not user:
        print(f"❌ User {email} not found")
        sys.exit(1)

    print(f"\n✅ User found: {user.first_name} {user.last_name}")
    print(f"   Email: {user.email}")
    print(f"   ID: {user.ccn_user}")

    # Get roles
    user_roles = UserRoles.query.filter_by(ccn_user=user.ccn_user).all()
    print(f"\n📋 Roles ({len(user_roles)}):")
    for ur in user_roles:
        print(f"   - {ur.role.role_name}")

    # Check specific permission
    print(f"\n🔍 Checking permission: ai_agents_create")
    has_perm = user.has_permission("ai_agents", "create")
    print(f"   Result: {'✅ YES' if has_perm else '❌ NO'}")

    # Get all permissions
    permissions = user.get_permissions()
    ai_permissions = [
        p
        for p in permissions
        if "ai_" in p["permission_name"]
        or p["resource"] in ["ai_agents", "ai_tasks", "approvals", "policies"]
    ]

    print(f"\n🤖 AI Governance Permissions ({len(ai_permissions)}):")
    for perm in ai_permissions:
        print(f"   - {perm['permission_name']} ({perm['resource']}:{perm['action']})")

    # Check if permission exists in DB
    perm = Permissions.query.filter_by(resource="ai_agents", action="create").first()
    if perm:
        print(f"\n✅ Permission 'ai_agents_create' exists in DB")
        print(f"   Permission ID: {perm.ccn_permission}")

        # Check if admin role has it
        admin_role = Roles.query.filter_by(role_name="admin").first()
        if admin_role:
            rp = RolePermissions.query.filter_by(
                ccn_role=admin_role.ccn_role, ccn_permission=perm.ccn_permission
            ).first()

            if rp:
                print(f"✅ Admin role HAS the permission")
            else:
                print(f"❌ Admin role does NOT have the permission")
                print(f"   Fix: Run 'flask init-roles' again")
    else:
        print(f"❌ Permission 'ai_agents_create' NOT found in DB")
        print(f"   Fix: Run 'flask init-roles'")
