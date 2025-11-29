#!/usr/bin/env python3
"""
Script para crear usuarios en masa desde un JSON
Crea roles específicos para cada cargo con permisos apropiados
"""

import sys
import json
from pathlib import Path

# Agregar el directorio backend al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from portfolio_app import create_app, db
from portfolio_app.models.tbl_users import User
from portfolio_app.models.tbl_roles import Roles
from portfolio_app.models.tbl_permissions import Permissions
from portfolio_app.models.tbl_role_permissions import RolePermissions
from portfolio_app.services.auth_service import AuthService
from werkzeug.security import generate_password_hash

# Mapeo de cargos a nombres de roles (normalizados y acortados)
CARGO_TO_ROLE_NAME = {
    "Director General": "dir_general",
    "Gerente Administrativa": "gerente_admin",
    "Contador General": "contador_gen",
    "Auxiliar de Contabilidad": "aux_contabilidad",
    "Analista de Cuentas por Pagar": "analista_cxp",
    "Analista de Cuentas por Cobrar": "analista_cxc",
    "Jefe de Compras": "jefe_compras",
    "Analista de Compras": "analista_compras",
    "Auxiliar de Compras": "aux_compras",
    "Jefe de Producción": "jefe_produccion",
    "Líder de Planta": "lider_planta",
    "Operaria de Producción": "operaria_prod",
    "Auxiliar de Almacén": "aux_almacen",
    "Director de IT": "dir_it",
    "Administrador de Sistemas": "admin_sistemas",
    "Soporte Técnico Nivel 1": "soporte_n1",
    "Desarrollador Backend": "dev_backend",
    "Desarrolladora Frontend": "dev_frontend",
    "Coordinadora de Calidad": "coord_calidad",
    "Auditor Interno": "auditor_interno",
}

