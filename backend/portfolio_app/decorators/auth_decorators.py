from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, current_user


def require_permission(resource, action):
    """Decorador para requerir un permiso específico"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user:
                return jsonify({"error": "Usuario no autenticado"}), 401

            if not current_user.has_permission(resource, action):
                return jsonify({"error": "Permiso denegado"}), 403

            return f(*args, **kwargs)

        return decorated_function

    return decorator


def require_role(role_name):
    """Decorador para requerir un rol específico"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user:
                return jsonify({"error": "Usuario no autenticado"}), 401

            if not current_user.has_role(role_name):
                return jsonify({"error": "Rol requerido no encontrado"}), 403

            return f(*args, **kwargs)

        return decorated_function

    return decorator


def require_ownership_or_permission(resource, action):
    """Decorador que permite acceso si es propietario o tiene permiso"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user:
                return jsonify({"error": "Usuario no autenticado"}), 401

            # Verificar si tiene permiso general
            if current_user.has_permission(resource, action):
                return f(*args, **kwargs)

            # Verificar si es propietario del recurso
            resource_id = (
                kwargs.get("id") or kwargs.get("ccn_post") or request.json.get("id")
            )
            if resource_id:
                # Lógica específica para cada recurso
                if resource == "posts":
                    from portfolio_app.models.tbl_posts import Post

                    post = Post.query.get(resource_id)
                    if post and post.author_id == current_user.ccn_user:
                        return f(*args, **kwargs)
                elif resource == "pumps":
                    from portfolio_app.models.tbl_pumps import Pump

                    pump = Pump.query.get(resource_id)
                    if pump and pump.created_by == current_user.ccn_user:
                        return f(*args, **kwargs)
                elif resource == "comments":
                    from portfolio_app.models.tbl_comments import Comment

                    comment = Comment.query.get(resource_id)
                    if comment and comment.user_id == current_user.ccn_user:
                        return f(*args, **kwargs)

            return jsonify({"error": "Acceso denegado"}), 403

        return decorated_function

    return decorator


def require_any_permission(permissions):
    """Decorador que requiere al menos uno de los permisos especificados"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user:
                return jsonify({"error": "Usuario no autenticado"}), 401

            for resource, action in permissions:
                if current_user.has_permission(resource, action):
                    return f(*args, **kwargs)

            return jsonify({"error": "Permiso denegado"}), 403

        return decorated_function

    return decorator


def require_all_permissions(permissions):
    """Decorador que requiere todos los permisos especificados"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user:
                return jsonify({"error": "Usuario no autenticado"}), 401

            for resource, action in permissions:
                if not current_user.has_permission(resource, action):
                    return jsonify({"error": "Permiso denegado"}), 403

            return f(*args, **kwargs)

        return decorated_function

    return decorator
