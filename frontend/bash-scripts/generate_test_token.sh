#!/bin/bash

# Generate test token directly from backend
echo "🔑 GENERAR TOKEN DE PRUEBA"
echo "=========================="
echo ""

docker compose exec -T backend python << 'PYTHON_SCRIPT'
from portfolio_app import create_app
from flask_jwt_extended import create_access_token
from portfolio_app.models.tbl_users import User
import sys

app = create_app()
with app.app_context():
    print("Usuarios disponibles:")
    users = User.query.limit(5).all()
    for i, u in enumerate(users, 1):
        print(f"  {i}. {u.email}")
    
    print("")
    email = input("Ingresa el email del usuario: ").strip()
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        print(f"\n❌ Usuario {email} no encontrado")
        sys.exit(1)
    
    print(f"\n✅ Usuario encontrado: {user.first_name} {user.last_name}")
    
    # Check permission
    has_perm = user.has_permission('ai_agents', 'create')
    print(f"   Tiene permiso ai_agents_create: {'✅ SÍ' if has_perm else '❌ NO'}")
    
    if not has_perm:
        print("\n⚠️  El usuario no tiene el permiso necesario")
        print("   Ejecuta: docker compose exec backend flask init-roles")
        sys.exit(1)
    
    # Generate token
    token = create_access_token(identity=user.email)
    
    print(f"\n✅ TOKEN GENERADO (válido por 1 hora):")
    print("=" * 60)
    print(token)
    print("=" * 60)
    print("\n📋 Usa este token en Postman:")
    print(f"   Authorization: Bearer {token}")
    print("\n📝 O ejecuta este comando:")
    print(f'   curl -X POST http://localhost:5000/api/v1/ai/agents \\')
    print(f'     -H "Authorization: Bearer {token}" \\')
    print(f'     -H "Content-Type: application/json" \\')
    print(f'     -d \'{{"name": "Test Agent", "agent_type": "financial", "model_name": "gpt-4", "confidence_threshold": 0.75}}\'')
PYTHON_SCRIPT

