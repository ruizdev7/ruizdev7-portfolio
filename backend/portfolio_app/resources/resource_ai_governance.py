"""
AI Governance Platform API Resources
RESTful endpoints for AI agents, tasks, approvals, and policies
"""

from flask import (
    Blueprint,
    request,
    jsonify,
    Response,
    stream_with_context,
    current_app,
)
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user
from marshmallow import ValidationError
from datetime import datetime
import asyncio
import concurrent.futures
import json

from ..extensions import db
from ..models.tbl_ai_agents import AIAgent
from ..models.tbl_ai_tasks import AITask
from ..models.tbl_human_approvals import HumanApproval
from ..models.tbl_policies import Policy
from ..models.tbl_blockchain_audit import BlockchainAudit
from ..models.tbl_mpc_operations import MPCOperation
from ..models.tbl_approval_settings import ApprovalSettings
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
    ApprovalSettingsUpdateSchema,
    ApprovalSettingsResponseSchema,
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
            # Local model support
            use_local_model=data.get("use_local_model", False),
            local_model_url=data.get("local_model_url"),
            local_model_name=data.get("local_model_name"),
        )

        db.session.add(agent)
        db.session.commit()

        # Log to blockchain
        try:
            blockchain = get_blockchain_service()
            import asyncio

            async def log_agent_creation():
                return await blockchain.log_decision(
                    {
                        "event_type": "agent_created",
                        "entity_id": agent.agent_id,
                        "actor_id": current_user_id,
                        "action": "create",
                        "data_hash": "",
                        "timestamp": datetime.utcnow().timestamp(),
                    }
                )

            tx_hash = asyncio.run(log_agent_creation())
        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Error logging agent creation to blockchain: {str(e)}")
            # Continue even if blockchain logging fails

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

        # Update fields
        for key, value in data.items():
            setattr(agent, key, value)

        # Update timestamp manually to ensure it's updated
        agent.updated_at = datetime.utcnow()

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
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"Error updating agent {agent_id}: {str(e)}")
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

        # Get company_id from user's company or from request
        company_id = data.get("company_id")
        is_public = data.get("is_public", False)

        # Create AI agent service (will fetch config from database)
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
                is_public=data.get("is_public", False),
                company_id=data.get("company_id"),
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


