"""
AI Governance Platform API Resources
RESTful endpoints for AI agents, tasks, approvals, and policies
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from marshmallow import ValidationError
from datetime import datetime
import asyncio
import concurrent.futures

from ..extensions import db
from ..models.tbl_ai_agents import AIAgent
from ..models.tbl_ai_tasks import AITask
from ..models.tbl_human_approvals import HumanApproval
from ..models.tbl_policies import Policy
from ..models.tbl_blockchain_audit import BlockchainAudit
from ..models.tbl_mpc_operations import MPCOperation
from ..schemas.schema_ai_governance import (
    AIAgentCreateSchema,
    AIAgentUpdateSchema,
    AIAgentResponseSchema,
    AITaskCreateSchema,
    AITaskResponseSchema,
    AITaskDetailResponseSchema,
    ApprovalActionSchema,
    HumanApprovalResponseSchema,
    HumanApprovalDetailResponseSchema,
    PolicyCreateSchema,
    PolicyUpdateSchema,
    PolicyResponseSchema,
    BlockchainAuditResponseSchema,
    MPCOperationResponseSchema,
    DashboardStatsResponseSchema,
)
from ..decorators.auth_decorators import require_permission
from ..services.ai_agent_service import create_ai_agent
from ..services.blockchain_service import get_blockchain_service

# Create blueprint
blueprint_api_ai_governance = Blueprint("ai_governance", __name__)


# ============================================================================
# AI Agents Endpoints
# ============================================================================


@blueprint_api_ai_governance.route("/api/v1/ai/agents", methods=["GET"])
@jwt_required()
@require_permission("ai_agents", "read")
def get_agents():
    """Get all AI agents"""
    try:
        agents = AIAgent.query.all()
        schema = AIAgentResponseSchema(many=True)
        return jsonify({"success": True, "agents": schema.dump(agents)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route("/api/v1/ai/agents/<agent_id>", methods=["GET"])
@jwt_required()
@require_permission("ai_agents", "read")
def get_agent(agent_id):
    """Get specific AI agent"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        schema = AIAgentResponseSchema()
        return jsonify({"success": True, "agent": schema.dump(agent)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 404


@blueprint_api_ai_governance.route("/api/v1/ai/agents", methods=["POST"])
@jwt_required()
@require_permission("ai_agents", "create")
def create_agent():
    """Create new AI agent"""
    try:
        # Get user ID (ccn_user) - current_user is loaded by require_permission decorator
        if not current_user:
            user_email = get_jwt_identity()
            from ..models.tbl_users import User

            user = User.query.filter_by(email=user_email).first()
            if not user:
                return (
                    jsonify({"success": False, "error": "Usuario no encontrado"}),
                    401,
                )
            current_user_id = user.ccn_user
        else:
            current_user_id = current_user.ccn_user

        schema = AIAgentCreateSchema()
        data = schema.load(request.json)

        agent = AIAgent(
            name=data["name"],
            agent_type=data["agent_type"],
            description=data.get("description"),
            model_name=data.get("model_name", "gpt-4"),
            confidence_threshold=data.get("confidence_threshold", 0.70),
            status=data.get("status", "active"),
            created_by=current_user_id,
        )

        db.session.add(agent)
        db.session.commit()

        response_schema = AIAgentResponseSchema()
        return (
            jsonify(
                {
                    "success": True,
                    "message": "AI agent created successfully",
                    "agent": response_schema.dump(agent),
                }
            ),
            201,
        )

    except ValidationError as err:
        return jsonify({"success": False, "error": err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route("/api/v1/ai/agents/<agent_id>", methods=["PUT"])
@jwt_required()
@require_permission("ai_agents", "update")
def update_agent(agent_id):
    """Update AI agent"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        schema = AIAgentUpdateSchema()
        data = schema.load(request.json)

        for key, value in data.items():
            setattr(agent, key, value)

        db.session.commit()

        response_schema = AIAgentResponseSchema()
        return (
            jsonify(
                {
                    "success": True,
                    "message": "AI agent updated successfully",
                    "agent": response_schema.dump(agent),
                }
            ),
            200,
        )

    except ValidationError as err:
        return jsonify({"success": False, "error": err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route("/api/v1/ai/agents/<agent_id>", methods=["DELETE"])
@jwt_required()
@require_permission("ai_agents", "delete")
def delete_agent(agent_id):
    """Delete AI agent"""
    try:
        agent = AIAgent.query.get_or_404(agent_id)
        agent.status = "disabled"
        db.session.commit()

        return (
            jsonify({"success": True, "message": "AI agent disabled successfully"}),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================================
# AI Tasks Endpoints
# ============================================================================


@blueprint_api_ai_governance.route("/api/v1/ai/tasks", methods=["GET"])
@jwt_required()
@require_permission("ai_tasks", "read")
def get_tasks():
    """Get all AI tasks with optional filters"""
    try:
        query = AITask.query

        # Filters
        status = request.args.get("status")
        agent_id = request.args.get("agent_id")

        if status:
            query = query.filter_by(status=status)
        if agent_id:
            query = query.filter_by(agent_id=agent_id)

        tasks = query.order_by(AITask.created_at.desc()).all()
        schema = AITaskResponseSchema(many=True)

        return (
            jsonify(
                {"success": True, "tasks": schema.dump(tasks), "total": len(tasks)}
            ),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route("/api/v1/ai/tasks/<task_id>", methods=["GET"])
@jwt_required()
@require_permission("ai_tasks", "read")
def get_task(task_id):
    """Get specific AI task with details"""
    try:
        task = AITask.query.get_or_404(task_id)
        schema = AITaskDetailResponseSchema()

        return (
            jsonify(
                {
                    "success": True,
                    "task": schema.dump(task.to_dict(include_result=True)),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 404


@blueprint_api_ai_governance.route("/api/v1/ai/tasks", methods=["POST"])
@jwt_required()
@require_permission("ai_tasks", "create")
def execute_task():
    """Execute a new AI task"""
    try:
        # Get user ID (ccn_user) - current_user is loaded by require_permission decorator
        if not current_user:
            user_email = get_jwt_identity()
            from ..models.tbl_users import User

            user = User.query.filter_by(email=user_email).first()
            if not user:
                return (
                    jsonify({"success": False, "error": "Usuario no encontrado"}),
                    401,
                )
            current_user_id = user.ccn_user
        else:
            current_user_id = current_user.ccn_user

        schema = AITaskCreateSchema()
        data = schema.load(request.json)

        # Create AI agent service
        agent_service = create_ai_agent(data["agent_id"])

        # Execute task (async function needs to be run with asyncio)
        async def run_task():
            return await agent_service.execute_task(
                task_data={
                    "task_type": data["task_type"],
                    "task_name": data.get("task_name"),
                    "input_data": data["input_data"],
                },
                submitted_by=current_user_id,
            )

        # Handle asyncio properly - Flask runs synchronously, so we can safely use asyncio.run
        # However, if there's already an event loop, we need to handle it differently
        try:
            # Try to get existing event loop
            loop = asyncio.get_running_loop()
            # If we get here, there's a running loop - use ThreadPoolExecutor
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, run_task())
                result = future.result(timeout=300)  # 5 minute timeout
        except RuntimeError:
            # No running loop, safe to use asyncio.run
            result = asyncio.run(run_task())

        return jsonify(result), 201 if result["success"] else 500

    except ValidationError as err:
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"Validation error: {err.messages}")
        return jsonify({"success": False, "error": err.messages}), 400
    except Exception as e:
        import logging
        import traceback

        logger = logging.getLogger(__name__)
        error_trace = traceback.format_exc()
        logger.error(f"Error executing task: {str(e)}\n{error_trace}")
        return jsonify({"success": False, "error": str(e), "details": error_trace}), 500


# ============================================================================
# Human Approvals Endpoints
# ============================================================================


@blueprint_api_ai_governance.route("/api/v1/ai/approvals", methods=["GET"])
@jwt_required()
@require_permission("approvals", "read")
def get_approvals():
    """Get all approval requests"""
    try:
        # Get user ID (ccn_user) - current_user is loaded by require_permission decorator
        if not current_user:
            user_email = get_jwt_identity()
            from ..models.tbl_users import User

            user = User.query.filter_by(email=user_email).first()
            if not user:
                return (
                    jsonify({"success": False, "error": "Usuario no encontrado"}),
                    401,
                )
            current_user_id = user.ccn_user
        else:
            current_user_id = current_user.ccn_user

        # Option to get only assigned to current user
        assigned_only = request.args.get("assigned_only", "false").lower() == "true"
        status = request.args.get("status", "pending")

        query = HumanApproval.query

        if assigned_only:
            query = query.filter_by(assigned_to=current_user_id)

        if status:
            query = query.filter_by(status=status)

        approvals = query.order_by(HumanApproval.created_at.desc()).all()
        schema = HumanApprovalResponseSchema(many=True)

        return (
            jsonify(
                {
                    "success": True,
                    "approvals": schema.dump(approvals),
                    "total": len(approvals),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route(
    "/api/v1/ai/approvals/<approval_id>", methods=["GET"]
)
@jwt_required()
@require_permission("approvals", "read")
def get_approval(approval_id):
    """Get specific approval request with details"""
    try:
        approval = HumanApproval.query.get_or_404(approval_id)
        schema = HumanApprovalDetailResponseSchema()

        return (
            jsonify(
                {
                    "success": True,
                    "approval": schema.dump(approval.to_dict(include_outputs=True)),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 404


@blueprint_api_ai_governance.route(
    "/api/v1/ai/approvals/<approval_id>/approve", methods=["POST"]
)
@jwt_required()
@require_permission("approvals", "approve")
def approve_task(approval_id):
    """Approve a task"""
    try:
        # Get user ID (ccn_user) - current_user is loaded by require_permission decorator
        if not current_user:
            user_email = get_jwt_identity()
            from ..models.tbl_users import User

            user = User.query.filter_by(email=user_email).first()
            if not user:
                return (
                    jsonify({"success": False, "error": "Usuario no encontrado"}),
                    401,
                )
            current_user_id = user.ccn_user
        else:
            current_user_id = current_user.ccn_user

        approval = HumanApproval.query.get_or_404(approval_id)

        # Verify assignment
        if approval.assigned_to != current_user_id:
            return (
                jsonify(
                    {"success": False, "error": "Not authorized to approve this task"}
                ),
                403,
            )

        schema = ApprovalActionSchema()
        data = schema.load(request.json)

        # Update approval
        approval.status = "modified" if data.get("modified_output") else "approved"
        approval.justification = data["justification"]
        approval.approved_at = datetime.utcnow()

        if data.get("modified_output"):
            import json

            approval.modified_output = json.dumps(data["modified_output"])

        # Update task
        task = AITask.query.get(approval.task_id)
        task.status = "approved"
        task.completed_at = datetime.utcnow()

        # Log to blockchain
        blockchain = get_blockchain_service()

        async def log_approval():
            return await blockchain.log_decision(
                {
                    "event_type": "human_approval",
                    "entity_id": approval_id,
                    "actor_id": current_user_id,
                    "action": "approve",
                    "timestamp": datetime.utcnow().timestamp(),
                }
            )

        tx_hash = asyncio.run(log_approval())

        approval.blockchain_tx_hash = tx_hash
        task.blockchain_tx_hash = tx_hash

        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Task approved successfully",
                    "approval_id": approval_id,
                    "blockchain_tx_hash": tx_hash,
                }
            ),
            200,
        )

    except ValidationError as err:
        return jsonify({"success": False, "error": err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route(
    "/api/v1/ai/approvals/<approval_id>/reject", methods=["POST"]
)
@jwt_required()
@require_permission("approvals", "approve")
def reject_task(approval_id):
    """Reject a task"""
    try:
        # Get user ID (ccn_user) - current_user is loaded by require_permission decorator
        if not current_user:
            user_email = get_jwt_identity()
            from ..models.tbl_users import User

            user = User.query.filter_by(email=user_email).first()
            if not user:
                return (
                    jsonify({"success": False, "error": "Usuario no encontrado"}),
                    401,
                )
            current_user_id = user.ccn_user
        else:
            current_user_id = current_user.ccn_user

        approval = HumanApproval.query.get_or_404(approval_id)

        if approval.assigned_to != current_user_id:
            return (
                jsonify(
                    {"success": False, "error": "Not authorized to reject this task"}
                ),
                403,
            )

        schema = ApprovalActionSchema()
        data = schema.load(request.json)

        approval.status = "rejected"
        approval.justification = data["justification"]
        approval.approved_at = datetime.utcnow()

        task = AITask.query.get(approval.task_id)
        task.status = "rejected"
        task.completed_at = datetime.utcnow()

        # Log to blockchain
        blockchain = get_blockchain_service()

        async def log_rejection():
            return await blockchain.log_decision(
                {
                    "event_type": "human_rejection",
                    "entity_id": approval_id,
                    "actor_id": current_user_id,
                    "action": "reject",
                    "timestamp": datetime.utcnow().timestamp(),
                }
            )

        tx_hash = asyncio.run(log_rejection())

        approval.blockchain_tx_hash = tx_hash

        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Task rejected successfully",
                    "approval_id": approval_id,
                    "blockchain_tx_hash": tx_hash,
                }
            ),
            200,
        )

    except ValidationError as err:
        return jsonify({"success": False, "error": err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================================
# Policies Endpoints
# ============================================================================


@blueprint_api_ai_governance.route("/api/v1/ai/policies", methods=["GET"])
@jwt_required()
@require_permission("policies", "read")
def get_policies():
    """Get all policies"""
    try:
        policies = Policy.query.filter_by(active=True).all()
        schema = PolicyResponseSchema(many=True)

        return jsonify({"success": True, "policies": schema.dump(policies)}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route("/api/v1/ai/policies", methods=["POST"])
@jwt_required()
@require_permission("policies", "create")
def create_policy():
    """Create new policy"""
    try:
        # Get user ID (ccn_user) - current_user is loaded by require_permission decorator
        if not current_user:
            user_email = get_jwt_identity()
            from ..models.tbl_users import User

            user = User.query.filter_by(email=user_email).first()
            if not user:
                return (
                    jsonify({"success": False, "error": "Usuario no encontrado"}),
                    401,
                )
            current_user_id = user.ccn_user
        else:
            current_user_id = current_user.ccn_user

        schema = PolicyCreateSchema()
        data = schema.load(request.json)

        policy = Policy(
            name=data["name"],
            description=data.get("description"),
            rule_json=data["rule_json"],
            enforcement_level=data.get("enforcement_level", "blocking"),
            applies_to=data.get("applies_to"),
            active=data.get("active", True),
            created_by=current_user_id,
        )

        db.session.add(policy)
        db.session.commit()

        response_schema = PolicyResponseSchema()
        return (
            jsonify(
                {
                    "success": True,
                    "message": "Policy created successfully",
                    "policy": response_schema.dump(policy),
                }
            ),
            201,
        )

    except ValidationError as err:
        return jsonify({"success": False, "error": err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================================
# Dashboard & Compliance Endpoints
# ============================================================================


@blueprint_api_ai_governance.route("/api/v1/ai/dashboard/stats", methods=["GET"])
@jwt_required()
@require_permission("ai_agents", "read")
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        from sqlalchemy import func

        total_agents = AIAgent.query.count()
        active_agents = AIAgent.query.filter_by(status="active").count()
        total_tasks = AITask.query.count()

        today = datetime.utcnow().date()
        tasks_today = AITask.query.filter(func.date(AITask.created_at) == today).count()

        pending_approvals = HumanApproval.query.filter_by(status="pending").count()

        # Average confidence
        avg_confidence = (
            db.session.query(func.avg(AITask.confidence_score))
            .filter(AITask.confidence_score.isnot(None))
            .scalar()
            or 0.0
        )

        mpc_operations_count = MPCOperation.query.count()

        # Blockchain stats
        blockchain = get_blockchain_service()
        blockchain_stats = blockchain.get_blockchain_stats()

        # Automation rate
        automated_tasks = AITask.query.filter_by(requires_approval=False).count()
        automation_rate = (
            (automated_tasks / total_tasks * 100) if total_tasks > 0 else 0
        )

        return (
            jsonify(
                {
                    "success": True,
                    "stats": {
                        "total_agents": total_agents,
                        "active_agents": active_agents,
                        "total_tasks": total_tasks,
                        "tasks_today": tasks_today,
                        "pending_approvals": pending_approvals,
                        "average_confidence": float(avg_confidence),
                        "mpc_operations_count": mpc_operations_count,
                        "blockchain_blocks": blockchain_stats["total_blocks"],
                        "automation_rate": round(automation_rate, 2),
                    },
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route("/api/v1/ai/blockchain/audit", methods=["GET"])
@jwt_required()
@require_permission("ai_agents", "read")
def get_audit_trail():
    """Get blockchain audit trail"""
    try:
        event_type = request.args.get("event_type")
        limit = int(request.args.get("limit", 50))

        query = BlockchainAudit.query

        if event_type:
            query = query.filter_by(event_type=event_type)

        audit_records = (
            query.order_by(BlockchainAudit.timestamp.desc()).limit(limit).all()
        )

        schema = BlockchainAuditResponseSchema(many=True)

        return (
            jsonify(
                {
                    "success": True,
                    "audit_trail": schema.dump(audit_records),
                    "total": len(audit_records),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
