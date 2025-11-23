/**
 * AI Tasks Management - CRUD Component
 * Create, Read, and Execute AI Tasks
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetTasksQuery,
  useExecuteTaskMutation,
  useGetAgentsQuery,
} from "../../RTK_Query_app/services/aiGovernance/aiGovernanceApi";
import {
  PlusIcon,
  PlayIcon,
  EyeIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const TasksManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useGetTasksQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const { data: agentsData } = useGetAgentsQuery();
  const [executeTask, { isLoading: executing }] = useExecuteTaskMutation();

  const tasks = tasksData?.tasks || [];
  const agents = agentsData?.agents || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      agent_id: "",
      task_type: "general",
      task_name: "",
      input_data: '{"example": "value"}',
    },
  });

  const openCreateModal = () => {
    reset({
      agent_id: "",
      task_type: "general",
      task_name: "",
      input_data: '{"example": "value"}',
    });
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    reset();
  };

  const openDetailModal = async (taskId) => {
    try {
      const task = tasks.find((t) => t.task_id === taskId);
      setSelectedTask(task);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error("Error al cargar los detalles de la tarea");
    }
  };

  const onSubmit = async (data) => {
    try {
      let inputData;
      try {
        const parsed = JSON.parse(data.input_data);
        // Validar que no esté vacío
        if (
          !parsed ||
          (typeof parsed === "object" && Object.keys(parsed).length === 0)
        ) {
          toast.error(
            "El input_data no puede estar vacío. Proporciona al menos un campo."
          );
          return;
        }
        inputData = parsed;
      } catch (parseError) {
        // Si no es JSON válido, crear un objeto con el valor raw
        if (
          !data.input_data ||
          data.input_data.trim() === "" ||
          data.input_data.trim() === "{}"
        ) {
          toast.error(
            "El input_data no puede estar vacío. Proporciona datos válidos en formato JSON."
          );
          return;
        }
        inputData = { raw: data.input_data };
      }

      const result = await executeTask({
        agent_id: data.agent_id,
        task_type: data.task_type,
        task_name: data.task_name,
        input_data: inputData,
      }).unwrap();

      if (result.success) {
        toast.success("Tarea ejecutada exitosamente");
        closeCreateModal();
        refetch();
      } else {
        toast.error(result.error || "Error al ejecutar la tarea");
      }
    } catch (error) {
      toast.error(error?.data?.error || "Error al ejecutar la tarea");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
      awaiting_approval:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
      approved:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
      rejected:
        "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800",
      failed:
        "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800",
    };
    return (
      badges[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
    );
  };

  const getStatusIcon = (status) => {
    if (status === "completed" || status === "approved") {
      return <CheckCircleIcon className="h-5 w-5" />;
    }
    if (status === "rejected" || status === "failed") {
      return <XCircleIcon className="h-5 w-5" />;
    }
    return <ClockIcon className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">
            Error al cargar tareas: {error?.data?.error || error?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/ai-governance"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver al Dashboard</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Tasks Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Ejecuta y gestiona tareas de IA
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md dark:shadow-gray-900/50"
            >
              <PlusIcon className="h-5 w-5" />
              Ejecutar Tarea
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "all"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "pending"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setStatusFilter("awaiting_approval")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "awaiting_approval"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Esperando Aprobación
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "completed"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Completadas
          </button>
        </div>

        {/* Tasks Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tarea
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No hay tareas. Ejecuta una para comenzar.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task.task_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.task_name || `Task ${task.task_id.slice(0, 8)}`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {task.task_id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {agents.find((a) => a.agent_id === task.agent_id)
                          ?.name || task.agent_id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {task.task_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getStatusBadge(
                            task.status
                          )}`}
                        >
                          {getStatusIcon(task.status)}
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(task.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDetailModal(task.task_id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Ver Detalles"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Task Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Ejecutar Nueva Tarea
                </h2>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agent *
                  </label>
                  <select
                    {...register("agent_id", {
                      required: "El agent es requerido",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <option value="">Selecciona un agent</option>
                    {agents
                      .filter((a) => a.status === "active")
                      .map((agent) => (
                        <option key={agent.agent_id} value={agent.agent_id}>
                          {agent.name} ({agent.agent_type})
                        </option>
                      ))}
                  </select>
                  {errors.agent_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.agent_id.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Tarea *
                    </label>
                    <select
                      {...register("task_type", {
                        required: "El tipo es requerido",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      <option value="financial_analysis">
                        Financial Analysis
                      </option>
                      <option value="text_classification">
                        Text Classification
                      </option>
                      <option value="data_extraction">Data Extraction</option>
                      <option value="sentiment_analysis">
                        Sentiment Analysis
                      </option>
                      <option value="summarization">Summarization</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre de la Tarea
                    </label>
                    <input
                      {...register("task_name")}
                      type="text"
                      placeholder="Opcional"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Input Data (JSON) *
                  </label>
                  <textarea
                    {...register("input_data", {
                      required: "Los datos de entrada son requeridos",
                      validate: (value) => {
                        if (
                          !value ||
                          value.trim() === "" ||
                          value.trim() === "{}"
                        ) {
                          return "El input_data no puede estar vacío";
                        }
                        try {
                          const parsed = JSON.parse(value);
                          if (
                            !parsed ||
                            (typeof parsed === "object" &&
                              Object.keys(parsed).length === 0)
                          ) {
                            return "El JSON no puede estar vacío. Proporciona al menos un campo.";
                          }
                          return true;
                        } catch {
                          return "Debe ser un JSON válido";
                        }
                      },
                    })}
                    rows="6"
                    placeholder='{"revenue": 1000000, "expenses": 750000}'
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 font-mono text-sm"
                  />
                  {errors.input_data && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.input_data.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Ejemplo: {`{"revenue": 1000000, "expenses": 750000}`}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={executing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlayIcon className="h-5 w-5" />
                    {executing ? "Ejecutando..." : "Ejecutar Tarea"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task Detail Modal */}
        {isDetailModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Detalles de la Tarea
                </h2>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedTask(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {selectedTask.task_id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getStatusBadge(
                        selectedTask.status
                      )}`}
                    >
                      {getStatusIcon(selectedTask.status)}
                      {selectedTask.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedTask.task_type}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confidence
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedTask.confidence_score
                        ? `${(selectedTask.confidence_score * 100).toFixed(1)}%`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {selectedTask.input_data && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Input Data
                    </label>
                    <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white overflow-x-auto border border-gray-200 dark:border-gray-700">
                      {JSON.stringify(selectedTask.input_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedTask.output_data && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Output Data
                    </label>
                    <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white overflow-x-auto border border-gray-200 dark:border-gray-700">
                      {JSON.stringify(selectedTask.output_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedTask.error_message && (
                  <div>
                    <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                      Error
                    </label>
                    <p className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
                      {selectedTask.error_message}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Creado
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedTask.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedTask.completed_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Completado
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedTask.completed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksManagement;
