/**
 * AI Governance Dashboard
 * Main dashboard showing stats, agents, tasks, and approvals
 * Navigation hub for all AI Governance features
 */

import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetDashboardStatsQuery,
  useGetAgentsQuery,
  useGetApprovalsQuery,
  useApproveTaskMutation,
  useRejectTaskMutation,
} from "../../RTK_Query_app/services/aiGovernance/aiGovernanceApi";
import {
  ChartBarIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import AIOutputFormatter from "../../components/AIOutputFormatter";

const AIGovernanceDashboard = () => {
  const navigate = useNavigate();
  const { data: statsData, isLoading: statsLoading } =
    useGetDashboardStatsQuery();
  const { data: agentsData } = useGetAgentsQuery();
  const { data: approvalsData, refetch: refetchApprovals } = useGetApprovalsQuery({
    assigned_only: true,
    status: "pending",
  });
  const [approveTask] = useApproveTaskMutation();
  const [rejectTask] = useRejectTaskMutation();

  const stats = statsData?.stats || {};
  const agents = agentsData?.agents || [];
  const myApprovals = approvalsData?.approvals || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark">
            AI Governance Platform
          </h1>
          <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
            Automated AI with Human Oversight + MPC Privacy + Blockchain Audit
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Link
            to="/ai-governance/agents"
            className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-2">
                  Agents
                </h3>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  Gestiona tus agentes de IA
                </p>
              </div>
              <CpuChipIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
              Ver más <ArrowRightIcon className="h-4 w-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/ai-governance/tasks"
            className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-2">
                  Tasks
                </h3>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  Ejecuta y gestiona tareas
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
              Ver más <ArrowRightIcon className="h-4 w-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/ai-governance/approvals"
            className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-2">
                  Approvals
                </h3>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  Revisa y aprueba tareas
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4 flex items-center text-yellow-600 dark:text-yellow-400 text-sm font-medium">
              Ver más <ArrowRightIcon className="h-4 w-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/ai-governance/policies"
            className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-2">
                  Policies
                </h3>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  Define políticas de gobernanza
                </p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
              Ver más <ArrowRightIcon className="h-4 w-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/ai-governance/approval-settings"
            className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-2">
                  Configuración
                </h3>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  Ajusta parámetros de aprobación
                </p>
              </div>
              <Cog6ToothIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4 flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
              Ver más <ArrowRightIcon className="h-4 w-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/ai-governance/blockchain"
            className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-2">
                  Blockchain Audit
                </h3>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  Consulta el registro inmutable
                </p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
              Ver más <ArrowRightIcon className="h-4 w-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active AI Agents"
            value={stats.active_agents}
            total={stats.total_agents}
            icon={<CpuChipIcon className="h-6 w-6 text-blue-600" />}
            color="blue"
          />
          <StatCard
            title="Tasks Today"
            value={stats.tasks_today}
            subtitle={`Total: ${stats.total_tasks}`}
            icon={<ChartBarIcon className="h-6 w-6 text-green-600" />}
            color="green"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pending_approvals}
            subtitle={`Assigned to you: ${myApprovals.length}`}
            icon={<ClockIcon className="h-6 w-6 text-yellow-600" />}
            color="yellow"
            highlight={stats.pending_approvals > 0}
          />
          <StatCard
            title="Automation Rate"
            value={`${stats.automation_rate}%`}
            subtitle={`Avg confidence: ${(
              stats.average_confidence * 100
            ).toFixed(1)}%`}
            icon={<ShieldCheckIcon className="h-6 w-6 text-purple-600" />}
            color="purple"
          />
        </div>

        {/* MPC & Blockchain Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-do_border_light dark:border-none">
            <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4">
              🔒 MPC Operations
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  Total Operations:
                </span>
                <span className="font-semibold text-do_text_light dark:text-do_text_dark">
                  {stats.mpc_operations_count || 0}
                </span>
              </div>
              <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark mt-2">
                Sensitive data processed securely using Multi-Party Computation
              </p>
            </div>
          </div>

          <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-do_border_light dark:border-none">
            <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4">
              ⛓️ Blockchain Audit
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  Total Blocks:
                </span>
                <span className="font-semibold text-do_text_light dark:text-do_text_dark">
                  {stats.blockchain_blocks || 0}
                </span>
              </div>
              <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark mt-2">
                All decisions immutably recorded on blockchain
              </p>
            </div>
          </div>
        </div>

        {/* Active Agents */}
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none mb-8">
          <div className="p-6 border-b border-do_border_light dark:border-gray-700">
            <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
              Active AI Agents
            </h2>
          </div>
          <div className="p-6">
            {agents.length === 0 ? (
              <p className="text-do_text_gray_light dark:text-do_text_gray_dark text-center py-8">
                No AI agents configured yet
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents
                  .filter((a) => a.status === "active")
                  .map((agent) => (
                    <AgentCard key={agent.agent_id} agent={agent} />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* My Pending Approvals */}
        {myApprovals.length > 0 && (
          <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none">
            <div className="p-6 border-b border-do_border_light dark:border-gray-700">
              <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
                My Pending Approvals ({myApprovals.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {myApprovals.slice(0, 5).map((approval) => (
                  <ApprovalCard
                    key={approval.approval_id}
                    approval={approval}
                    onApprove={async (data) => {
                      await approveTask(data).unwrap();
                      refetchApprovals();
                    }}
                    onReject={async (data) => {
                      await rejectTask(data).unwrap();
                      refetchApprovals();
                    }}
                  />
                ))}
              </div>
              {myApprovals.length > 5 && (
                <div className="mt-4 text-center">
                  <Link
                    to="/ai-governance/approvals"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    View All {myApprovals.length} Approvals →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

const StatCard = ({
  title,
  value,
  subtitle,
  total,
  icon,
  color,
  highlight,
}) => {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg ${
        highlight ? "ring-2 ring-yellow-500 dark:ring-yellow-400" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </h3>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {value}
          {total && (
            <span className="text-lg text-gray-500 dark:text-gray-400">
              /{total}
            </span>
          )}
        </p>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const AgentCard = ({ agent }) => {
  const typeColors = {
    financial:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800",
    legal:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    hr: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
    general:
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600",
  };

  return (
    <div className="border border-do_border_light dark:border-gray-700 rounded-lg p-4 bg-do_card_light dark:bg-do_card_dark hover:shadow-md dark:hover:shadow-gray-900/50 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-do_text_light dark:text-do_text_dark">
            {agent.name}
          </h4>
          <span
            className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
              typeColors[agent.agent_type] || typeColors.general
            }`}
          >
            {agent.agent_type}
          </span>
        </div>
        <CpuChipIcon className="h-5 w-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
      </div>
      <div className="mt-3 space-y-1 text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
        <div className="flex justify-between">
          <span>Model:</span>
          <span className="font-medium text-do_text_light dark:text-do_text_dark">
            {agent.model_name}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Threshold:</span>
          <span className="font-medium text-do_text_light dark:text-do_text_dark">
            {(agent.confidence_threshold * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tasks:</span>
          <span className="font-medium text-do_text_light dark:text-do_text_dark">
            {agent.total_tasks || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

const ApprovalCard = ({ approval, onApprove, onReject }) => {
  const isOverdue = approval.is_overdue;

  const handleApprove = async () => {
    if (window.confirm("¿Estás seguro de que deseas aprobar esta tarea?")) {
      try {
        await onApprove({
          approvalId: approval.approval_id,
          justification: "Aprobado desde el dashboard",
          modifiedOutput: null,
        });
        toast.success("Tarea aprobada exitosamente");
      } catch (error) {
        toast.error(
          error?.data?.error || "Error al aprobar la tarea"
        );
      }
    }
  };

  const handleReject = async () => {
    const justification = window.prompt(
      "Por favor, proporciona una justificación para rechazar esta tarea:"
    );
    if (justification && justification.trim().length >= 10) {
      try {
        await onReject({
          approvalId: approval.approval_id,
          justification: justification.trim(),
        });
        toast.success("Tarea rechazada exitosamente");
      } catch (error) {
        toast.error(
          error?.data?.error || "Error al rechazar la tarea"
        );
      }
    } else if (justification !== null) {
      toast.error("La justificación debe tener al menos 10 caracteres");
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isOverdue
          ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700/50"
          : "border-do_border_light dark:border-gray-700 bg-do_card_light dark:bg-do_card_dark"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-do_text_light dark:text-do_text_dark">
              Task #{approval.task_id?.slice(0, 8) || "N/A"}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 text-xs font-medium rounded border border-red-200 dark:border-red-800">
                OVERDUE
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            Created{" "}
            {approval.created_at
              ? new Date(approval.created_at).toLocaleString()
              : "N/A"}
          </p>
          {approval.task_output && (
            <div className="mt-2">
              <AIOutputFormatter
                output={approval.task_output}
                maxHeight="max-h-20"
                showCopyButton={false}
                collapsible={true}
                defaultCollapsed={true}
              />
            </div>
          )}
        </div>
        <ClockIcon className="h-5 w-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleApprove}
          className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-sm font-medium transition-colors"
        >
          <CheckCircleIcon className="inline h-4 w-4 mr-1" />
          Approve
        </button>
        <button
          onClick={handleReject}
          className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-sm font-medium transition-colors"
        >
          <XCircleIcon className="inline h-4 w-4 mr-1" />
          Reject
        </button>
        <Link
          to="/ai-governance/approvals"
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-do_text_light dark:text-do_text_dark rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
          title="Ver detalles"
        >
          Ver
        </Link>
      </div>
    </div>
  );
};

export default AIGovernanceDashboard;
