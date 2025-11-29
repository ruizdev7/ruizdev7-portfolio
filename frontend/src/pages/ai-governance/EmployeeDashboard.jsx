/**
 * Employee/Auditor Dashboard
 * Limited access: Only agents and task execution
 */

import { Link } from "react-router-dom";
import {
  useGetDashboardStatsQuery,
  useGetAgentsQuery,
} from "../../RTK_Query_app/services/aiGovernance/aiGovernanceApi";
import {
  CpuChipIcon,
  ChartBarIcon,
  ArrowRightIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";

const EmployeeDashboard = () => {
  const { data: statsData, isLoading: statsLoading } =
    useGetDashboardStatsQuery();
  const { data: agentsData } = useGetAgentsQuery();

  const stats = statsData?.stats || {};
  const agents = agentsData?.agents || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-do_text_light dark:border-do_text_dark"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-do_text_light dark:text-do_text_dark">
            Panel de Empleado
          </h1>
          <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
            Consulta agentes disponibles y ejecuta tareas
          </p>
        </div>

        {/* Stats - Limited */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Agentes Disponibles"
            value={stats.active_agents}
            total={stats.total_agents}
            icon={<CpuChipIcon className="h-5 w-5" />}
          />
          <StatCard
            title="Tareas Totales"
            value={stats.total_tasks}
            icon={<ChartBarIcon className="h-5 w-5" />}
          />
          <StatCard
            title="Tareas Hoy"
            value={stats.tasks_today}
            icon={<PlayIcon className="h-5 w-5" />}
          />
        </div>

        {/* Navigation Cards - Only Agents and Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/ai-governance/agents"
            className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6 hover:border-do_text_light dark:hover:border-gray-500 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <CpuChipIcon className="h-6 w-6 text-do_text_light dark:text-do_text_dark" />
              <ArrowRightIcon className="h-4 w-4 text-do_text_gray_light dark:text-do_text_gray_dark" />
            </div>
            <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark mb-2">
              Agentes
            </h3>
            <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
              Consulta agentes de IA disponibles
            </p>
          </Link>

          <Link
            to="/ai-governance/tasks"
            className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6 hover:border-do_text_light dark:hover:border-gray-500 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="h-6 w-6 text-do_text_light dark:text-do_text_dark" />
              <ArrowRightIcon className="h-4 w-4 text-do_text_gray_light dark:text-do_text_gray_dark" />
            </div>
            <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark mb-2">
              Tareas
            </h3>
            <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
              Ejecuta y gestiona tareas de IA
            </p>
          </Link>
        </div>

        {/* Active Agents List */}
        <div className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg">
          <div className="p-6 border-b border-do_border_light dark:border-gray-700">
            <h2 className="text-xl font-medium text-do_text_light dark:text-do_text_dark">
              Agentes Disponibles ({agents.filter((a) => a.status === "active").length})
            </h2>
          </div>
          <div className="p-6">
            {agents.filter((a) => a.status === "active").length === 0 ? (
              <div className="text-center py-8">
                <CpuChipIcon className="h-12 w-12 text-do_text_gray_light dark:text-do_text_gray_dark mx-auto mb-4" />
                <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  No hay agentes activos disponibles
                </p>
              </div>
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

const AgentCard = ({ agent }) => {
  const typeColors = {
    financial: "text-green-600 dark:text-green-400",
    legal: "text-blue-600 dark:text-blue-400",
    hr: "text-purple-600 dark:text-purple-400",
    general: "text-do_text_gray_light dark:text-do_text_gray_dark",
  };

  return (
    <div className="border border-do_border_light dark:border-gray-700 rounded-lg p-4 bg-do_bg_light dark:bg-do_bg_dark hover:border-do_text_light dark:hover:border-gray-500 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-do_text_light dark:text-do_text_dark mb-1">
            {agent.name}
          </h4>
          <span
            className={`text-xs font-medium ${typeColors[agent.agent_type] || typeColors.general}`}
          >
            {agent.agent_type}
          </span>
        </div>
        <CpuChipIcon className="h-5 w-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
      </div>
      <div className="space-y-1 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
        <div className="flex justify-between">
          <span>Modelo:</span>
          <span className="font-medium text-do_text_light dark:text-do_text_dark">
            {agent.model_name}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Umbral:</span>
          <span className="font-medium text-do_text_light dark:text-do_text_dark">
            {(agent.confidence_threshold * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <Link
        to="/ai-governance/tasks"
        className="mt-3 block w-full text-center py-2 px-3 border border-do_border_light dark:border-gray-700 text-do_text_light dark:text-do_text_dark rounded text-sm font-medium hover:bg-do_card_light dark:hover:bg-do_card_dark transition-colors"
      >
        Ejecutar Tarea
      </Link>
    </div>
  );
};

export default EmployeeDashboard;
