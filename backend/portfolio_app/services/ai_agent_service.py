"""
AI Agent Service - Orchestrator
Integrates OpenAI API, MPC, and Blockchain for secure AI governance
"""

import json
import hashlib
from typing import Dict, Any, Tuple, Optional, Callable
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
                - agent_type: Type of agent (financial, legal, hr, general)
                - name: Agent name
                - description: Agent description
        """
        self.agent_id = agent_config["agent_id"]
        self.model_name = agent_config.get("model_name", "gpt-4")
        self.confidence_threshold = float(
            agent_config.get("confidence_threshold", 0.70)
        )
        self.agent_type = agent_config.get("agent_type", "general")
        self.agent_name = agent_config.get("name", "AI Agent")
        self.agent_description = agent_config.get("description", "")

        # Initialize services
        self.mpc = MPCService(threshold=3, num_shares=5)
        self.blockchain = get_blockchain_service()

        # Determine if using local model (Ollama) or OpenAI
        self.use_local_model = agent_config.get("use_local_model", False)
        # Use host.docker.internal for Docker containers to access host services
        # For local development outside Docker, use localhost
        # Check if we're in Docker (common indicators)
        is_docker = os.path.exists("/.dockerenv") or os.getenv("DOCKER_CONTAINER")
        default_url = os.getenv("OLLAMA_BASE_URL")
        if not default_url:
            if is_docker:
                default_url = "http://host.docker.internal:11434/v1"
            else:
                default_url = "http://localhost:11434/v1"
        self.local_model_url = agent_config.get("local_model_url", default_url)
        self.local_model_name = agent_config.get("local_model_name", "gpt-oss-20b")

        # Configure AI client (OpenAI or Ollama)
        if self.use_local_model:
            # Use Ollama (compatible with OpenAI API)
            self.openai_client = OpenAI(
                api_key="ollama",  # Ollama doesn't require a real API key
                base_url=self.local_model_url,
                timeout=300.0,  # 5 minutes timeout for local models
            )
            print(
                f"✅ Using local model: {self.local_model_name} at {self.local_model_url}"
            )
            # Test connection to Ollama (optional, non-blocking)
            # Use urllib instead of requests to avoid dependency issues
            try:
                from urllib.request import urlopen
                from urllib.error import URLError
                import json as json_module
                
                test_url = self.local_model_url.replace("/v1", "/api/tags")
                with urlopen(test_url, timeout=5) as response:
                    if response.status == 200:
                        data = json_module.loads(response.read().decode())
                        models = data.get("models", [])
                        model_names = [m.get("name", "") for m in models]
                        print(f"✅ Ollama connection OK. Available models: {model_names}")
                        if self.local_model_name not in model_names and self.local_model_name not in [m.split(":")[0] for m in model_names]:
                            print(f"⚠️  Warning: Model '{self.local_model_name}' not found in Ollama. Available: {model_names}")
                    else:
                        print(f"⚠️  Warning: Ollama returned status {response.status}")
            except Exception as conn_error:
                test_url = self.local_model_url.replace("/v1", "/api/tags")
                print(f"⚠️  Warning: Could not verify Ollama connection: {conn_error}")
                print(f"   URL tested: {test_url}")
                print(f"   This may cause errors when executing tasks.")
        else:
            # Use OpenAI
            api_key = os.getenv("OPENAI_API_KEY")
            self.openai_client = OpenAI(api_key=api_key) if api_key else None
            if self.openai_client:
                print(f"✅ Using OpenAI model: {self.model_name}")

    async def execute_task(
        self, task_data: Dict[str, Any], submitted_by: Optional[int] = None, is_public: bool = False, company_id: Optional[str] = None
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
            is_public=is_public,
            company_id=company_id,
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
        # Check if a custom prompt is provided in input_data
        custom_prompt = processed_data.get("prompt")
        if custom_prompt:
            # Use custom prompt and remove it from data to avoid duplication
            data_for_prompt = {k: v for k, v in processed_data.items() if k != "prompt"}
            # Include the data in the prompt context
            if data_for_prompt:
                prompt = f"{custom_prompt}\n\nDatos proporcionados:\n{json.dumps(data_for_prompt, indent=2, ensure_ascii=False)}"
            else:
                prompt = custom_prompt
        else:
            # Create prompt based on task type (default behavior)
            prompt = self._create_prompt(processed_data, task_type)

        try:
            # Call OpenAI API using new client
            if not self.openai_client:
                raise ValueError("OpenAI API key not configured")

            # Increase max_tokens for complex tasks like financial reconciliation
            max_tokens = (
                2000 if task_type in ["financial_analysis", "data_extraction"] else 500
            )

            # Get system prompt based on agent type
            system_prompt = self._get_system_prompt()

            # Prepare messages with context
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ]

            # Ollama doesn't support tools/function calling, so skip for local models
            tools = None if self.use_local_model else self._get_agent_tools()

            # Call AI API (OpenAI or Ollama)
            # Use local model name if using Ollama, otherwise use configured model
            model_to_use = (
                self.local_model_name if self.use_local_model else self.model_name
            )

            response_params = {
                "model": model_to_use,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": max_tokens,
                "stream": False,  # Default to non-streaming
            }

            # Add tools if available and NOT using local model (Ollama doesn't support tools)
            if tools and not self.use_local_model:
                response_params["tools"] = tools
                response_params["tool_choice"] = "auto"

            response = self.openai_client.chat.completions.create(**response_params)

            # Handle tool calls if present (only for OpenAI, not Ollama)
            if not self.use_local_model and response.choices[0].message.tool_calls:
                messages.append(response.choices[0].message)
                # Execute tool calls
                for tool_call in response.choices[0].message.tool_calls:
                    tool_result = self._execute_tool_call(tool_call, processed_data)
                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": json.dumps(tool_result),
                        }
                    )

                # Get final response after tool execution
                final_response = self.openai_client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=max_tokens,
                )
                response = final_response

            # Extract result
            result = {
                "output": response.choices[0].message.content,
                "model": self.model_name,
                "tokens_used": response.usage.total_tokens if response.usage else 0,
            }

            # Calculate confidence with improved heuristics
            confidence = self._calculate_confidence(response, result["output"])

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

    async def execute_task_streaming(
        self,
        task_data: Dict[str, Any],
        submitted_by: Optional[int] = None,
        stream_callback: Optional[Callable] = None,
    ) -> Dict[str, Any]:
        """
        Execute an AI task with streaming support

        Args:
            task_data: Task data dict with task_id, task_type, task_name, input_data
            submitted_by: User ID who submitted task
            stream_callback: Callback function to send stream chunks

        Returns:
            Result dictionary with execution details
        """
        task_id = task_data.get("task_id", self._generate_uuid())

        # Get task from database
        task = AITask.query.get(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        try:
            # Step 1: Classify sensitivity
            is_sensitive, detected_types = classify_sensitivity(task_data["input_data"])
            task.is_sensitive_data = is_sensitive
            input_hash = self._hash_data(task_data["input_data"])
            task.input_data_hash = input_hash

            if stream_callback:
                stream_callback(
                    {
                        "type": "status",
                        "message": "Clasificando sensibilidad de datos...",
                        "status": "processing",
                    }
                )

            # Step 2: Process with MPC if sensitive
            if is_sensitive:
                if stream_callback:
                    stream_callback(
                        {
                            "type": "status",
                            "message": f"Datos sensibles detectados ({', '.join(detected_types)}). Usando MPC...",
                            "status": "processing",
                        }
                    )

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
            else:
                processed_data = task_data["input_data"]
                mpc_proof = None

            # Step 3: Execute AI model with streaming
            if stream_callback:
                stream_callback(
                    {
                        "type": "status",
                        "message": f"Ejecutando modelo {self.model_name}...",
                        "status": "processing",
                    }
                )

            try:
                result, confidence = await self._run_model_streaming(
                    processed_data, task_data["task_type"], stream_callback
                )
            except Exception as model_error:
                # If model execution fails, mark task as failed
                import traceback

                error_trace = traceback.format_exc()
                error_msg = str(model_error)
                print(f"❌ Error in _run_model_streaming: {error_msg}\n{error_trace}")

                # Check if it's a quota/rate limit error and provide user-friendly message
                error_lower = error_msg.lower()
                if "connection" in error_lower or "refused" in error_lower or "connect" in error_lower:
                    if self.use_local_model:
                        error_msg = f"Error de conexión con Ollama. Verifica que Ollama esté corriendo en {self.local_model_url}. Error: {error_msg}"
                    else:
                        error_msg = "Error de conexión con OpenAI API. Verifica tu conexión a internet."
                elif "quota" in error_lower or "insufficient_quota" in error_lower:
                    error_msg = "OpenAI API: Cuota excedida. No hay créditos disponibles en la cuenta."
                elif "429" in error_msg or "rate limit" in error_lower:
                    error_msg = (
                        "OpenAI API: Límite de tasa excedido. Intenta más tarde."
                    )
                elif (
                    "invalid_api_key" in error_lower or "authentication" in error_lower
                ):
                    error_msg = "OpenAI API: Clave de API inválida o no configurada."
                elif "timeout" in error_lower:
                    if self.use_local_model:
                        error_msg = f"Timeout conectando a Ollama en {self.local_model_url}. El modelo puede estar ocupado o muy lento."
                    else:
                        error_msg = "Timeout conectando a OpenAI API."
                else:
                    if self.use_local_model:
                        error_msg = f"Error con modelo local (Ollama): {error_msg}"
                    else:
                        error_msg = f"Error ejecutando modelo: {error_msg}"

                task.status = "failed"
                task.error_message = error_msg
                task.completed_at = datetime.utcnow()
                db.session.commit()

                if stream_callback:
                    stream_callback(
                        {
                            "type": "error",
                            "error": error_msg,
                        }
                    )

                raise  # Re-raise to be caught by outer exception handler

            task.confidence_score = confidence
            output_hash = self._hash_data(result)
            task.output_data_hash = output_hash
            task.result_data = json.dumps(result)

            # Step 4: Check if approval needed
            requires_approval = await self._check_approval_needed(
                confidence=confidence,
                is_sensitive=is_sensitive,
                task_type=task_data["task_type"],
            )

            task.requires_approval = requires_approval

            if requires_approval:
                task.status = "awaiting_approval"
                if stream_callback:
                    stream_callback(
                        {
                            "type": "status",
                            "message": "Tarea requiere aprobación humana",
                            "status": "awaiting_approval",
                        }
                    )
            else:
                task.status = "completed"
                task.completed_at = datetime.utcnow()

            # Step 5: Log to blockchain
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

            # Step 6: Create approval request if needed
            if requires_approval:
                approval = await self._create_approval_request(
                    task_id=task_id, original_output=result
                )

            # Ensure task status is saved and committed BEFORE sending callback
            try:
                db.session.add(task)
                db.session.commit()
                print(f"✅ Task {task_id} status updated to: {task.status}")
            except Exception as commit_error:
                print(f"❌ Error committing task status: {commit_error}")
                db.session.rollback()
                # Try one more time
                try:
                    # Refresh task from database
                    db.session.refresh(task)
                    task.status = (
                        "awaiting_approval" if requires_approval else "completed"
                    )
                    if not requires_approval:
                        task.completed_at = datetime.utcnow()
                    db.session.commit()
                    print(f"✅ Task {task_id} status retry updated to: {task.status}")
                except Exception as retry_error:
                    print(f"❌ Retry commit also failed: {retry_error}")
                    # Mark as failed if we can't commit
                    task.status = "failed"
                    task.error_message = f"Database commit error: {str(retry_error)}"
                    task.completed_at = datetime.utcnow()
                    db.session.commit()

            # Send completion status AFTER commit
            if stream_callback:
                try:
                    stream_callback(
                        {
                            "type": "complete",
                            "result": {
                                "success": True,
                                "task_id": task_id,
                                "result": result if not requires_approval else None,
                                "confidence": float(confidence),
                                "requires_approval": requires_approval,
                                "is_sensitive": is_sensitive,
                                "mpc_used": is_sensitive,
                                "mpc_metadata": (
                                    mpc_result["mpc_metadata"] if is_sensitive else None
                                ),
                                "blockchain_tx_hash": tx_hash,
                                "status": task.status,
                                "timestamp": datetime.utcnow().isoformat(),
                            },
                        }
                    )
                    print(f"✅ Completion callback sent for task {task_id}")
                except Exception as callback_error:
                    print(f"❌ Error in completion callback: {callback_error}")

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
            # Handle errors - ensure task is marked as failed
            import traceback

            error_trace = traceback.format_exc()
            print(f"❌ Error in execute_task_streaming: {str(e)}\n{error_trace}")

            try:
                # Try to update task status even if there's an error
                task.status = "failed"
                task.error_message = str(e)
                task.completed_at = datetime.utcnow()
                db.session.add(task)
                db.session.commit()
            except Exception as db_error:
                print(f"❌ Error updating task status: {str(db_error)}")

            if stream_callback:
                try:
                    stream_callback(
                        {
                            "type": "error",
                            "error": str(e),
                            "trace": error_trace,
                        }
                    )
                except Exception as callback_error:
                    print(f"❌ Error in stream_callback: {str(callback_error)}")

            return {
                "success": False,
                "task_id": task_id,
                "error": str(e),
                "status": "failed",
            }

    async def _run_model_streaming(
        self,
        processed_data: Dict[str, Any],
        task_type: str,
        stream_callback: Optional[Callable] = None,
    ) -> Tuple[Any, float]:
        """
        Execute OpenAI model with streaming support

        Args:
            processed_data: Processed input data
            task_type: Type of task
            stream_callback: Callback to send stream chunks

        Returns:
            Tuple of (result, confidence_score)
        """
        # Check if a custom prompt is provided
        custom_prompt = processed_data.get("prompt")
        if custom_prompt:
            data_for_prompt = {k: v for k, v in processed_data.items() if k != "prompt"}
            if data_for_prompt:
                prompt = f"{custom_prompt}\n\nDatos proporcionados:\n{json.dumps(data_for_prompt, indent=2, ensure_ascii=False)}"
            else:
                prompt = custom_prompt
        else:
            prompt = self._create_prompt(processed_data, task_type)

        try:
            if not self.openai_client:
                raise ValueError("OpenAI API key not configured")

            max_tokens = (
                2000 if task_type in ["financial_analysis", "data_extraction"] else 500
            )

            system_prompt = self._get_system_prompt()
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ]

            # Ollama doesn't support tools/function calling, so skip for local models
            tools = None if self.use_local_model else self._get_agent_tools()

            # Call AI API with streaming (OpenAI or Ollama)
            # Use local model name if using Ollama, otherwise use configured model
            model_to_use = (
                self.local_model_name if self.use_local_model else self.model_name
            )

            response_params = {
                "model": model_to_use,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": max_tokens,
                "stream": True,  # Enable streaming
            }

            # Only add tools if NOT using local model (Ollama doesn't support tools)
            if tools and not self.use_local_model:
                response_params["tools"] = tools
                response_params["tool_choice"] = "auto"

            # Stream the response
            full_content = ""
            stream = self.openai_client.chat.completions.create(**response_params)

            if stream_callback:
                stream_callback(
                    {
                        "type": "stream_start",
                        "message": "Generando respuesta...",
                    }
                )

            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content_chunk = chunk.choices[0].delta.content
                    full_content += content_chunk

                    # Send chunk to callback
                    if stream_callback:
                        stream_callback(
                            {
                                "type": "chunk",
                                "content": content_chunk,
                            }
                        )

            # Handle tool calls if present (non-streaming for tools)
            # Note: Tools don't support streaming, and Ollama doesn't support tools at all
            if tools and not self.use_local_model and full_content == "":
                # If no content, might be tool call - handle non-streaming
                response_params["stream"] = False
                response = self.openai_client.chat.completions.create(**response_params)

                if response.choices[0].message.tool_calls:
                    messages.append(response.choices[0].message)
                    for tool_call in response.choices[0].message.tool_calls:
                        tool_result = self._execute_tool_call(tool_call, processed_data)
                        messages.append(
                            {
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "content": json.dumps(tool_result),
                            }
                        )

                    # Get final response after tool execution (with streaming)
                    response_params["stream"] = True
                    final_stream = self.openai_client.chat.completions.create(
                        **response_params
                    )
                    full_content = ""
                    for chunk in final_stream:
                        if chunk.choices[0].delta.content:
                            content_chunk = chunk.choices[0].delta.content
                            full_content += content_chunk
                            if stream_callback:
                                stream_callback(
                                    {
                                        "type": "chunk",
                                        "content": content_chunk,
                                    }
                                )

            # Extract result
            result = {
                "output": full_content,
                "model": self.model_name,
                "tokens_used": 0,  # Will be calculated from usage if available
            }

            # Calculate confidence
            confidence = self._calculate_confidence_from_content(full_content)

            if stream_callback:
                stream_callback(
                    {
                        "type": "stream_complete",
                        "message": "Respuesta completada",
                    }
                )

            return result, confidence

        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            error_msg = str(e)
            error_lower = error_msg.lower()
            
            # Log full error for debugging
            print(f"❌ AI Model streaming error: {error_msg}")
            print(f"📋 Full traceback:\n{error_trace}")
            
            # Check for specific errors
            if "connection" in error_lower or "refused" in error_lower or "connect" in error_lower:
                if self.use_local_model:
                    error_msg = f"Error de conexión con Ollama. Verifica que Ollama esté corriendo en {self.local_model_url}. Error: {error_msg}"
                else:
                    error_msg = "Error de conexión con OpenAI API. Verifica tu conexión a internet."
            elif "quota" in error_lower or "insufficient_quota" in error_lower:
                error_msg = "OpenAI API: Cuota excedida. No hay créditos disponibles en la cuenta."
            elif "429" in error_msg or "rate limit" in error_lower:
                error_msg = "OpenAI API: Límite de tasa excedido. Intenta más tarde."
            elif "invalid_api_key" in error_lower or "authentication" in error_lower:
                error_msg = "OpenAI API: Clave de API inválida o no configurada."
            elif "timeout" in error_lower:
                if self.use_local_model:
                    error_msg = f"Timeout conectando a Ollama en {self.local_model_url}. El modelo puede estar ocupado o muy lento."
                else:
                    error_msg = "Timeout conectando a OpenAI API."
            else:
                if self.use_local_model:
                    error_msg = f"Error con modelo local (Ollama): {error_msg}"
                else:
                    error_msg = f"Error ejecutando modelo: {error_msg}"
            
            if stream_callback:
                stream_callback(
                    {
                        "type": "error",
                        "error": error_msg,
                    }
                )

            # Re-raise the exception so it can be handled by the outer try-catch
            # This ensures the task is marked as failed
            raise Exception(error_msg)

    def _calculate_confidence_from_content(self, content: str) -> float:
        """Calculate confidence from content (simplified version for streaming)"""
        confidence = 0.85

        # Similar logic to _calculate_confidence but for content string
        content_lower = content.lower()

        # Uncertainty indicators
        uncertainty_phrases = [
            "i'm not sure",
            "uncertain",
            "cannot determine",
            "might be",
            "possibly",
            "perhaps",
            "i think",
            "not certain",
            "unclear",
        ]
        uncertainty_count = sum(
            1 for phrase in uncertainty_phrases if phrase in content_lower
        )
        if uncertainty_count > 0:
            confidence -= min(0.20, uncertainty_count * 0.05)

        # Confidence indicators
        confidence_phrases = [
            "definitely",
            "certainly",
            "clearly",
            "evidently",
            "confirmed",
            "based on",
            "according to",
            "the data shows",
        ]
        confidence_count = sum(
            1 for phrase in confidence_phrases if phrase in content_lower
        )
        if confidence_count > 0:
            confidence += min(0.10, confidence_count * 0.02)

        # Structured output
        if any(marker in content for marker in ["1.", "2.", "-", "|", "```", "{"]):
            confidence += 0.05

        return max(0.30, min(0.95, round(confidence, 3)))

    def _get_system_prompt(self) -> str:
        """Get system prompt based on agent type and configuration"""
        base_prompt = f"""You are {self.agent_name}, a specialized AI agent for {self.agent_type} tasks.
        
