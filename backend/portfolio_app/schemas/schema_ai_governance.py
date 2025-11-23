"""
Marshmallow Schemas for AI Governance Platform
"""

from marshmallow import Schema, fields, validate, validates, ValidationError, post_load
from datetime import datetime


# ============================================================================
# AI Agent Schemas
# ============================================================================


class AIAgentCreateSchema(Schema):
    """Schema for creating a new AI agent"""

    name = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    agent_type = fields.Str(
        required=True, validate=validate.OneOf(["financial", "legal", "hr", "general"])
    )
    description = fields.Str(required=False, allow_none=True)
    model_name = fields.Str(
        required=False,
        load_default="gpt-4",
    )
    confidence_threshold = fields.Float(
        required=False, validate=validate.Range(min=0.0, max=1.0), load_default=0.70
    )
    status = fields.Str(
        required=False,
        validate=validate.OneOf(["active", "paused", "disabled"]),
        load_default="active",
    )
    # Local model support
    use_local_model = fields.Bool(required=False, load_default=False)
    local_model_url = fields.Str(required=False, allow_none=True)
    local_model_name = fields.Str(required=False, allow_none=True)


class AIAgentUpdateSchema(Schema):
    """Schema for updating an AI agent"""

    name = fields.Str(required=False, validate=validate.Length(min=3, max=100))
    agent_type = fields.Str(
        required=False, validate=validate.OneOf(["financial", "legal", "hr", "general"])
    )
    description = fields.Str(required=False, allow_none=True)
    model_name = fields.Str(required=False)
    confidence_threshold = fields.Float(
        required=False, validate=validate.Range(min=0.0, max=1.0)
    )
    status = fields.Str(
        required=False, validate=validate.OneOf(["active", "paused", "disabled"])
    )
    # Local model support
    agent_type = fields.Str(
        required=False, validate=validate.OneOf(["financial", "legal", "hr", "general"])
    )
    use_local_model = fields.Bool(required=False)
    local_model_url = fields.Str(required=False, allow_none=True)
    local_model_name = fields.Str(required=False, allow_none=True)


class AIAgentResponseSchema(Schema):
    """Schema for AI agent response"""

    agent_id = fields.Str()
    name = fields.Str()
    agent_type = fields.Str()
    description = fields.Str(allow_none=True)
    model_name = fields.Str()
    confidence_threshold = fields.Float()
    status = fields.Str()
    use_local_model = fields.Bool(allow_none=True)
    local_model_url = fields.Str(allow_none=True)
    local_model_name = fields.Str(allow_none=True)
    created_by = fields.Int(allow_none=True)
    created_at = fields.DateTime(allow_none=True)
    updated_at = fields.DateTime(allow_none=True)
    total_tasks = fields.Int()


# ============================================================================
# AI Task Schemas
# ============================================================================


class AITaskCreateSchema(Schema):
    """Schema for creating a new AI task"""

    agent_id = fields.Str(required=True)
    task_type = fields.Str(
        required=True,
        validate=validate.OneOf(
            [
                "financial_analysis",
                "text_classification",
                "data_extraction",
                "sentiment_analysis",
                "summarization",
                "general",
                "financial_transaction",  # High-risk type
                "legal_decision",  # High-risk type
                "medical_diagnosis",  # High-risk type
            ]
        ),
    )
    task_name = fields.Str(required=False, validate=validate.Length(max=200))
    input_data = fields.Dict(required=True)

    @validates("input_data")
    def validate_input_data(self, value):
        """Validate input_data is not empty"""
        if not value:
            raise ValidationError("input_data cannot be empty")


class AITaskResponseSchema(Schema):
    """Schema for AI task response"""

    task_id = fields.Str()
    agent_id = fields.Str()
    agent_name = fields.Str(allow_none=True)
    submitted_by = fields.Int(allow_none=True)
    task_type = fields.Str()
    task_name = fields.Str(allow_none=True)
    confidence_score = fields.Float(allow_none=True)
    is_sensitive_data = fields.Bool()
    mpc_used = fields.Bool()
    status = fields.Str()
    requires_approval = fields.Bool()
    blockchain_tx_hash = fields.Str(allow_none=True)
    created_at = fields.DateTime(allow_none=True)
    started_at = fields.DateTime(allow_none=True)
    completed_at = fields.DateTime(allow_none=True)
    error_message = fields.Str(allow_none=True)


