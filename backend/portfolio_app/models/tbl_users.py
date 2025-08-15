from datetime import datetime
from portfolio_app import db
from werkzeug.security import generate_password_hash


class User(db.Model):
    __tablename__ = "tbl_users"
    ccn_user = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(20), nullable=False)
    middle_name = db.Column(db.String(20), nullable=True)
    last_name = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    account_id = db.Column(db.String(300), nullable=False, unique=True)

    posts = db.relationship("Post", back_populates="author")
    comments = db.relationship("Comment", backref="user", lazy=True)

    def __init__(self, first_name, middle_name, last_name, email, password):
        self.first_name = first_name
        self.middle_name = middle_name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.created_at = datetime.now()
        self.account_id = self.generate_account_id()

    def generate_account_id(self):
        data = f"{self.email}{self.first_name}{self.last_name}{self.created_at}"
        return generate_password_hash(data)

    def save(self):
        db.session.add(self)
        db.session.commit()

    def has_permission(self, resource, action):
        """Verifica si el usuario tiene un permiso específico"""
        from portfolio_app.models.tbl_role_permissions import RolePermissions
        from portfolio_app.models.tbl_permissions import Permissions
        from portfolio_app.models.tbl_user_roles import UserRoles

        # Obtener los roles del usuario
        user_roles = UserRoles.query.filter_by(ccn_user=self.ccn_user).all()
        if not user_roles:
            return False

        # Buscar el permiso
        permission = Permissions.query.filter_by(
            resource=resource, action=action
        ).first()

        if not permission:
            return False

        # Verificar si alguno de los roles del usuario tiene el permiso
        for user_role in user_roles:
            role_permission = RolePermissions.query.filter_by(
                ccn_role=user_role.ccn_role, ccn_permission=permission.ccn_permission
            ).first()

            if role_permission:
                return True

        return False

    def has_role(self, role_name):
        """Verifica si el usuario tiene un rol específico"""
        from portfolio_app.models.tbl_user_roles import UserRoles

        user_roles = UserRoles.query.filter_by(ccn_user=self.ccn_user).all()
        for user_role in user_roles:
            if user_role.role.role_name == role_name:
                return True
        return False

    def get_roles(self):
        """Obtiene todos los roles del usuario"""
        from portfolio_app.models.tbl_user_roles import UserRoles

        user_roles = UserRoles.query.filter_by(ccn_user=self.ccn_user).all()
        return [user_role.role for user_role in user_roles]

    def get_permissions(self):
        """Obtiene todos los permisos del usuario"""
        from portfolio_app.models.tbl_role_permissions import RolePermissions
        from portfolio_app.models.tbl_user_roles import UserRoles

        permissions = []
        user_roles = UserRoles.query.filter_by(ccn_user=self.ccn_user).all()

        for user_role in user_roles:
            role_permissions = RolePermissions.query.filter_by(
                ccn_role=user_role.ccn_role
            ).all()
            for rp in role_permissions:
                permissions.append(
                    {
                        "permission_name": rp.permission.permission_name,
                        "resource": rp.permission.resource,
                        "action": rp.permission.action,
                        "description": rp.permission.description,
                    }
                )

        return permissions

    @staticmethod
    def choice_query():
        return User.query

    def __repr__(self):
        return f"User('{self.first_name} {self.last_name}', Email: '{self.email}')"
