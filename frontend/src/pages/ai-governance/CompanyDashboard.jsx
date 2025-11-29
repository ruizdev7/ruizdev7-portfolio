/**
 * Company Dashboard
 * Full access dashboard with neural network visualization and blockchain
 * Focused on AI policies by department
 */

import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  useGetDashboardStatsQuery,
  useGetAgentsQuery,
  useGetTasksQuery,
  useGetApprovalsQuery,
  useGetBlockchainAuditQuery,
  useGetPoliciesQuery,
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
  PlusIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import AIOutputFormatter from "../../components/AIOutputFormatter";
import NeuralNetworkVisualization from "../../components/ai-governance/NeuralNetworkVisualization";
import BlockchainVisualization from "../../components/ai-governance/BlockchainVisualization";
import { toast } from "react-toastify";

const CompanyDashboard = () => {
  const [selectedView, setSelectedView] = useState("overview"); // 'overview', 'neural', 'blockchain'
  const [selectedDepartment, setSelectedDepartment] = useState(
    "Finanzas y Contabilidad"
  );

  const { data: statsData, isLoading: statsLoading } =
    useGetDashboardStatsQuery();
  const { data: agentsData } = useGetAgentsQuery();
  const { data: tasksData } = useGetTasksQuery({});
  const { data: approvalsData, refetch: refetchApprovals } =
    useGetApprovalsQuery({
      assigned_only: false,
      status: "pending",
    });
  const { data: blockchainData } = useGetBlockchainAuditQuery({
    limit: 50,
  });
  const { data: policiesData } = useGetPoliciesQuery();
  const [approveTask] = useApproveTaskMutation();
  const [rejectTask] = useRejectTaskMutation();

  const stats = statsData?.stats || {};
  const agents = agentsData?.agents || [];
  const tasks = tasksData?.tasks || [];
  const approvals = approvalsData?.approvals || [];
  const blockchainBlocks = blockchainData?.audit_trail || [];
  const policies = policiesData?.policies || [];

  const departmentSummaries = useMemo(() => {
    const deptNames = [
      "Dirección General",
      "Finanzas y Contabilidad",
      "Compras y Proveedores",
      "Operaciones y Producción",
      "Tecnología (IT)",
      "Calidad y Auditoría",
      "Otros",
    ];

    return deptNames.map((name) => {
      const deptPolicies = policies.filter((p) => p.applies_to === name);
      const total = deptPolicies.length;
      const blocking = deptPolicies.filter(
        (p) => p.enforcement_level === "blocking"
      ).length;
      const warning = deptPolicies.filter(
        (p) => p.enforcement_level === "warning"
      ).length;
      const logging = deptPolicies.filter(
        (p) => p.enforcement_level === "logging"
      ).length;
      return { name, total, blocking, warning, logging };
    });
  }, [policies]);

  const selectedSummary = departmentSummaries.find(
    (d) => d.name === selectedDepartment
  ) ||
    departmentSummaries[0] || {
      name: selectedDepartment,
      total: 0,
      blocking: 0,
      warning: 0,
      logging: 0,
    };

  const totalPolicies = policies.length;
  const totalBlocking = policies.filter(
    (p) => p.enforcement_level === "blocking"
  ).length;
  const totalWarning = policies.filter(
    (p) => p.enforcement_level === "warning"
  ).length;
  const totalLogging = policies.filter(
    (p) => p.enforcement_level === "logging"
  ).length;

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-do_text_light dark:border-do_text_dark"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-do_text_light dark:text-do_text_dark">
                Panel de Políticas de IA
              </h1>
              <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
                Diseña y gobierna las políticas de IA para todos los
                departamentos de la compañía
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BuildingOfficeIcon className="h-6 w-6 text-do_text_light dark:text-do_text_dark" />
              <span className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                Enfoque: Gobernanza por Departamento
              </span>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-8 border-b border-do_border_light dark:border-gray-700">
          <button
            onClick={() => setSelectedView("overview")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedView === "overview"
                ? "text-do_text_light dark:text-do_text_dark border-b-2 border-do_text_light dark:border-do_text_dark"
                : "text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setSelectedView("neural")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedView === "neural"
                ? "text-do_text_light dark:text-do_text_dark border-b-2 border-do_text_light dark:border-do_text_dark"
                : "text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
            }`}
          >
            Red Neuronal
          </button>
          <button
            onClick={() => setSelectedView("blockchain")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedView === "blockchain"
                ? "text-do_text_light dark:text-do_text_dark border-b-2 border-do_text_light dark:border-do_text_dark"
                : "text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
            }`}
          >
            Blockchain
          </button>
        </div>

        {/* Overview View */}
        {selectedView === "overview" && (
          <>
            {/* Quick Actions - Políticas al centro */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link
                to="/ai-governance/policies"
                className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-4 hover:border-do_text_light dark:hover:border-gray-500 transition-all flex items-center gap-3"
              >
                <PlusIcon className="h-5 w-5 text-do_text_light dark:text-do_text_dark" />
                <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark">
                  Nueva Política por Departamento
                </span>
              </Link>
              <Link
                to="/ai-governance/approval-settings"
                className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-4 hover:border-do_text_light dark:hover:border-gray-500 transition-all flex items-center gap-3"
              >
                <Cog6ToothIcon className="h-5 w-5 text-do_text_light dark:text-do_text_dark" />
                <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark">
                  Reglas Globales de Aprobación
                </span>
              </Link>
              <Link
                to="/ai-governance/agents"
                className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-4 hover:border-do_text_light dark:hover:border-gray-500 transition-all flex items-center gap-3"
              >
                <CpuChipIcon className="h-5 w-5 text-do_text_light dark:text-do_text_dark" />
                <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark">
                  Agentes por Área
                </span>
              </Link>
              <Link
                to="/ai-governance/tasks"
                className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-4 hover:border-do_text_light dark:hover:border-gray-500 transition-all flex items-center gap-3"
              >
                <ChartBarIcon className="h-5 w-5 text-do_text_light dark:text-do_text_dark" />
                <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark">
                  Tareas Operativas
                </span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Agentes Activos"
                value={stats.active_agents}
                total={stats.total_agents}
                icon={<CpuChipIcon className="h-5 w-5" />}
              />
              <StatCard
                title="Tareas Hoy"
                value={stats.tasks_today}
                subtitle={`Total: ${stats.total_tasks}`}
                icon={<ChartBarIcon className="h-5 w-5" />}
              />
              <StatCard
                title="Aprobaciones Pendientes"
                value={stats.pending_approvals}
                icon={<ClockIcon className="h-5 w-5" />}
                highlight={stats.pending_approvals > 0}
              />
              <StatCard
                title="Tasa Automatización"
                value={`${stats.automation_rate}%`}
                subtitle={`Confianza: ${(
                  stats.average_confidence * 100
                ).toFixed(1)}%`}
                icon={<ShieldCheckIcon className="h-5 w-5" />}
              />
            </div>

            {/* Mapa de Políticas por Área */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              {/* Áreas (nodos alrededor del core) */}
              <div className="lg:col-span-2 bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-4">
                <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark mb-3">
                  Selecciona un área para ver su estado de políticas de IA.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {departmentSummaries.map((dept) => (
                    <button
                      key={dept.name}
                      type="button"
                      onClick={() => setSelectedDepartment(dept.name)}
                      className={`flex flex-col items-start justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                        selectedDepartment === dept.name
                          ? "border-do_text_light dark:border-do_text_dark bg-do_bg_light dark:bg-do_bg_dark"
                          : "border-do_border_light dark:border-gray-700 hover:border-do_text_light dark:hover:border-do_text_dark"
                      }`}
                    >
                      <span className="text-xs font-medium text-do_text_light dark:text-do_text_dark">
                        {dept.name}
                      </span>
                      <span className="text-[11px] text-do_text_gray_light dark:text-do_text_gray_dark">
                        {dept.total} políticas
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Core central: resumen total y del área seleccionada */}
              <div className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
                    Resumen Global de Políticas
                  </h3>
                  <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark mb-3">
                    Núcleo de gobernanza de IA para toda la compañía.
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                        Total políticas
                      </span>
                      <span className="text-do_text_light dark:text-do_text_dark">
                        {totalPolicies}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                        Blocking
                      </span>
                      <span className="text-do_text_light dark:text-do_text_dark">
                        {totalBlocking}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                        Warning
                      </span>
                      <span className="text-do_text_light dark:text-do_text_dark">
                        {totalWarning}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                        Logging
                      </span>
                      <span className="text-do_text_light dark:text-do_text_dark">
                        {totalLogging}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-do_border_light dark:border-gray-700 pt-4">
                    <h4 className="text-xs font-medium text-do_text_light dark:text-do_text_dark mb-1">
                      Área seleccionada
                    </h4>
                    <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark mb-2">
                      {selectedSummary.name}
                    </p>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          Políticas
                        </span>
                        <span className="text-do_text_light dark:text-do_text_dark">
                          {selectedSummary.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          Blocking / Warning / Logging
                        </span>
                        <span className="text-do_text_light dark:text-do_text_dark">
                          {selectedSummary.blocking} / {selectedSummary.warning}{" "}
                          / {selectedSummary.logging}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/ai-governance/policies?applies_to=${encodeURIComponent(
                      selectedSummary.name
                    )}`}
                    className="inline-flex items-center text-xs text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
                  >
                    Configurar políticas de {selectedSummary.name}
                    <ArrowRightIcon className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Pending Approvals */}
            {approvals.length > 0 && (
              <div className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg mb-8">
                <div className="p-6 border-b border-do_border_light dark:border-gray-700">
                  <h2 className="text-xl font-medium text-do_text_light dark:text-do_text_dark">
                    Aprobaciones Pendientes ({approvals.length})
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {approvals.slice(0, 5).map((approval) => (
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
                  {approvals.length > 5 && (
                    <div className="mt-4 text-center">
                      <Link
                        to="/ai-governance/approvals"
                        className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
                      >
                        Ver todas ({approvals.length}) →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Neural Network View */}
        {selectedView === "neural" && (
          <div className="mb-8">
            <NeuralNetworkVisualization tasks={tasks} agents={agents} />
          </div>
        )}

        {/* Blockchain View */}
        {selectedView === "blockchain" && (
          <div className="mb-8">
            <BlockchainVisualization blocks={blockchainBlocks} />
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, total, icon, highlight }) => {
  return (
    <div
      className={`bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6 ${
        highlight ? "border-yellow-500 dark:border-yellow-400" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-do_text_gray_light dark:text-do_text_gray_dark">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark mb-1">
          {title}
        </p>
        <p className="text-2xl font-light text-do_text_light dark:text-do_text_dark">
          {value}
          {total && (
            <span className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark ml-1">
              /{total}
            </span>
          )}
        </p>
        {subtitle && (
          <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const ApprovalCard = ({ approval, onApprove, onReject }) => {
  const isOverdue = approval.is_overdue;

  const handleApprove = async () => {
    if (window.confirm("¿Aprobar esta tarea?")) {
      try {
        await onApprove({
          approvalId: approval.approval_id,
          justification: "Aprobado desde dashboard",
          modifiedOutput: null,
        });
        toast.success("Tarea aprobada");
      } catch (error) {
        toast.error(error?.data?.error || "Error al aprobar");
      }
    }
  };

  const handleReject = async () => {
    const justification = window.prompt("Justificación para rechazar:");
    if (justification && justification.trim().length >= 10) {
      try {
        await onReject({
          approvalId: approval.approval_id,
          justification: justification.trim(),
        });
        toast.success("Tarea rechazada");
      } catch (error) {
        toast.error(error?.data?.error || "Error al rechazar");
      }
    } else if (justification !== null) {
      toast.error("La justificación debe tener al menos 10 caracteres");
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 ${
        isOverdue
          ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
          : "border-do_border_light dark:border-gray-700 bg-do_bg_light dark:bg-do_bg_dark"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark">
              Task #{approval.task_id?.slice(0, 8)}
            </span>
            {isOverdue && (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 text-xs rounded">
                OVERDUE
              </span>
            )}
          </div>
          <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
            {new Date(approval.created_at).toLocaleString()}
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
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          className="flex-1 px-3 py-2 bg-do_bg_light dark:bg-do_bg_dark border border-do_border_light dark:border-gray-700 text-do_text_light dark:text-do_text_dark rounded text-sm font-medium hover:bg-do_card_light dark:hover:bg-do_card_dark transition-colors"
        >
          <CheckCircleIcon className="h-4 w-4 inline mr-1" />
          Aprobar
        </button>
        <button
          onClick={handleReject}
          className="flex-1 px-3 py-2 bg-do_bg_light dark:bg-do_bg_dark border border-do_border_light dark:border-gray-700 text-do_text_light dark:text-do_text_dark rounded text-sm font-medium hover:bg-do_card_light dark:hover:bg-do_card_dark transition-colors"
        >
          <XCircleIcon className="h-4 w-4 inline mr-1" />
          Rechazar
        </button>
        <Link
          to="/ai-governance/approvals"
          className="px-3 py-2 bg-do_bg_light dark:bg-do_bg_dark border border-do_border_light dark:border-gray-700 text-do_text_light dark:text-do_text_dark rounded text-sm font-medium hover:bg-do_card_light dark:hover:bg-do_card_dark transition-colors"
        >
          Ver
        </Link>
      </div>
    </div>
  );
};

export default CompanyDashboard;