class AITaskDetailResponseSchema(AITaskResponseSchema):
    """Schema for AI task detail response (includes result)"""

    result = fields.Raw(allow_none=True)


# ============================================================================
# Human Approval Schemas
# ============================================================================


class ApprovalActionSchema(Schema):
    """Schema for approval/rejection action"""

    justification = fields.Str(
        required=True, validate=validate.Length(min=10, max=1000)
    )
    modified_output = fields.Dict(required=False, allow_none=True)


class HumanApprovalResponseSchema(Schema):
    """Schema for human approval response"""

    approval_id = fields.Str()
    task_id = fields.Str()
    assigned_to = fields.Int()
    supervisor_name = fields.Str(allow_none=True)
    status = fields.Str()
    justification = fields.Str(allow_none=True)
    created_at = fields.DateTime(allow_none=True)
    approved_at = fields.DateTime(allow_none=True)
    blockchain_tx_hash = fields.Str(allow_none=True)
    sla_hours = fields.Int()
    is_overdue = fields.Bool()
    # Include original_output as task_output for frontend compatibility
    task_output = fields.Raw(allow_none=True)
    original_output = fields.Raw(allow_none=True)


class HumanApprovalDetailResponseSchema(HumanApprovalResponseSchema):
    """Schema for human approval detail (includes outputs)"""

    original_output = fields.Raw(allow_none=True)
    modified_output = fields.Raw(allow_none=True)


# ============================================================================
# Policy Schemas
# ============================================================================


class PolicyCreateSchema(Schema):
    """Schema for creating a new policy"""

    name = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    description = fields.Str(required=False, allow_none=True)
    rule_json = fields.Dict(required=True)
    enforcement_level = fields.Str(
        required=False,
        validate=validate.OneOf(["blocking", "warning", "logging"]),
        load_default="blocking",
    )
    applies_to = fields.Str(required=False, allow_none=True)
    active = fields.Bool(required=False, load_default=True)

    @validates("rule_json")
    def validate_rule_json(self, value):
        """Validate rule_json structure"""
        required_fields = ["condition", "action"]
        if not all(field in value for field in required_fields):
            raise ValidationError(
                f"rule_json must contain: {', '.join(required_fields)}"
            )


class PolicyUpdateSchema(Schema):
    """Schema for updating a policy"""

    name = fields.Str(required=False, validate=validate.Length(min=3, max=100))
    description = fields.Str(required=False, allow_none=True)
    rule_json = fields.Dict(required=False)
    enforcement_level = fields.Str(
        required=False, validate=validate.OneOf(["blocking", "warning", "logging"])
    )
    applies_to = fields.Str(required=False, allow_none=True)
    active = fields.Bool(required=False)


class PolicyResponseSchema(Schema):
    """Schema for policy response"""

    policy_id = fields.Str()
    name = fields.Str()
    description = fields.Str(allow_none=True)
    rule_json = fields.Dict()
    enforcement_level = fields.Str()
    applies_to = fields.Str(allow_none=True)
    active = fields.Bool()
    created_by = fields.Int(allow_none=True)
    created_at = fields.DateTime(allow_none=True)
    updated_at = fields.DateTime(allow_none=True)
    version = fields.Int()


# ============================================================================
# Approval Settings Schemas
# ============================================================================


class ApprovalSettingsUpdateSchema(Schema):
    """Schema for updating approval settings"""

    confidence_threshold = fields.Decimal(
        required=False,
        validate=validate.Range(min=0.0, max=1.0),
        places=2
    )
    high_risk_task_types = fields.List(
        fields.Str(),
        required=False
    )
    approval_sla_hours = fields.Int(
        required=False,
        validate=validate.Range(min=1, max=168)  # 1 hour to 1 week
    )
    auto_approve_high_confidence = fields.Bool(required=False)
    auto_approve_threshold = fields.Decimal(
        required=False,
        validate=validate.Range(min=0.0, max=1.0),
        places=2,
        allow_none=True
    )
    require_approval_for_sensitive_data = fields.Bool(required=False)