{self.agent_description if self.agent_description else ""}

Your role is to:
- Provide accurate, well-reasoned responses
- Be transparent about uncertainty
- Follow best practices for {self.agent_type} domain
- Structure your responses clearly
- Include relevant calculations or reasoning when applicable

Guidelines:
- Always be precise and factual
- If uncertain, clearly state your confidence level
- Format complex data in structured ways (tables, lists, JSON when appropriate)
- Consider edge cases and potential issues
"""

        # Add type-specific instructions
        type_specific = {
            "financial": """
Financial Analysis Guidelines:
- Focus on accuracy and compliance
- Highlight risks and opportunities
- Provide clear financial metrics
- Consider regulatory implications
- Use appropriate financial terminology
""",
            "legal": """
Legal Analysis Guidelines:
- Be precise with legal terminology
- Cite relevant principles when possible
- Identify potential legal risks
- Consider jurisdiction-specific factors
- Maintain professional legal language
""",
            "hr": """
HR Guidelines:
- Consider employee privacy and data protection
- Follow HR best practices
- Be sensitive to diversity and inclusion
- Maintain confidentiality standards
- Provide actionable HR recommendations
""",
            "general": """
General Guidelines:
- Adapt to the specific task requirements
- Provide clear, actionable insights
- Consider multiple perspectives
- Be thorough but concise
""",
        }

        return base_prompt + type_specific.get(
            self.agent_type, type_specific["general"]
        )

    def _get_agent_tools(self) -> Optional[list]:
        """Get available tools/functions for the agent based on type"""
        if self.agent_type == "financial":
            return [
                {
                    "type": "function",
                    "function": {
                        "name": "calculate_financial_metrics",
                        "description": "Calculate financial metrics like ROI, profit margin, growth rate, etc.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "metric_type": {
                                    "type": "string",
                                    "enum": [
                                        "roi",
                                        "profit_margin",
                                        "growth_rate",
                                        "break_even",
                                        "npv",
                                    ],
                                    "description": "Type of financial metric to calculate",
                                },
                                "values": {
                                    "type": "object",
                                    "description": "Financial values needed for calculation",
                                },
                            },
                            "required": ["metric_type", "values"],
                        },
                    },
                },
                {
                    "type": "function",
                    "function": {
                        "name": "format_financial_report",
                        "description": "Format financial data into a structured report",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "data": {
                                    "type": "object",
                                    "description": "Financial data to format",
                                },
                                "format": {
                                    "type": "string",
                                    "enum": ["table", "summary", "detailed"],
                                    "description": "Format style for the report",
                                },
                            },
                            "required": ["data", "format"],
                        },
                    },
                },
            ]
        elif self.agent_type == "legal":
            return [
                {
                    "type": "function",
                    "function": {
                        "name": "analyze_legal_document",
                        "description": "Analyze legal documents for key clauses, risks, and obligations",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "document_type": {
                                    "type": "string",
                                    "description": "Type of legal document",
                                },
                                "focus_areas": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Specific areas to focus on in the analysis",
                                },
                            },
                            "required": ["document_type"],
                        },
                    },
                }
            ]
        return None

    def _execute_tool_call(self, tool_call: Any, context_data: Dict) -> Dict[str, Any]:
        """Execute a tool call and return results"""
        function_name = tool_call.function.name
        function_args = json.loads(tool_call.function.arguments)

        if function_name == "calculate_financial_metrics":
            return self._calculate_financial_metric(
                function_args.get("metric_type"), function_args.get("values", {})
            )
        elif function_name == "format_financial_report":
            return self._format_financial_report(
                function_args.get("data", {}), function_args.get("format", "summary")
            )
        elif function_name == "analyze_legal_document":
            return self._analyze_legal_document(
                function_args.get("document_type"), function_args.get("focus_areas", [])
            )

        return {"error": f"Unknown tool: {function_name}"}

    def _calculate_financial_metric(
        self, metric_type: str, values: Dict
    ) -> Dict[str, Any]:
        """Calculate financial metrics"""
        try:
            if metric_type == "roi":
                investment = values.get("investment", 0)
                return_amount = values.get("return", 0)
                roi = (
                    ((return_amount - investment) / investment * 100)
                    if investment > 0
                    else 0
                )
                return {
                    "metric": "ROI",
                    "value": f"{roi:.2f}%",
                    "calculation": f"(({return_amount} - {investment}) / {investment}) * 100",
                }

            elif metric_type == "profit_margin":
                revenue = values.get("revenue", 0)
                costs = values.get("costs", 0)
                profit = revenue - costs
                margin = (profit / revenue * 100) if revenue > 0 else 0
                return {
                    "metric": "Profit Margin",
                    "value": f"{margin:.2f}%",
                    "profit": profit,
                }

            elif metric_type == "growth_rate":
                current = values.get("current", 0)
                previous = values.get("previous", 0)
                growth = ((current - previous) / previous * 100) if previous > 0 else 0
                return {"metric": "Growth Rate", "value": f"{growth:.2f}%"}

            return {"error": f"Unknown metric type: {metric_type}"}
        except Exception as e:
            return {"error": str(e)}

    def _format_financial_report(self, data: Dict, format_type: str) -> Dict[str, Any]:
        """Format financial data into a report"""
        return {
            "format": format_type,
            "summary": "Financial report formatted",
            "data": data,
        }

    def _analyze_legal_document(
        self, document_type: str, focus_areas: list
    ) -> Dict[str, Any]:
        """Analyze legal document"""
        return {
            "document_type": document_type,
            "focus_areas": focus_areas,
            "analysis": "Legal analysis completed",
        }

    def _create_prompt(self, data: Dict, task_type: str) -> str:
        """Create prompt based on task type with better structure"""
        if task_type == "financial_analysis":
            return f"""Perform a comprehensive financial analysis of the following data:

