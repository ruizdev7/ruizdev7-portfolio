#!/usr/bin/env python3
"""
Script para crear políticas de IA por área/departamento.
Se puede ejecutar múltiples veces: actualiza si la política ya existe.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from portfolio_app import create_app, db  # noqa: E402
from portfolio_app.models.tbl_policies import Policy  # noqa: E402


DEFAULT_POLICIES = [
    {
        "name": "Alineación Estratégica de IA",
        "applies_to": "Dirección General",
        "description": (
            "Toda tarea de IA que implique decisiones estratégicas, grandes "
            "inversiones o riesgos corporativos debe pasar por aprobación humana "
            "y quedar registrada."
        ),
        "enforcement_level": "blocking",
        "rule_json": {
            "condition": (
                "task_type IN ['strategic_decision', 'large_investment', 'corporate_risk'] "
                "OR (is_high_risk == true)"
            ),
            "action": "require_approval",
            "params": {
                "approval_roles": ["dir_general", "gerente_admin"],
                "min_confidence": 0.85,
                "log_to_blockchain": True,
            },
        },
    },
    {
        "name": "Conciliación Bancaria Asistida",
        "applies_to": "Finanzas y Contabilidad",
        "description": (
            "Las conciliaciones bancarias automáticas solo se aceptan sin "
            "aprobación humana cuando el monto es bajo y la confianza es alta."
        ),
        "enforcement_level": "warning",
        "rule_json": {
            "condition": (
                "task_type == 'financial_reconciliation' AND "
                "(amount > 5000000 OR confidence < 0.9)"
            ),
            "action": "require_approval",
            "params": {
                "approval_roles": ["contador_gen", "aux_contabilidad"],
                "log_to_blockchain": True,
            },
        },
    },
    {
        "name": "Recordatorios de Pago Automáticos",
        "applies_to": "Finanzas y Contabilidad",
        "description": (
            "La IA envía recordatorios de pago automáticos para facturas con pocos días de mora."
        ),
        "enforcement_level": "logging",
        "rule_json": {
            "condition": ("task_type == 'payment_reminder' AND days_overdue <= 15"),
            "action": "auto_send",
            "params": {
                "template": "payment_reminder_1",
                "max_attempts": 3,
                "interval_days": 3,
            },
        },
    },
    {
        "name": "Evaluación de Proveedores con IA",
        "applies_to": "Compras y Proveedores",
        "description": (
            "Toda recomendación de proveedor generada por IA debe ser revisada "
            "por el área de Compras antes de ser aprobada."
        ),
        "enforcement_level": "blocking",
        "rule_json": {
            "condition": "task_type == 'supplier_evaluation'",
            "action": "require_approval",
            "params": {
                "approval_roles": ["jefe_compras", "analista_compras"],
                "min_confidence": 0.8,
            },
        },
    },
    {
        "name": "Ajustes de Producción Asistidos",
        "applies_to": "Operaciones y Producción",
        "description": (
            "La IA puede sugerir ajustes operativos, pero cambios en capacidad "
            "o turnos requieren aprobación de Operaciones."
        ),
        "enforcement_level": "warning",
        "rule_json": {
            "condition": (
                "task_type == 'production_planning' AND "
                "change_type IN ['capacity_change', 'shift_change']"
            ),
            "action": "require_approval",
            "params": {"approval_roles": ["jefe_produccion", "lider_planta"]},
        },
    },
    {
        "name": "Sugerencias Operativas Menores",
        "applies_to": "Operaciones y Producción",
        "description": (
            "Permite que la IA autoejecute sugerencias de baja complejidad en la operación."
        ),
        "enforcement_level": "logging",
        "rule_json": {
            "condition": (
                "task_type == 'production_planning' AND change_type == 'suggestion'"
            ),
            "action": "auto_approve",
            "params": {
                "log_to_blockchain": False,
            },
        },
    },
    {
        "name": "Uso Responsable de IA en IT",
        "applies_to": "Tecnología (IT)",
        "description": (
            "Solo roles de IT autorizados pueden crear o modificar agentes de IA "
            "y políticas de gobernanza."
        ),
        "enforcement_level": "blocking",
        "rule_json": {
            "condition": (
                "(resource == 'ai_agents' AND action IN ['create', 'update', 'delete']) "
                "OR (resource == 'policies' AND action IN ['create', 'update', 'delete'])"
            ),
            "action": "restrict_to_roles",
            "params": {
                "allowed_roles": ["dir_it", "admin_sistemas"],
                "log_to_blockchain": True,
            },
        },
    },
    {
        "name": "Manejo de Datos Sensibles en Logs",
        "applies_to": "Tecnología (IT)",
        "description": (
            "Evita que datos sensibles queden visibles en logs y alerta a IT cuando ocurre."
        ),
        "enforcement_level": "warning",
        "rule_json": {
            "condition": (
                "task_type == 'any' AND contains_sensitive_data_in_logs == true"
            ),
            "action": "mask_and_notify",
            "params": {
                "notify_roles": ["admin_sistemas"],
                "mask_patterns": ["password", "token", "secret", "api_key"],
            },
        },
    },
    {
        "name": "Auditoría de Operaciones de IA",
        "applies_to": "Calidad y Auditoría",
        "description": (
            "Las tareas de IA clasificadas como alto riesgo deben ser revisadas "
            "por Calidad/Auditoría y registradas en la cadena de bloques."
        ),
        "enforcement_level": "blocking",
        "rule_json": {
            "condition": (
                "task_type IN ['financial_transaction', 'legal_decision', 'medical_diagnosis']"
            ),
            "action": "require_approval",
            "params": {
                "approval_roles": ["auditor_interno", "coord_calidad"],
                "always_log_to_blockchain": True,
                "include_ai_output_in_audit": True,
            },
        },
    },
]


def create_or_update_policies():
    app = create_app()

    with app.app_context():
        created = 0
        updated = 0

        for policy_def in DEFAULT_POLICIES:
            name = policy_def["name"]
            applies_to = policy_def["applies_to"]

            existing = Policy.query.filter_by(name=name, applies_to=applies_to).first()

            if existing:
                existing.description = policy_def["description"]
                existing.enforcement_level = policy_def["enforcement_level"]
                existing.rule_json = policy_def["rule_json"]
                existing.active = True
                existing.version = (existing.version or 1) + 1
                updated += 1
                print(f"🔄 Actualizada política: {name} ({applies_to})")
            else:
                policy = Policy(
                    name=policy_def["name"],
                    description=policy_def["description"],
                    rule_json=policy_def["rule_json"],
                    enforcement_level=policy_def["enforcement_level"],
                    applies_to=policy_def["applies_to"],
                    active=True,
                )
                db.session.add(policy)
                created += 1
                print(f"✅ Creada política: {name} ({applies_to})")

        db.session.commit()

        print("\n" + "=" * 60)
        print("📊 Resumen de políticas")
        print(f"   ✅ Creadas : {created}")
        print(f"   🔄 Actualizadas: {updated}")
        print("=" * 60)


if __name__ == "__main__":
    create_or_update_policies()