@blueprint_api_ai_governance.route("/api/v1/ai/tasks/stream", methods=["POST"])
@jwt_required()
@require_permission("ai_tasks", "create")
def execute_task_stream():
    """Execute a new AI task with streaming response"""
    try:
        # Get user ID
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
        try:
            data = schema.load(request.json)
        except ValidationError as err:
            import logging
            logging.error(f"Validation error in execute_task_stream: {err.messages}")
            return jsonify({"success": False, "error": err.messages}), 400
        except Exception as e:
            import logging
            logging.error(f"Error loading task data: {str(e)}")
            return jsonify({"success": False, "error": f"Error loading task data: {str(e)}"}), 400

        def generate():
            """Generator function for Server-Sent Events"""
            try:
                # Send initial status
                yield f"data: {json.dumps({'type': 'status', 'message': 'Iniciando tarea...', 'status': 'processing'})}\n\n"

                # Create AI agent service
                agent_service = create_ai_agent(data["agent_id"])

                # Create task record
                from datetime import datetime
                import uuid

                task_id = str(uuid.uuid4())
                task = AITask(
                    task_id=task_id,
                    agent_id=data["agent_id"],
                    submitted_by=current_user_id,
                    task_type=data["task_type"],
                    task_name=data.get("task_name"),
                    status="processing",
                    started_at=datetime.utcnow(),
                    is_public=data.get("is_public", False),
                    company_id=data.get("company_id"),
                )
                db.session.add(task)
                db.session.commit()

                yield f"data: {json.dumps({'type': 'task_id', 'task_id': task_id})}\n\n"

                # Use a queue to collect stream chunks
                import queue

                stream_queue = queue.Queue()
                task_result = {"result": None, "error": None}

                def stream_callback(chunk):
                    """Callback to collect stream chunks"""
                    try:
                        stream_queue.put(chunk)
                        if chunk.get("type") == "complete":
                            task_result["result"] = chunk.get("result")
                            print(
                                f"✅ Stream callback received 'complete' for task {task_id}"
                            )
                        elif chunk.get("type") == "error":
                            task_result["error"] = chunk.get("error")
                            print(
                                f"❌ Stream callback received 'error' for task {task_id}: {chunk.get('error')}"
                            )
                    except Exception as callback_ex:
                        print(f"❌ Error in stream_callback: {callback_ex}")

                # Capture the application object before creating the thread
                # This is necessary because current_app is a proxy that doesn't work across threads
                app = current_app._get_current_object()

                # Execute task with streaming in a separate thread
                def run_task_thread():
                    # Create application context for this thread using the captured app
                    with app.app_context():

                        async def run_streaming_task():
                            return await agent_service.execute_task_streaming(
                                task_data={
                                    "task_id": task_id,
                                    "task_type": data["task_type"],
                                    "task_name": data.get("task_name"),
                                    "input_data": data["input_data"],
                                },
                                submitted_by=current_user_id,
                                stream_callback=stream_callback,
                            )

                        try:
                            print(f"🚀 Starting task execution for {task_id}")
                            loop = asyncio.get_running_loop()
                            with concurrent.futures.ThreadPoolExecutor() as executor:
                                future = executor.submit(
                                    asyncio.run, run_streaming_task()
                                )
                                task_result["result"] = future.result(timeout=300)
                            print(
                                f"✅ Task execution completed for {task_id}, result: {task_result['result'] is not None}"
                            )
                        except RuntimeError:
                            print(f"🚀 Starting task execution (no loop) for {task_id}")
                            task_result["result"] = asyncio.run(run_streaming_task())
                            print(
                                f"✅ Task execution completed (no loop) for {task_id}, result: {task_result['result'] is not None}"
                            )
                        except Exception as e:
                            import traceback

                            error_trace = traceback.format_exc()
                            print(
                                f"❌ Error in run_streaming_task: {str(e)}\n{error_trace}"
                            )
                            task_result["error"] = str(e)
                            # Ensure task is marked as failed
                            try:
                                task = AITask.query.get(task_id)
                                if task and task.status == "processing":
                                    task.status = "failed"
                                    task.error_message = str(e)
                                    task.completed_at = datetime.utcnow()
                                    db.session.commit()
                                    stream_callback(
                                        {
                                            "type": "error",
                                            "error": str(e),
                                        }
                                    )
                            except Exception as db_error:
                                print(f"❌ Error updating failed task: {db_error}")

                # Start task execution in background
                import threading

                task_thread = threading.Thread(target=run_task_thread)
                task_thread.start()

                # Stream chunks as they arrive
                while task_thread.is_alive() or not stream_queue.empty():
                    try:
                        chunk = stream_queue.get(timeout=0.5)
                        yield f"data: {json.dumps(chunk)}\n\n"

                        if (
                            chunk.get("type") == "complete"
                            or chunk.get("type") == "error"
                        ):
                            break
                    except queue.Empty:
                        # Check if thread is still alive
                        if not task_thread.is_alive():
                            break
                        continue

                # Wait for thread to complete and get remaining chunks
                task_thread.join(timeout=300)  # Wait up to 5 minutes

                # If thread is still alive, it means it timed out or is stuck
                if task_thread.is_alive():
                    # Mark task as failed due to timeout
                    try:
                        with app.app_context():
                            task = AITask.query.get(task_id)
                            if task and task.status == "processing":
                                task.status = "failed"
                                task.error_message = (
                                    "Task execution timeout or thread stuck"
                                )
                                task.completed_at = datetime.utcnow()
                                db.session.commit()
                    except Exception as timeout_error:
                        print(f"❌ Error marking timeout task: {timeout_error}")

                    yield f"data: {json.dumps({'type': 'error', 'error': 'Task execution timeout'})}\n\n"
                else:
                    # Get any remaining chunks
                    while not stream_queue.empty():
                        chunk = stream_queue.get_nowait()
                        yield f"data: {json.dumps(chunk)}\n\n"

                    # Send final result if we have it
                    if task_result["result"]:
                        yield f"data: {json.dumps({'type': 'complete', 'result': task_result['result']})}\n\n"
                    elif task_result["error"]:
                        yield f"data: {json.dumps({'type': 'error', 'error': task_result['error']})}\n\n"
                    else:
                        # If thread finished but no result/error, check task status
                        try:
                            with app.app_context():
                                task = AITask.query.get(task_id)
                                if task:
                                    if task.status == "processing":
                                        # Task is still processing but thread finished - mark as failed
                                        task.status = "failed"
                                        task.error_message = "Task execution completed but no result received"
                                        task.completed_at = datetime.utcnow()
                                        db.session.commit()
                                        yield f"data: {json.dumps({'type': 'error', 'error': 'Task execution completed but no result received'})}\n\n"
                                    else:
                                        # Task has a status, send it
                                        yield f"data: {json.dumps({'type': 'complete', 'result': {'success': True, 'task_id': task_id, 'status': task.status}})}\n\n"
                        except Exception as status_check_error:
                            print(
                                f"❌ Error checking task status: {status_check_error}"
                            )
                            yield f"data: {json.dumps({'type': 'error', 'error': 'Unable to determine task status'})}\n\n"

            except Exception as e:
                import logging
                import traceback

                logger = logging.getLogger(__name__)
                logger.error(f"Error in streaming: {str(e)}\n{traceback.format_exc()}")
                yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            },
        )

    except ValidationError as err:
        return jsonify({"success": False, "error": err.messages}), 400
    except Exception as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"Error in stream endpoint: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route(
    "/api/v1/ai/tasks/<task_id>/mark-failed", methods=["POST"]
)
@jwt_required()
@require_permission("ai_tasks", "read")
def mark_task_failed(task_id):
    """Manually mark a stuck task as failed"""
    try:
        task = AITask.query.get(task_id)
        if not task:
            return jsonify({"success": False, "error": "Task not found"}), 404

        if task.status not in ["processing", "pending"]:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": f"Task is not in processing/pending status (current: {task.status})",
                    }
                ),
                400,
            )

        task.status = "failed"
        task.error_message = "Manually marked as failed - task was stuck in processing"
        task.completed_at = datetime.utcnow()
        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Task marked as failed",
                    "task_id": task_id,
                    "status": "failed",
                }
            ),
            200,
        )

    except Exception as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"Error marking task as failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


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
        schema = HumanApprovalResponseSchema()  # Remove many=True, we'll serialize individually
        
        # Serialize approvals with original_output parsed
        approvals_data = []
        for approval in approvals:
            approval_dict = schema.dump(approval)
            # Parse original_output from JSON string to object
            if approval.original_output:
                import json
                try:
                    parsed_output = json.loads(approval.original_output)
                    approval_dict["task_output"] = parsed_output
                    approval_dict["original_output"] = parsed_output
                except:
                    approval_dict["task_output"] = approval.original_output
                    approval_dict["original_output"] = approval.original_output
            approvals_data.append(approval_dict)

        return (
            jsonify(
                {
                    "success": True,
                    "approvals": approvals_data,
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
        
        # Parse outputs from JSON strings
        approval_dict = approval.to_dict(include_outputs=True)
        if approval.original_output:
            import json
            try:
                approval_dict["task_output"] = json.loads(approval.original_output)
                approval_dict["original_output"] = json.loads(approval.original_output)
            except:
                approval_dict["task_output"] = approval.original_output
                approval_dict["original_output"] = approval.original_output
        if approval.modified_output:
            import json
            try:
                approval_dict["modified_output"] = json.loads(approval.modified_output)
            except:
                approval_dict["modified_output"] = approval.modified_output

        return (
            jsonify(
                {
                    "success": True,
                    "approval": approval_dict,
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
# Approval Settings Endpoints
# ============================================================================


@blueprint_api_ai_governance.route("/api/v1/ai/approval-settings", methods=["GET"])
@jwt_required()
@require_permission("policies", "read")
def get_approval_settings():
    """Get approval settings (singleton - returns first or creates default)"""
    try:
        settings = ApprovalSettings.query.first()
        
        # If no settings exist, create default
        if not settings:
            settings = ApprovalSettings(
                high_risk_task_types=[
                    "financial_transaction",
                    "legal_decision",
                    "medical_diagnosis"
                ]
            )
            db.session.add(settings)
            db.session.commit()
        
        schema = ApprovalSettingsResponseSchema()
        return (
            jsonify({
                "success": True,
                "settings": schema.dump(settings)
            }),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route("/api/v1/ai/approval-settings", methods=["PUT"])
@jwt_required()
@require_permission("policies", "update")
def update_approval_settings():
    """Update approval settings"""
    try:
        # Get user ID
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
        
        schema = ApprovalSettingsUpdateSchema()
        data = schema.load(request.json)
        
        # Get or create settings (singleton)
        settings = ApprovalSettings.query.first()
        if not settings:
            settings = ApprovalSettings(
                created_by=current_user_id,
                high_risk_task_types=[
                    "financial_transaction",
                    "legal_decision",
                    "medical_diagnosis"
                ]
            )
            db.session.add(settings)
        
        # Update fields
        if "confidence_threshold" in data:
            settings.confidence_threshold = data["confidence_threshold"]
        if "high_risk_task_types" in data:
            settings.high_risk_task_types = data["high_risk_task_types"]
        if "approval_sla_hours" in data:
            settings.approval_sla_hours = data["approval_sla_hours"]
        if "auto_approve_high_confidence" in data:
            settings.auto_approve_high_confidence = data["auto_approve_high_confidence"]
        if "auto_approve_threshold" in data:
            settings.auto_approve_threshold = data["auto_approve_threshold"]
        if "require_approval_for_sensitive_data" in data:
            settings.require_approval_for_sensitive_data = data["require_approval_for_sensitive_data"]
        
        settings.updated_by = current_user_id
        settings.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        response_schema = ApprovalSettingsResponseSchema()
        return (
            jsonify({
                "success": True,
                "message": "Approval settings updated successfully",
                "settings": response_schema.dump(settings)
            }),
            200,
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


# ============================================================================
# Public AI Operations Endpoints (No Authentication Required)
# ============================================================================


@blueprint_api_ai_governance.route("/api/v1/ai/public/tasks", methods=["GET"])
def get_public_tasks():
    """Get all public AI tasks (no authentication required)"""
    try:
        # Get only public tasks
        public_tasks = AITask.query.filter_by(is_public=True, status="completed").order_by(
            AITask.created_at.desc()
        ).limit(50).all()
        
        schema = AITaskResponseSchema(many=True)
        
        return (
            jsonify(
                {
                    "success": True,
                    "tasks": schema.dump(public_tasks),
                    "total": len(public_tasks),
                }
            ),
            200,
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error getting public tasks: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@blueprint_api_ai_governance.route("/api/v1/ai/public/tasks/<task_id>", methods=["GET"])
def get_public_task(task_id):
    """Get a specific public task (no authentication required)"""
    try:
        task = AITask.query.filter_by(task_id=task_id, is_public=True).first_or_404()
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