{json.dumps(data, indent=2, ensure_ascii=False)}

Please provide:
1. Key financial insights
2. Risk assessment
3. Recommendations
4. Any calculations or metrics that support your analysis

Format your response clearly with sections and use tables where appropriate."""

        elif task_type == "text_classification":
            return f"""Classify the following text and provide:
1. Primary classification category
2. Confidence level
3. Reasoning for the classification
4. Relevant subcategories if applicable

Text to classify:
{data.get('text', '')}"""

        elif task_type == "data_extraction":
            return f"""Extract key information from the following data:

{json.dumps(data, indent=2, ensure_ascii=False)}

Please extract and structure:
1. Key entities and values
2. Relationships between data points
3. Important dates, numbers, or identifiers
4. Any patterns or anomalies

Format the extracted information in a structured way (JSON or table format)."""

        else:
            return f"""Process the following data for {task_type}:

{json.dumps(data, indent=2, ensure_ascii=False)}

Provide a comprehensive analysis with clear structure and actionable insights."""

    async def _check_approval_needed(
        self, confidence: float, is_sensitive: bool, task_type: str
    ) -> bool:
        """
        Determine if task requires human approval
        Uses global approval settings if available, otherwise falls back to agent-specific settings

        Args:
            confidence: Confidence score (0-1)
            is_sensitive: Whether data is sensitive
            task_type: Type of task

        Returns:
            True if approval needed
        """
        from ..models.tbl_approval_settings import ApprovalSettings
        
        # Try to get global settings
        settings = db.session.query(ApprovalSettings).first()
        
        # Use global settings if available, otherwise use agent-specific
        confidence_threshold = (
            float(settings.confidence_threshold) if settings else self.confidence_threshold
        )
        high_risk_types = (
            settings.high_risk_task_types if settings else [
                "financial_transaction",
                "legal_decision",
                "medical_diagnosis",
            ]
        )
        require_approval_for_sensitive = (
            settings.require_approval_for_sensitive_data if settings else True
        )
        auto_approve_high_confidence = (
            settings.auto_approve_high_confidence if settings else False
        )
        auto_approve_threshold = (
            float(settings.auto_approve_threshold) if settings and settings.auto_approve_threshold else None
        )
        
        # Check auto-approval first (if enabled and confidence is very high)
        if auto_approve_high_confidence and auto_approve_threshold:
            if confidence >= auto_approve_threshold:
                return False
        
        # Low confidence always requires approval
        if confidence < confidence_threshold:
            return True

        # Sensitive data requires approval (if configured)
        if is_sensitive and require_approval_for_sensitive:
            return True

        # High-risk task types
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
        from ..models.tbl_user_roles import UserRoles
        from ..models.tbl_roles import Roles

        # Get users with 'admin' or 'moderator' role
        supervisor = (
            db.session.query(User)
            .join(UserRoles, User.ccn_user == UserRoles.ccn_user)
            .join(Roles, UserRoles.ccn_role == Roles.ccn_role)
            .filter(Roles.role_name.in_(["admin", "moderator"]))
            .first()
        )

        if not supervisor:
            # Fallback to any user
            supervisor = db.session.query(User).first()

        # Get SLA from global settings if available
        from ..models.tbl_approval_settings import ApprovalSettings
        settings = db.session.query(ApprovalSettings).first()
        sla_hours = settings.approval_sla_hours if settings else 4

        approval = HumanApproval(
            task_id=task_id,
            assigned_to=supervisor.ccn_user,
            status="pending",
            original_output=json.dumps(original_output),
            original_output_hash=self._hash_data(original_output),
            sla_hours=sla_hours,
        )

        db.session.add(approval)

        return approval

    def _calculate_confidence(self, response: Any, output: str) -> float:
        """
        Calculate confidence score based on multiple factors

        Args:
            response: OpenAI API response
            output: Generated output text

        Returns:
            Confidence score (0-1)
        """
        confidence = 0.85  # Base confidence

        # Factor 1: Response length (very short or very long = lower confidence)
        output_length = len(output)
        if output_length < 50:
            confidence -= 0.15  # Too short, might be incomplete
        elif output_length > 2000:
            confidence -= 0.10  # Very long, might be rambling

        # Factor 2: Token usage (efficiency indicator)
        if response.usage:
            tokens_per_char = response.usage.total_tokens / max(output_length, 1)
            if tokens_per_char > 0.5:  # Inefficient token usage
                confidence -= 0.05

        # Factor 3: Uncertainty indicators in text
        uncertainty_phrases = [
            "i'm not sure",
            "uncertain",
            "cannot determine",
            "might be",
            "possibly",
            "perhaps",
            "i think",
            "not certain",
            "unclear",
        ]
        content_lower = output.lower()
        uncertainty_count = sum(
            1 for phrase in uncertainty_phrases if phrase in content_lower
        )
        if uncertainty_count > 0:
            confidence -= min(0.20, uncertainty_count * 0.05)

        # Factor 4: Confidence indicators (positive)
        confidence_phrases = [
            "definitely",
            "certainly",
            "clearly",
            "evidently",
            "confirmed",
            "based on",
            "according to",
            "the data shows",
        ]
        confidence_count = sum(
            1 for phrase in confidence_phrases if phrase in content_lower
        )
        if confidence_count > 0:
            confidence += min(0.10, confidence_count * 0.02)

        # Factor 5: Structured output (higher confidence)
        if any(marker in output for marker in ["1.", "2.", "-", "|", "```", "{"]):
            confidence += 0.05  # Structured responses are more reliable

        # Factor 6: Agent type specific confidence adjustments
        if self.agent_type == "financial":
            # Financial tasks need high precision
            if "error" in content_lower or "invalid" in content_lower:
                confidence -= 0.15
        elif self.agent_type == "legal":
            # Legal tasks need citations and precision
            if any(
                word in content_lower for word in ["cite", "reference", "according to"]
            ):
                confidence += 0.05

        # Clamp confidence between 0.3 and 0.95
        confidence = max(0.30, min(0.95, confidence))

        return round(confidence, 3)

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
def create_ai_agent(agent_id_or_config) -> AIAgentService:
    """
    Create AI Agent instance from database config or direct config dict

    Args:
        agent_id_or_config: Either agent UUID string or config dict with:
            - agent_id: Agent UUID
            - model_name: OpenAI model name
            - confidence_threshold: Threshold for approval (0-1)
            - agent_type: Type of agent (financial, legal, hr, general)
            - name: Agent name
            - description: Agent description

    Returns:
        AIAgentService instance
    """
    # If it's a dict, use it directly
    if isinstance(agent_id_or_config, dict):
        config = agent_id_or_config
    else:
        # Otherwise, fetch from database
        agent_id = agent_id_or_config
        agent = AIAgent.query.get(agent_id)

        if not agent:
            raise ValueError(f"Agent {agent_id} not found")

        if agent.status != "active":
            raise ValueError(f"Agent {agent_id} is not active (status: {agent.status})")

        # Check if using local model
        use_local = getattr(agent, "use_local_model", False)
        if not use_local:
            # Auto-detect if model_name indicates a local model
            # Check for llama3 with any variant (llama3, llama3:8b, llama3:70b, etc.)
            model_lower = agent.model_name.lower()
            use_local = (
                agent.model_name.startswith("local:")
                or "llama3" in model_lower
                or agent.model_name in [
                    "gpt-oss-20b",
                    "llama2",
                    "mistral",
                ]
            )

        config = {
            "agent_id": agent.agent_id,
            "model_name": agent.model_name,
            "confidence_threshold": (
                float(agent.confidence_threshold)
                if agent.confidence_threshold
                else 0.70
            ),
            "agent_type": agent.agent_type,
            "name": agent.name,
            "description": agent.description or "",
            # Local model support
            "use_local_model": use_local,
            "local_model_url": (
                getattr(agent, "local_model_url", None)
                or os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434/v1")
            ),
            "local_model_name": (
                getattr(agent, "local_model_name", None)
                or (
                    agent.model_name.replace("local:", "")
                    if agent.model_name.startswith("local:")
                    else agent.model_name if use_local else "gpt-oss-20b"
                )
            ),
        }

    return AIAgentService(config)
