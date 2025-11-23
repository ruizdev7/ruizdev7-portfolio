"""
AI Agent Service - Orchestrator
Integrates OpenAI API, MPC, and Blockchain for secure AI governance
"""

import json
import hashlib
from typing import Dict, Any, Tuple, Optional
from datetime import datetime
from openai import OpenAI
import os

from .mpc_service import MPCService, classify_sensitivity
from .blockchain_service import get_blockchain_service
from ..extensions import db
from ..models.tbl_ai_tasks import AITask
from ..models.tbl_ai_agents import AIAgent
from ..models.tbl_human_approvals import HumanApproval
from ..models.tbl_mpc_operations import MPCOperation


class AIAgentService:
    """
    AI Agent Orchestrator
    Manages AI task execution with MPC privacy and blockchain auditing
    """

    def __init__(self, agent_config: Dict[str, Any]):
        """
        Initialize AI Agent

        Args:
            agent_config: Agent configuration dict with:
                - agent_id: Agent UUID
                - model_name: OpenAI model name
                - confidence_threshold: Threshold for approval (0-1)
        """
        self.agent_id = agent_config["agent_id"]
        self.model_name = agent_config.get("model_name", "gpt-4")
        self.confidence_threshold = float(
            agent_config.get("confidence_threshold", 0.70)
        )

        # Initialize services
        self.mpc = MPCService(threshold=3, num_shares=5)
        self.blockchain = get_blockchain_service()

        # Configure OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        self.openai_client = OpenAI(api_key=api_key) if api_key else None

    async def execute_task(
        self, task_data: Dict[str, Any], submitted_by: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Execute an AI task with full governance pipeline

        Pipeline:
        1. Classify data sensitivity
        2. Use MPC if sensitive
        3. Execute AI model
        4. Calculate confidence
        5. Check policies
        6. Determine approval need
        7. Log to blockchain

        Args:
            task_data: Task data dict with:
                - task_type: Type of task
                - task_name: Human-readable name
                - input_data: Input data dict
                - user_id: User submitting (optional)
            submitted_by: User ID who submitted task

        Returns:
            Result dictionary with execution details
        """
        task_id = task_data.get("task_id", self._generate_uuid())

        # Create task record
        task = AITask(
            task_id=task_id,
            agent_id=self.agent_id,
            submitted_by=submitted_by,
            task_type=task_data["task_type"],
            task_name=task_data.get("task_name"),
            status="processing",
            started_at=datetime.utcnow(),
        )
        db.session.add(task)
        db.session.commit()

        try:
            # Step 1: Classify sensitivity
            is_sensitive, detected_types = classify_sensitivity(task_data["input_data"])
            task.is_sensitive_data = is_sensitive

            input_hash = self._hash_data(task_data["input_data"])
            task.input_data_hash = input_hash

            # Step 2: Process with MPC if sensitive
            if is_sensitive:
                print(f"🔒 Task {task_id}: Sensitive data detected ({detected_types})")
                print(f"   Using MPC for privacy protection...")

                mpc_result = self.mpc.secure_compute(task_data["input_data"])
                processed_data = mpc_result["result"]
                mpc_metadata = mpc_result["mpc_metadata"]
                mpc_proof = mpc_result["proof"]

                task.mpc_used = True

                # Log MPC operation
                mpc_op = MPCOperation(
                    task_id=task_id,
                    data_type=",".join(detected_types),
                    num_shares=mpc_metadata["total_nodes"],
                    threshold=mpc_metadata["threshold"],
                    computation_type="aggregate",
                    status="completed",
                    result_hash=mpc_metadata["result_hash"],
                    proof_hash=mpc_proof["commitment"],
                    completed_at=datetime.utcnow(),
                )
                db.session.add(mpc_op)

                print(f"   ✅ MPC complete: {mpc_metadata['nodes_used']} nodes used")
            else:
                processed_data = task_data["input_data"]
                mpc_proof = None

            # Step 3: Execute AI model
            print(f"🤖 Executing AI model: {self.model_name}")
            result, confidence = await self._run_model(
                processed_data, task_data["task_type"]
            )

            task.confidence_score = confidence
            output_hash = self._hash_data(result)
            task.output_data_hash = output_hash
            task.result_data = json.dumps(result)

            print(f"   ✅ Model execution complete (confidence: {confidence:.2%})")

            # Step 4: Check if approval needed
            requires_approval = await self._check_approval_needed(
                confidence=confidence,
                is_sensitive=is_sensitive,
                task_type=task_data["task_type"],
            )

            task.requires_approval = requires_approval

            if requires_approval:
                task.status = "awaiting_approval"
                print(f"⏳ Task requires human approval (confidence: {confidence:.2%})")
            else:
                task.status = "completed"
                task.completed_at = datetime.utcnow()
                print(f"✅ Task auto-completed (confidence: {confidence:.2%})")

            # Step 5: Log to blockchain
            print(f"⛓️  Logging to blockchain...")

            blockchain_data = {
                "event_type": "ai_task_execution",
                "entity_id": task_id,
                "actor_id": submitted_by or 0,
                "action": "execute",
                "data_hash": input_hash,
                "confidence_score": float(confidence),
                "requires_approval": requires_approval,
                "is_sensitive": is_sensitive,
                "mpc_proof_hash": mpc_proof["commitment"] if mpc_proof else "",
                "timestamp": datetime.utcnow().timestamp(),
            }

            tx_hash = await self.blockchain.log_decision(blockchain_data)
            task.blockchain_tx_hash = tx_hash

            print(f"   ✅ Blockchain tx: {tx_hash[:16]}...")

            # Step 6: Create approval request if needed
            if requires_approval:
                approval = await self._create_approval_request(
                    task_id=task_id, original_output=result
                )
                print(f"   📋 Approval request created: {approval.approval_id}")

            db.session.commit()

            # Return result
            return {
                "success": True,
                "task_id": task_id,
                "result": result if not requires_approval else None,
                "confidence": float(confidence),
                "requires_approval": requires_approval,
                "is_sensitive": is_sensitive,
                "mpc_used": is_sensitive,
                "mpc_metadata": mpc_result["mpc_metadata"] if is_sensitive else None,
                "blockchain_tx_hash": tx_hash,
                "status": task.status,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            # Handle errors
            task.status = "failed"
            task.error_message = str(e)
            task.completed_at = datetime.utcnow()
            db.session.commit()

            print(f"❌ Task failed: {str(e)}")

            return {
                "success": False,
                "task_id": task_id,
                "error": str(e),
                "status": "failed",
            }

    async def _run_model(
        self, processed_data: Dict[str, Any], task_type: str
    ) -> Tuple[Any, float]:
        """
        Execute OpenAI model

        Args:
            processed_data: Processed input data (after MPC if needed)
            task_type: Type of task

        Returns:
            Tuple of (result, confidence_score)
        """
        # Create prompt based on task type
        prompt = self._create_prompt(processed_data, task_type)

        try:
            # Call OpenAI API using new client
            if not self.openai_client:
                raise ValueError("OpenAI API key not configured")

            response = self.openai_client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful AI assistant for business tasks. Provide clear, concise, and accurate responses.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=500,
            )

            # Extract result
            result = {
                "output": response.choices[0].message.content,
                "model": self.model_name,
                "tokens_used": response.usage.total_tokens if response.usage else 0,
            }

            # Calculate confidence (simplified)
            # In production: use model's log probabilities or custom scoring
            confidence = 0.85  # Default high confidence

            # Lower confidence for long outputs (may be hallucinating)
            if response.usage and response.usage.total_tokens > 300:
                confidence = 0.72

            # Lower confidence if model refused or uncertain
            content_lower = result["output"].lower()
            if any(
                phrase in content_lower
                for phrase in ["i'm not sure", "uncertain", "cannot determine"]
            ):
                confidence = 0.65

            return result, confidence

        except Exception as e:
            # Fallback for demo
            print(f"OpenAI API error: {e}")
            print("Using fallback demo response...")

            result = {
                "output": f"Demo response for {task_type} task. OpenAI API not available or error occurred: {str(e)}",
                "model": self.model_name,
                "tokens_used": 0,
                "demo_mode": True,
            }

            return result, 0.75

    def _create_prompt(self, data: Dict, task_type: str) -> str:
        """Create prompt based on task type"""
        if task_type == "financial_analysis":
            return f"Analyze this financial data and provide insights:\n{json.dumps(data, indent=2)}"
        elif task_type == "text_classification":
            return f"Classify the following text:\n{data.get('text', '')}"
        elif task_type == "data_extraction":
            return f"Extract key information from:\n{json.dumps(data, indent=2)}"
        else:
            return f"Process this data for {task_type}:\n{json.dumps(data, indent=2)}"

    async def _check_approval_needed(
        self, confidence: float, is_sensitive: bool, task_type: str
    ) -> bool:
        """
        Determine if task requires human approval

        Args:
            confidence: Confidence score (0-1)
            is_sensitive: Whether data is sensitive
            task_type: Type of task

        Returns:
            True if approval needed
        """
        # Low confidence always requires approval
        if confidence < self.confidence_threshold:
            return True

        # Sensitive data always requires approval
        if is_sensitive:
            return True

        # High-risk task types
        high_risk_types = [
            "financial_transaction",
            "legal_decision",
            "medical_diagnosis",
        ]
        if task_type in high_risk_types:
            return True

        return False

    async def _create_approval_request(
        self, task_id: str, original_output: Any
    ) -> HumanApproval:
        """
        Create human approval request

        Args:
            task_id: Task ID
            original_output: Original AI output

        Returns:
            HumanApproval record
        """
        # Find a supervisor (simplified - should use role-based assignment)
        from ..models.tbl_users import User
        from ..models.tbl_user_roles import UserRole

        # Get users with 'admin' or 'moderator' role
        supervisor = (
            db.session.query(User)
            .join(UserRole)
            .filter(UserRole.role_name.in_(["admin", "moderator"]))
            .first()
        )

        if not supervisor:
            # Fallback to any user
            supervisor = db.session.query(User).first()

        approval = HumanApproval(
            task_id=task_id,
            assigned_to=supervisor.ccn_user,
            status="pending",
            original_output=json.dumps(original_output),
            original_output_hash=self._hash_data(original_output),
            sla_hours=4,
        )

        db.session.add(approval)

        return approval

    def _hash_data(self, data: Any) -> str:
        """SHA-256 hash of data"""
        data_str = (
            json.dumps(data, sort_keys=True) if isinstance(data, dict) else str(data)
        )
        return hashlib.sha256(data_str.encode()).hexdigest()

    def _generate_uuid(self) -> str:
        """Generate UUID"""
        import uuid

        return str(uuid.uuid4())


# Factory function
def create_ai_agent(agent_id: str) -> AIAgentService:
    """
    Create AI Agent instance from database config

    Args:
        agent_id: Agent UUID

    Returns:
        AIAgentService instance
    """
    agent = AIAgent.query.get(agent_id)

    if not agent:
        raise ValueError(f"Agent {agent_id} not found")

    if agent.status != "active":
        raise ValueError(f"Agent {agent_id} is not active (status: {agent.status})")

    config = {
        "agent_id": agent.agent_id,
        "model_name": agent.model_name,
        "confidence_threshold": float(agent.confidence_threshold),
    }

    return AIAgentService(config)
