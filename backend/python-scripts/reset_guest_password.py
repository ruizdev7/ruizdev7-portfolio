#!/usr/bin/env python3
"""
Script para restablecer la contraseña del usuario guest
"""

from portfolio_app import create_app
from portfolio_app.models.tbl_users import User
from portfolio_app import db
from werkzeug.security import generate_password_hash


def reset_guest_password():
    app = create_app()

    with app.app_context():
        try:
            # Buscar el usuario guest
            guest_user = User.query.filter(
                db.or_(
                    User.email == "guest@outlook.com",
                    User.email == "guest@example.com",
                )
            ).first()

            if not guest_user:
                print("❌ Usuario guest no encontrado")
                return False

            # Nueva contraseña para guest
            new_password = "guest123"
            hashed_password = generate_password_hash(new_password)

            # Actualizar la contraseña
            guest_user.password = hashed_password
            db.session.commit()

            print("✅ Contraseña del usuario guest restablecida exitosamente")
            print(f"📧 Email: {guest_user.email}")
            print(f"🔑 Nueva contraseña: {new_password}")
            print(f"👤 Nombre: {guest_user.first_name} {guest_user.last_name}")

            return True

        except Exception as e:
            print(f"❌ Error al restablecer la contraseña: {e}")
            db.session.rollback()
            return False


if __name__ == "__main__":
    print("🔄 Restableciendo contraseña del usuario guest...")
    success = reset_guest_password()

    if success:
        print("\n🎉 ¡Contraseña restablecida! Ahora puedes hacer login con:")
        print("   Email: guest@example.com")
        print("   Contraseña: guest123")
    else:
        print("\n💥 Error al restablecer la contraseña")