# Permisos por cargo (basados en funciones)
CARGO_PERMISSIONS = {
    # Directivos - Acceso completo
    "dir_general": [
        # Todos los permisos
        "posts_create", "posts_read", "posts_update", "posts_delete",
        "users_create", "users_read", "users_update", "users_delete",
        "pumps_create", "pumps_read", "pumps_update", "pumps_delete",
        "categories_create", "categories_read", "categories_update", "categories_delete",
        "comments_create", "comments_read", "comments_update", "comments_delete",
        # AI Governance - Acceso completo
        "ai_agents_create", "ai_agents_read", "ai_agents_update", "ai_agents_delete",
        "ai_tasks_create", "ai_tasks_read",
        "approvals_read", "approvals_approve",
        "policies_create", "policies_read", "policies_update", "policies_delete",
    ],
    "gerente_admin": [
        "posts_create", "posts_read", "posts_update",
        "users_read", "users_update",
        "pumps_create", "pumps_read", "pumps_update",
        "categories_read",
        "comments_create", "comments_read", "comments_update",
        # AI Governance
        "ai_agents_create", "ai_agents_read", "ai_agents_update",
        "ai_tasks_create", "ai_tasks_read",
        "approvals_read", "approvals_approve",
        "policies_create", "policies_read", "policies_update",
    ],
    "dir_it": [
        "posts_read",
        "users_read", "users_update",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance - Acceso completo a IT
        "ai_agents_create", "ai_agents_read", "ai_agents_update", "ai_agents_delete",
        "ai_tasks_create", "ai_tasks_read",
        "approvals_read", "approvals_approve",
        "policies_read", "policies_update",
    ],
    
    # Contabilidad - Lectura y ejecución de tareas
    "contador_gen": [
        "posts_read",
        "users_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "approvals_read", "approvals_approve",
        "policies_read",
        "blockchain_read",
    ],
    "aux_contabilidad": [
        "posts_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    "analista_cxp": [
        "posts_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    "analista_cxc": [
        "posts_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    
    # Compras - Pueden crear y aprobar
    "jefe_compras": [
        "posts_create", "posts_read", "posts_update",
        "users_read",
        "pumps_create", "pumps_read", "pumps_update",
        "categories_read",
        "comments_create", "comments_read", "comments_update",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "approvals_read", "approvals_approve",
        "policies_read",
    ],
    "analista_compras": [
        "posts_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    "aux_compras": [
        "posts_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    
    # Producción
    "jefe_produccion": [
        "posts_create", "posts_read", "posts_update",
        "users_read",
        "pumps_create", "pumps_read", "pumps_update",
        "categories_read",
        "comments_create", "comments_read", "comments_update",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "approvals_read", "approvals_approve",
        "policies_read",
    ],
    "lider_planta": [
        "posts_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    "operaria_prod": [
        "posts_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    "aux_almacen": [
        "posts_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    
    # IT
    "admin_sistemas": [
        "posts_read",
        "users_read", "users_update",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_create", "ai_agents_read", "ai_agents_update",
        "ai_tasks_create", "ai_tasks_read",
        "approvals_read", "approvals_approve",
        "policies_read", "policies_update",
    ],
    "soporte_n1": [
        "posts_read",
        "users_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    "dev_backend": [
        "posts_read",
        "users_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    "dev_frontend": [
        "posts_read",
        "users_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "policies_read",
    ],
    
    # Calidad y Auditoría
    "coord_calidad": [
        "posts_create", "posts_read", "posts_update",
        "users_read",
        "pumps_read", "pumps_update",
        "categories_read",
        "comments_create", "comments_read", "comments_update",
        # AI Governance
        "ai_agents_read",
        "ai_tasks_create", "ai_tasks_read",
        "approvals_read", "approvals_approve",
        "policies_read", "policies_update",
    ],
    "auditor_interno": [
        "posts_read",
        "users_read",
        "pumps_read",
        "categories_read",
        "comments_read",
        # AI Governance - Acceso completo a auditoría
        "ai_agents_read",
        "ai_tasks_read",
        "approvals_read", "approvals_approve",
        "policies_read",
    ],
}

# JSON de usuarios
USERS_DATA = [
    {
        "first_name": "Carlos",
        "middle_name": "Andrés",
        "last_name": "Ramírez",
        "email": "carlos.ramirez@empresa.com",
        "password": "Cr2025!dg",
        "cargo": "Director General"
    },
    {
        "first_name": "María",
        "middle_name": "Juliana",
        "last_name": "Torres",
        "email": "maria.torres@empresa.com",
        "password": "MjT!7845",
        "cargo": "Gerente Administrativa"
    },
    {
        "first_name": "Juan",
        "middle_name": "Esteban",
        "last_name": "Morales",
        "email": "juan.morales@empresa.com",
        "password": "JmC0nt@55",
        "cargo": "Contador General"
    },
    {
        "first_name": "Laura",
        "middle_name": "Cristina",
        "last_name": "Beltrán",
        "email": "laura.beltran@empresa.com",
        "password": "LcA2025$",
        "cargo": "Auxiliar de Contabilidad"
    },
    {
        "first_name": "Felipe",
        "middle_name": "Alejandro",
        "last_name": "Pardo",
        "email": "felipe.pardo@empresa.com",
        "password": "FpCxP#92",
        "cargo": "Analista de Cuentas por Pagar"
    },
    {
        "first_name": "Diana",
        "middle_name": "Marcela",
        "last_name": "Ríos",
        "email": "diana.rios@empresa.com",
        "password": "DrCxc!74",
        "cargo": "Analista de Cuentas por Cobrar"
    },
    {
        "first_name": "Sergio",
        "middle_name": "David",
        "last_name": "Castaño",
        "email": "sergio.castano@empresa.com",
        "password": "SdBuy#33",
        "cargo": "Jefe de Compras"
    },
    {
        "first_name": "Paola",
        "middle_name": "Andrea",
        "last_name": "Guzmán",
        "email": "paola.guzman@empresa.com",
        "password": "PagC0mp$82",
        "cargo": "Analista de Compras"
    },
    {
        "first_name": "Óscar",
        "middle_name": "Mauricio",
        "last_name": "Peña",
        "email": "oscar.pena@empresa.com",
        "password": "OmAc!908",
        "cargo": "Auxiliar de Compras"
    },
    {
        "first_name": "Jhon",
        "middle_name": "Alexander",
        "last_name": "Pérez",
        "email": "jhon.perez@empresa.com",
        "password": "JpPr0#551",
        "cargo": "Jefe de Producción"
    },
    {
        "first_name": "Camilo",
        "middle_name": "Andrés",
        "last_name": "Herrera",
        "email": "camilo.herrera@empresa.com",
        "password": "CaPl@2025",
        "cargo": "Líder de Planta"
    },
    {
        "first_name": "Tatiana",
        "middle_name": "Sofía",
        "last_name": "Vargas",
        "email": "tatiana.vargas@empresa.com",
        "password": "TvOp#77",
        "cargo": "Operaria de Producción"
    },
    {
        "first_name": "Miguel",
        "middle_name": "Ángel",
        "last_name": "Cortés",
        "email": "miguel.cortes@empresa.com",
        "password": "MaAlm#115",
        "cargo": "Auxiliar de Almacén"
    },
    {
        "first_name": "Kevin",
        "middle_name": "Alejandro",
        "last_name": "Roldán",
        "email": "kevin.roldan@empresa.com",
        "password": "KrIT#9090",
        "cargo": "Director de IT"
    },
    {
        "first_name": "Julio",
        "middle_name": "César",
        "last_name": "Martínez",
        "email": "julio.martinez@empresa.com",
        "password": "JmSys$991",
        "cargo": "Administrador de Sistemas"
    },
    {
        "first_name": "Sara",
        "middle_name": "Valentina",
        "last_name": "León",
        "email": "sara.leon@empresa.com",
        "password": "SlSt1!55",
        "cargo": "Soporte Técnico Nivel 1"
    },
    {
        "first_name": "Daniel",
        "middle_name": "Ricardo",
        "last_name": "Borda",
        "email": "daniel.borda@empresa.com",
        "password": "DbBack#33",
        "cargo": "Desarrollador Backend"
    },
    {
        "first_name": "Natalia",
        "middle_name": "Andrea",
        "last_name": "Sánchez",
        "email": "natalia.sanchez@empresa.com",
        "password": "NsFront$88",
        "cargo": "Desarrolladora Frontend"
    },
    {
        "first_name": "Carolina",
        "middle_name": "Isabel",
        "last_name": "Duarte",
        "email": "carolina.duarte@empresa.com",
        "password": "CdQl#2025",
        "cargo": "Coordinadora de Calidad"
    },
    {
        "first_name": "Andrés",
        "middle_name": "Felipe",
        "last_name": "Niño",
        "email": "andres.nino@empresa.com",
        "password": "AnAud!512",
        "cargo": "Auditor Interno"
    }
]


def create_role_with_permissions(role_name, description, permission_names):
    """Crear un rol y asignarle permisos"""
    from portfolio_app.models.tbl_role_permissions import RolePermissions
    
    # Crear o obtener el rol
    role = Roles.query.filter_by(role_name=role_name).first()
    if not role:
        role = Roles(role_name=role_name)
        role.save()
        print(f"   ✅ Rol '{role_name}' creado")
    else:
        print(f"   ℹ️  Rol '{role_name}' ya existe")
    
    # Asignar permisos
    assigned = 0
    for perm_name in permission_names:
        perm = Permissions.query.filter_by(permission_name=perm_name).first()
        if perm:
            # Verificar si ya existe la relación
            existing = RolePermissions.query.filter_by(
                ccn_role=role.ccn_role, ccn_permission=perm.ccn_permission
            ).first()
            
            if not existing:
                role_perm = RolePermissions(role.ccn_role, perm.ccn_permission)
                role_perm.save()
                assigned += 1
        else:
            print(f"   ⚠️  Permiso '{perm_name}' no encontrado")
    
    if assigned > 0:
        print(f"   ✅ {assigned} permisos asignados al rol '{role_name}'")
    
    return role


def create_users():
    """Crear usuarios desde el JSON"""
    app = create_app()
    
    with app.app_context():
        # Asegurar que los roles y permisos base existen
        print("🔧 Verificando roles y permisos base...")
        AuthService.create_default_roles_and_permissions()
        print("✅ Roles y permisos base verificados\n")
        
        # Crear roles específicos para cada cargo
        print("🔧 Creando roles específicos por cargo...")
        roles_created = {}
        for cargo, role_name in CARGO_TO_ROLE_NAME.items():
            if role_name not in roles_created:
                permissions = CARGO_PERMISSIONS.get(role_name, [])
                description = f"Rol para {cargo}"
                role = create_role_with_permissions(role_name, description, permissions)
                roles_created[role_name] = role
        print("✅ Roles específicos creados\n")
        
        created = 0
        skipped = 0
        errors = 0
        
        print(f"📝 Creando {len(USERS_DATA)} usuarios...\n")
        
        for user_data in USERS_DATA:
            email = user_data["email"]
            cargo = user_data["cargo"]
            role_name = CARGO_TO_ROLE_NAME.get(cargo)
            
            if not role_name:
                print(f"⚠️  No hay rol definido para el cargo: {cargo}")
                errors += 1
                continue
            
            try:
                # Verificar si el usuario ya existe
                existing_user = User.query.filter_by(email=email).first()
                if existing_user:
                    # Actualizar el rol del usuario existente
                    try:
                        # Remover roles antiguos
                        from portfolio_app.models.tbl_user_roles import UserRoles
                        old_roles = UserRoles.query.filter_by(ccn_user=existing_user.ccn_user).all()
                        for old_role in old_roles:
                            old_role.delete()
                        
                        # Asignar nuevo rol específico
                        AuthService.assign_role_to_user(existing_user.ccn_user, role_name)
                        print(f"🔄 Actualizado: {user_data['first_name']} {user_data['last_name']} ({email})")
                        print(f"   Cargo: {cargo} → Rol: {role_name}")
                        created += 1
                    except Exception as role_error:
                        print(f"⚠️  Error al actualizar rol de {email}: {str(role_error)}")
                        errors += 1
                    continue
                
                # Crear el usuario
                user = User(
                    first_name=user_data["first_name"],
                    middle_name=user_data.get("middle_name", ""),
                    last_name=user_data["last_name"],
                    email=email,
                    password=generate_password_hash(user_data["password"]),
                )
                user.save()
                
                # Asignar rol específico
                try:
                    AuthService.assign_role_to_user(user.ccn_user, role_name)
                    print(f"✅ Creado: {user_data['first_name']} {user_data['last_name']} ({email})")
                    print(f"   Cargo: {cargo} → Rol: {role_name}")
                    created += 1
                except Exception as role_error:
                    print(f"⚠️  Usuario creado pero error al asignar rol: {email}")
                    print(f"   Error: {str(role_error)}")
                    errors += 1
                
            except Exception as e:
                print(f"❌ Error al crear {email}: {str(e)}")
                errors += 1
                db.session.rollback()
        
        print(f"\n{'='*60}")
        print(f"📊 Resumen:")
        print(f"   ✅ Usuarios creados: {created}")
        print(f"   ⏭️  Usuarios saltados: {skipped}")
        print(f"   ❌ Errores: {errors}")
        print(f"   🔧 Roles creados: {len(roles_created)}")
        print(f"{'='*60}")


if __name__ == "__main__":
    create_users()
