/**
 * AI Tasks Management - CRUD Component
 * Create, Read, and Execute AI Tasks
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useGetTasksQuery,
  useExecuteTaskMutation,
  useExecuteTaskStreamMutation,
  useGetAgentsQuery,
  useMarkTaskFailedMutation,
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
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import AIOutputFormatter from "../../components/AIOutputFormatter";

const TasksManagement = () => {
  const { t } = useLanguage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingTaskId, setStreamingTaskId] = useState(null);

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
  const [executeTaskStream] = useExecuteTaskStreamMutation();
  const [markTaskFailed] = useMarkTaskFailedMutation();

  const tasks = useMemo(() => tasksData?.tasks || [], [tasksData?.tasks]);
  const agents = agentsData?.agents || [];

  // Polling automático para tareas en ejecución (solo cuando hay tareas activas)
  useEffect(() => {
    const hasProcessingTasks = tasks.some(
      (task) => task.status === "processing" || task.status === "pending"
    );

    if (hasProcessingTasks) {
      const interval = setInterval(() => {
        refetch();
      }, 3000); // Actualizar cada 3 segundos (reducido de 2 para menos carga)

      return () => clearInterval(interval);
    }
  }, [tasks, refetch]);

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

  const handleMarkAsFailed = async (taskId) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas marcar esta tarea como fallida?"
      )
    ) {
      return;
    }

    try {
      await markTaskFailed(taskId).unwrap();
      toast.success("Tarea marcada como fallida");
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.error || "Error al marcar la tarea como fallida"
      );
    }
  };

  // Check if task is stuck (processing for more than 5 minutes)
  const isTaskStuck = (task) => {
    if (task.status !== "processing" && task.status !== "pending") return false;
    const createdAt = new Date(task.created_at);
    const now = new Date();
    const minutesElapsed = (now - createdAt) / (1000 * 60);
    return minutesElapsed > 5; // More than 5 minutes
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

      // Use streaming by default (can add a checkbox later to toggle)
      const useStreaming = true; // eslint-disable-line no-constant-condition

      if (useStreaming) {
        // Use streaming
        setIsStreaming(true);
        setStreamingResponse("");
        closeCreateModal();

        try {
          const streamResult = await executeTaskStream({
            agent_id: data.agent_id,
            task_type: data.task_type,
            task_name: data.task_name,
            input_data: inputData,
          }).unwrap();

          const reader = streamResult.reader;
          const decoder = streamResult.decoder;
          let buffer = "";
          let isDone = false;

          while (!isDone) {
            const { done, value } = await reader.read();
            if (done) {
              isDone = true;
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const eventData = JSON.parse(line.slice(6));

                  if (eventData.type === "task_id") {
                    setStreamingTaskId(eventData.task_id);
                  } else if (eventData.type === "chunk") {
                    setStreamingResponse((prev) => prev + eventData.content);
                  } else if (eventData.type === "status") {
                    // Update status message
                    toast.info(eventData.message, { autoClose: 2000 });
                  } else if (eventData.type === "complete") {
                    setIsStreaming(false);
                    toast.success(t("tasks.executed"));
                    refetch();
                    // Close streaming modal after a delay
                    setTimeout(() => {
                      setStreamingResponse("");
                      setStreamingTaskId(null);
                    }, 3000);
                  } else if (eventData.type === "error") {
                    setIsStreaming(false);
                    toast.error(eventData.error || t("tasks.error"));
                  }
                } catch (e) {
                  console.error("Error parsing SSE data:", e);
                }
              }
            }
          }
        } catch (error) {
          setIsStreaming(false);
          toast.error(error?.data?.error || t("tasks.error"));
        }
      } else {
        // Use non-streaming (original behavior)
        const result = await executeTask({
          agent_id: data.agent_id,
          task_type: data.task_type,
          task_name: data.task_name,
          input_data: inputData,
        }).unwrap();

        if (result.success) {
          toast.success(t("tasks.executed"));
          closeCreateModal();
          refetch();
        } else {
          toast.error(result.error || t("tasks.error"));
        }
      }
    } catch (error) {
      setIsStreaming(false);
      toast.error(error?.data?.error || t("tasks.error"));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
      processing:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse",
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
    if (status === "processing") {
      return (
        <div className="relative h-5 w-5">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      );
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
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/ai-governance"
            className="inline-flex items-center gap-2 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>{t("common.back")}</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark">
                {t("tasks.title")}
              </h1>
              <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
                {t("tasks.subtitle")}
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md dark:shadow-gray-900/50"
            >
              <PlusIcon className="h-5 w-5" />
              {t("tasks.execute")}
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
                : "bg-do_card_light dark:bg-do_card_dark text-gray-700 dark:text-gray-300 border-do_border_light dark:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "pending"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-do_card_light dark:bg-do_card_dark text-gray-700 dark:text-gray-300 border-do_border_light dark:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "processing"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-do_card_light dark:bg-do_card_dark text-gray-700 dark:text-gray-300 border-do_border_light dark:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            En Ejecución
          </button>
          <button
            onClick={() => setStatusFilter("awaiting_approval")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "awaiting_approval"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-do_card_light dark:bg-do_card_dark text-gray-700 dark:text-gray-300 border-do_border_light dark:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Esperando Aprobación
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "completed"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-do_card_light dark:bg-do_card_dark text-gray-700 dark:text-gray-300 border-do_border_light dark:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Completadas
          </button>
        </div>

        {/* Tasks Table */}
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-do_card_light dark:bg-do_card_dark">
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
              <tbody className="bg-do_card_light dark:bg-do_card_dark divide-y divide-gray-200 dark:divide-gray-700">
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
                      className="hover:bg-do_bg_light dark:hover:bg-do_bg_dark transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-do_text_light dark:text-do_text_dark">
                          {task.task_name || `Task ${task.task_id.slice(0, 8)}`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {task.task_id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-do_text_light dark:text-do_text_dark">
                        {agents.find((a) => a.agent_id === task.agent_id)
                          ?.name || task.agent_id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-do_text_light dark:text-do_text_dark">
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetailModal(task.task_id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Ver Detalles"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {isTaskStuck(task) && (
                            <button
                              onClick={() => handleMarkAsFailed(task.task_id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Marcar como fallida (tarea colgada)"
                            >
                              <ExclamationTriangleIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
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
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl dark:shadow-gray-900/50 border border-do_border_light dark:border-none max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-do_card_light dark:bg-do_card_dark border-b border-do_border_light dark:border-none px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
                  {t("tasks.execute")}
                </h2>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Agent Field - Floating Label Style */}
                <div className="relative">
                  <select
                    {...register("agent_id", {
                      required: `Agent ${t("validation.required")}`,
                    })}
                    className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white focus:border-blue-400 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">{t("common.select")} Agent</option>
                    {agents
                      .filter((a) => a.status === "active")
                      .map((agent) => (
                        <option key={agent.agent_id} value={agent.agent_id}>
                          {agent.name} ({agent.agent_type})
                        </option>
                      ))}
                  </select>
                  <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36] pointer-events-none">
                    Agent *
                  </label>
                  {errors.agent_id && (
                    <span className="text-[tomato] text-xs font-semibold block mt-1">
                      {errors.agent_id.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Task Type Field - Floating Label Style */}
                  <div className="relative">
                    <select
                      {...register("task_type", {
                        required: `Task Type ${t("validation.required")}`,
                      })}
                      className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white focus:border-blue-400 focus:outline-none appearance-none cursor-pointer"
                    >
                      <optgroup label="Tipos Regulares">
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
                      </optgroup>
                      <optgroup label="Tipos de Alto Riesgo (Requieren Aprobación)">
                        <option value="financial_transaction">
                          Financial Transaction ⚠️
                        </option>
                        <option value="legal_decision">
                          Legal Decision ⚠️
                        </option>
                        <option value="medical_diagnosis">
                          Medical Diagnosis ⚠️
                        </option>
                      </optgroup>
                    </select>
                    <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36] pointer-events-none">
                      Task Type *
                    </label>
                  </div>

                  {/* Task Name Field - Floating Label Style */}
                  <div className="relative">
                    <input
                      {...register("task_name")}
                      type="text"
                      className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                      placeholder=" "
                    />
                    <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                      Task Name (Optional)
                    </label>
                  </div>
                </div>

                {/* Input Data Field - Floating Label Style */}
                <div className="relative">
                  <textarea
                    {...register("input_data", {
                      required: `${t("tasks.inputData")} ${t(
                        "validation.required"
                      )}`,
                      validate: (value) => {
                        if (
                          !value ||
                          value.trim() === "" ||
                          value.trim() === "{}"
                        ) {
                          return t("validation.required");
                        }
                        try {
                          const parsed = JSON.parse(value);
                          if (
                            !parsed ||
                            (typeof parsed === "object" &&
                              Object.keys(parsed).length === 0)
                          ) {
                            return t("validation.invalidJson");
                          }
                          return true;
                        } catch {
                          return t("validation.invalidJson");
                        }
                      },
                    })}
                    rows="6"
                    className="peer h-32 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 py-3 text-white placeholder-transparent focus:border-blue-400 focus:outline-none resize-none font-mono text-sm"
                    placeholder=" "
                  />
                  <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                    {t("tasks.inputData")} *
                  </label>
                  {errors.input_data && (
                    <span className="text-[tomato] text-xs font-semibold block mt-1">
                      {errors.input_data.message}
                    </span>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("tasks.inputDataHelp")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {t("tasks.inputDataExample")}
                    </p>
                    <details className="mt-2">
                      <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                        Ver más ejemplos (incluye ejemplos que requieren aprobación)
                      </summary>
                      <div className="mt-2 space-y-2 text-xs text-gray-500 dark:text-gray-400 font-mono bg-[#1a1c20] p-3 rounded border border-gray-700">
                        <div>
                          <p className="text-gray-400 mb-1">
                            ⚠️ Transacción Financiera (REQUIERE APROBACIÓN):
                          </p>
                          <pre className="text-xs whitespace-pre-wrap break-all text-gray-300 bg-[#0f1115] p-2 rounded">
                            {`{
  "transaction_type": "wire_transfer",
  "amount": 50000,
  "from_account": "ACC-12345",
  "to_account": "ACC-67890",
  "description": "Payment for services"
}`}
                          </pre>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">
                            ⚠️ Con Datos Sensibles - Email (REQUIERE APROBACIÓN):
                          </p>
                          <pre className="text-xs whitespace-pre-wrap break-all text-gray-300 bg-[#0f1115] p-2 rounded">
                            {`{
  "customer_email": "customer@example.com",
  "transaction_amount": 1000,
  "description": "Monthly subscription"
}`}
                          </pre>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">
                            ⚠️ Con Datos Sensibles - Teléfono (REQUIERE APROBACIÓN):
                          </p>
                          <pre className="text-xs whitespace-pre-wrap break-all text-gray-300 bg-[#0f1115] p-2 rounded">
                            {`{
  "customer_name": "John Doe",
  "phone": "555-123-4567",
  "order_amount": 2500
}`}
                          </pre>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">
                            Análisis financiero simple:
                          </p>
                          <pre className="text-xs whitespace-pre-wrap break-all text-gray-300 bg-[#0f1115] p-2 rounded">
                            {`{
  "revenue": 1000000,
  "expenses": 750000
}`}
                          </pre>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">
                            Con prompt personalizado (conciliación bancaria):
                          </p>
                          <pre className="text-xs whitespace-pre-wrap break-all text-gray-300 bg-[#0f1115] p-2 rounded">
                            {`{
  "prompt": "Realiza una conciliación bancaria entre los registros bancarios y contables. Identifica las diferencias y proporciona un resumen de los ajustes necesarios.",
  "bank_balance": 47500,
  "accounting_balance": 57000,
  "bank_transactions": [
    {"date": "2024-01-15", "amount": 15000, "desc": "Depósito cliente"},
    {"date": "2024-01-18", "amount": -8500, "desc": "Cheque proveedor"},
    {"date": "2024-01-20", "amount": -25, "desc": "Comisión bancaria"}
  ],
  "accounting_transactions": [
    {"date": "2024-01-15", "amount": 15000, "desc": "Depósito cliente"},
    {"date": "2024-01-18", "amount": -8500, "desc": "Cheque proveedor"},
    {"date": "2024-01-25", "amount": 10000, "desc": "Venta adicional"}
  ]
}`}
                          </pre>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-do_border_light dark:border-none">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={executing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlayIcon className="h-5 w-5" />
                    {executing
                      ? t("tasks.executing")
                      : t("tasks.executeButton")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task Detail Modal */}
        {isDetailModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl dark:shadow-gray-900/50 border border-do_border_light dark:border-none max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-do_card_light dark:bg-do_card_dark border-b border-do_border_light dark:border-none px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
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
                    <p className="text-sm text-do_text_light dark:text-do_text_dark font-mono">
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
                    <p className="text-sm text-do_text_light dark:text-do_text_dark">
                      {selectedTask.task_type}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confidence
                    </label>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark">
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
                    <pre className="p-3 bg-do_bg_light dark:bg-do_bg_dark rounded-lg text-sm text-do_text_light dark:text-do_text_dark overflow-x-auto border border-do_border_light dark:border-none">
                      {JSON.stringify(selectedTask.input_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedTask.output_data && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Output Data
                    </label>
                    <pre className="p-3 bg-do_bg_light dark:bg-do_bg_dark rounded-lg text-sm text-do_text_light dark:text-do_text_dark overflow-x-auto border border-do_border_light dark:border-none">
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

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-do_border_light dark:border-none">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Creado
                    </label>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark">
                      {new Date(selectedTask.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedTask.completed_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Completado
                      </label>
                      <p className="text-sm text-do_text_light dark:text-do_text_dark">
                        {new Date(selectedTask.completed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streaming Response Modal */}
        {isStreaming && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl dark:shadow-gray-900/50 border border-do_border_light dark:border-none max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="sticky top-0 bg-do_card_light dark:bg-do_card_dark border-b border-do_border_light dark:border-none px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="relative h-5 w-5">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                  </div>
                  <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
                    {t("tasks.executing")}
                  </h2>
                </div>
                {streamingTaskId && (
                  <span className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark font-mono">
                    {streamingTaskId.substring(0, 8)}...
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {streamingResponse ? (
                  <AIOutputFormatter
                    output={streamingResponse}
                    maxHeight="max-h-full"
                    showCopyButton={true}
                    collapsible={false}
                  />
                ) : (
                  <div className="bg-do_bg_light dark:bg-do_bg_dark rounded-lg p-4 border border-do_border_light dark:border-none text-center">
                    <div className="flex items-center justify-center gap-2 text-do_text_gray_light dark:text-do_text_gray_dark">
                      <div className="relative h-5 w-5">
                        <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                      </div>
                      <span>Esperando respuesta...</span>
                    </div>
                  </div>
                )}
                {isStreaming && streamingResponse && (
                  <div className="mt-2 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
                    <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse"></span>
                    <span>Escribiendo...</span>
                  </div>
                )}
              </div>

              <div className="border-t border-do_border_light dark:border-none px-6 py-4 flex justify-end">
                <button
                  onClick={() => {
                    setIsStreaming(false);
                    setStreamingResponse("");
                    setStreamingTaskId(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={isStreaming}
                >
                  {isStreaming ? t("common.cancel") : t("common.close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksManagement;