class ApprovalSettingsResponseSchema(Schema):
    """Schema for approval settings response"""

    settings_id = fields.Str()
    confidence_threshold = fields.Decimal(places=2)
    high_risk_task_types = fields.List(fields.Str())
    approval_sla_hours = fields.Int()
    auto_approve_high_confidence = fields.Bool()
    auto_approve_threshold = fields.Decimal(places=2, allow_none=True)
    require_approval_for_sensitive_data = fields.Bool()
    created_at = fields.DateTime(allow_none=True)
    updated_at = fields.DateTime(allow_none=True)


# ============================================================================
# Blockchain Audit Schemas
# ============================================================================


class BlockchainAuditResponseSchema(Schema):
    """Schema for blockchain audit response"""

    id = fields.Int()
    event_type = fields.Str()
    entity_id = fields.Str(allow_none=True)
    actor_id = fields.Int(allow_none=True)
    actor_name = fields.Str(allow_none=True)
    action = fields.Str(allow_none=True)
    data_hash = fields.Str(allow_none=True)
    blockchain_tx_hash = fields.Str()
    block_number = fields.Int(allow_none=True)
    timestamp = fields.DateTime(allow_none=True)


class BlockchainVerificationSchema(Schema):
    """Schema for blockchain verification request"""

    tx_hash = fields.Str(required=True, validate=validate.Length(equal=66))


# ============================================================================
# MPC Operation Schemas
# ============================================================================


class MPCOperationResponseSchema(Schema):
    """Schema for MPC operation response"""

    operation_id = fields.Str()
    task_id = fields.Str(allow_none=True)
    data_type = fields.Str(allow_none=True)
    num_shares = fields.Int()
    threshold = fields.Int()
    computation_type = fields.Str(allow_none=True)
    status = fields.Str()
    result_hash = fields.Str(allow_none=True)
    proof_hash = fields.Str(allow_none=True)
    created_at = fields.DateTime(allow_none=True)
    completed_at = fields.DateTime(allow_none=True)


# ============================================================================
# Compliance & Dashboard Schemas
# ============================================================================


class ComplianceReportRequestSchema(Schema):
    """Schema for compliance report request"""

    start_date = fields.DateTime(required=False, allow_none=True)
    end_date = fields.DateTime(required=False, allow_none=True)
    event_type = fields.Str(required=False, allow_none=True)
    report_format = fields.Str(
        required=False,
        validate=validate.OneOf(["json", "pdf", "excel"]),
        load_default="json",
    )


class DashboardStatsResponseSchema(Schema):
    """Schema for dashboard statistics"""

    total_agents = fields.Int()
    active_agents = fields.Int()
    total_tasks = fields.Int()
    tasks_today = fields.Int()
    pending_approvals = fields.Int()
    average_confidence = fields.Float()
    mpc_operations_count = fields.Int()
    blockchain_blocks = fields.Int()
    automation_rate = fields.Float()


# ============================================================================
# Generic Response Schemas
# ============================================================================


class SuccessResponseSchema(Schema):
    """Generic success response"""

    success = fields.Bool(default=True)
    message = fields.Str()
    data = fields.Raw(allow_none=True)


class ErrorResponseSchema(Schema):
    """Generic error response"""

    success = fields.Bool(default=False)
    error = fields.Str()
    details = fields.Raw(allow_none=True)


class PaginationSchema(Schema):
    """Pagination metadata"""

    page = fields.Int()
    per_page = fields.Int()
    total = fields.Int()
    pages = fields.Int()


class PaginatedResponseSchema(Schema):
    """Paginated response wrapper"""

    items = fields.List(fields.Raw())
    pagination = fields.Nested(PaginationSchema)
