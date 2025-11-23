/**
 * AI Agents Management - CRUD Component
 * Full Create, Read, Update, Delete functionality for AI Agents
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useGetAgentsQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
} from "../../RTK_Query_app/services/aiGovernance/aiGovernanceApi";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CpuChipIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const AgentsManagement = () => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: agentsData, isLoading, error, refetch } = useGetAgentsQuery();
  const [createAgent, { isLoading: creating }] = useCreateAgentMutation();
  const [updateAgent, { isLoading: updating }] = useUpdateAgentMutation();
  const [deleteAgent, { isLoading: deleting }] = useDeleteAgentMutation();

  const agents = agentsData?.agents || [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      agent_type: "general",
      description: "",
      model_name: "gpt-4",
      confidence_threshold: 0.7,
      status: "active",
      use_local_model: false,
      local_model_url: "http://localhost:11434/v1",
      local_model_name: "gpt-oss-20b",
    },
  });

  const useLocalModel = watch("use_local_model");

  const openCreateModal = () => {
    setEditingAgent(null);
    reset({
      name: "",
      agent_type: "general",
      description: "",
      model_name: "gpt-4",
      confidence_threshold: 0.7,
      status: "active",
      use_local_model: false,
      local_model_url: "http://localhost:11434/v1",
      local_model_name: "gpt-oss-20b",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (agent) => {
    setEditingAgent(agent);
    reset({
      name: agent.name,
      agent_type: agent.agent_type,
      description: agent.description || "",
      model_name: agent.model_name || "gpt-4",
      confidence_threshold: agent.confidence_threshold || 0.7,
      status: agent.status || "active",
      use_local_model: agent.use_local_model || false,
      local_model_url: agent.local_model_url || "http://localhost:11434/v1",
      local_model_name: agent.local_model_name || "gpt-oss-20b",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAgent(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingAgent) {
        await updateAgent({
          agentId: editingAgent.agent_id,
          ...data,
        }).unwrap();
        toast.success(t("agents.updated"));
      } else {
        await createAgent(data).unwrap();
        toast.success(t("agents.created"));
      }
      closeModal();
      refetch();
    } catch (error) {
      console.error("Error updating agent:", error);
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        t("agents.error");
      toast.error(
        typeof errorMessage === "object"
          ? JSON.stringify(errorMessage)
          : errorMessage
      );
    }
  };

  const handleDelete = async (agentId) => {
    try {
      await deleteAgent(agentId).unwrap();
      toast.success(t("agents.deleted"));
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.error || t("agents.deleteError"));
    }
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
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">
            Error al cargar agents: {error?.data?.error || error?.message}
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
                {t("agents.title")}
              </h1>
              <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
                {t("agents.subtitle")}
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md dark:shadow-gray-900/50"
            >
              <PlusIcon className="h-5 w-5" />
              {t("agents.create")}
            </button>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-do_card_light dark:bg-do_card_dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-do_card_light dark:bg-do_card_dark divide-y divide-gray-200 dark:divide-gray-700">
                {agents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-do_text_gray_light dark:text-do_text_gray_dark"
                    >
                      No hay agents creados. Crea uno para comenzar.
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => (
                    <tr
                      key={agent.agent_id}
                      className="hover:bg-do_bg_light dark:hover:bg-do_bg_dark transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CpuChipIcon className="h-5 w-5 text-do_text_gray_light dark:text-do_text_gray_dark mr-2" />
                          <div>
                            <div className="text-sm font-medium text-do_text_light dark:text-do_text_dark">
                              {agent.name}
                            </div>
                            {agent.description && (
                              <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark truncate max-w-xs">
                                {agent.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            agent.agent_type === "financial"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : agent.agent_type === "legal"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : agent.agent_type === "hr"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-do_card_light text-do_text_light dark:bg-do_card_dark dark:text-do_text_dark"
                          }`}
                        >
                          {agent.agent_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-do_text_light dark:text-do_text_dark">
                        {agent.model_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-do_text_light dark:text-do_text_dark">
                        {(agent.confidence_threshold * 100).toFixed(0)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            agent.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-do_card_light text-do_text_light dark:bg-do_card_dark dark:text-do_text_dark"
                          }`}
                        >
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(agent)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(agent.agent_id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl dark:shadow-gray-900/50 border border-do_border_light dark:border-none max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-do_card_light dark:bg-do_card_dark border-b border-do_border_light dark:border-none px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
                  {editingAgent ? t("agents.edit") : t("agents.createNew")}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Name Field - Floating Label Style */}
                <div className="relative">
                  <input
                    {...register("name", {
                      required: `${t("common.name")} ${t(
                        "validation.required"
                      )}`,
                      minLength: {
                        value: 3,
                        message: t("validation.minLength", { min: 3 }),
                      },
                      maxLength: {
                        value: 100,
                        message: t("validation.maxLength", { max: 100 }),
                      },
                    })}
                    type="text"
                    className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                    placeholder=" "
                  />
                  <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                    {t("common.name")} *
                  </label>
                  {errors.name && (
                    <span className="text-[tomato] text-xs font-semibold block mt-1">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Agent Type Field - Floating Label Style */}
                <div className="relative">
                  <select
                    {...register("agent_type", {
                      required: `${t("agents.type")} ${t(
                        "validation.required"
                      )}`,
                    })}
                    className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white focus:border-blue-400 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="general">General</option>
                    <option value="financial">Financial</option>
                    <option value="legal">Legal</option>
                    <option value="hr">HR</option>
                  </select>
                  <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36] pointer-events-none">
                    {t("agents.type")} *
                  </label>
                  {errors.agent_type && (
                    <span className="text-[tomato] text-xs font-semibold block mt-1">
                      {errors.agent_type.message}
                    </span>
                  )}
                </div>

                {/* Description Field - Floating Label Style */}
                <div className="relative">
                  <textarea
                    {...register("description")}
                    rows="3"
                    className="peer h-24 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 py-3 text-white placeholder-transparent focus:border-blue-400 focus:outline-none resize-none"
                    placeholder=" "
                  />
                  <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                    {t("common.description")}
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Model Field - Floating Label Style */}
                  <div className="relative">
                    <select
                      {...register("model_name", {
                        required: `${t("agents.model")} ${t(
                          "validation.required"
                        )}`,
                      })}
                      className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white focus:border-blue-400 focus:outline-none appearance-none cursor-pointer"
                    >
                      <optgroup label="OpenAI Models">
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      </optgroup>
                      <optgroup label="Local Models (Ollama)">
                        <option value="gpt-oss-20b">GPT-OSS-20B</option>
                        <option value="llama2">Llama 2</option>
                        <option value="llama3">Llama 3</option>
                        <option value="mistral">Mistral</option>
                      </optgroup>
                    </select>
                    <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36] pointer-events-none">
                      {t("agents.model")} *
                    </label>
                  </div>

                  {/* Use Local Model Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="use_local_model"
                      {...register("use_local_model")}
                      className="w-5 h-5 rounded border-gray-600 bg-[#2C2F36] text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <label
                      htmlFor="use_local_model"
                      className="text-sm text-do_text_light dark:text-do_text_dark cursor-pointer"
                    >
                      Usar modelo local (Ollama)
                    </label>
                  </div>

                  {/* Local Model Configuration (shown when use_local_model is true) */}
                  {useLocalModel && (
                    <>
                      <div className="relative">
                        <input
                          {...register("local_model_url", {
                            required: useLocalModel
                              ? "URL del modelo local es requerida"
                              : false,
                          })}
                          type="text"
                          className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                          URL del Servidor Ollama
                        </label>
                        {errors.local_model_url && (
                          <span className="text-[tomato] text-xs font-semibold block mt-1">
                            {errors.local_model_url.message}
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          {...register("local_model_name", {
                            required: useLocalModel
                              ? "Nombre del modelo local es requerido"
                              : false,
                          })}
                          type="text"
                          className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                          Nombre del Modelo Local
                        </label>
                        {errors.local_model_name && (
                          <span className="text-[tomato] text-xs font-semibold block mt-1">
                            {errors.local_model_name.message}
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Confidence Threshold Field - Floating Label Style */}
                  <div className="relative">
                    <input
                      {...register("confidence_threshold", {
                        required: `${t("agents.threshold")} ${t(
                          "validation.required"
                        )}`,
                        min: { value: 0, message: `${t("validation.min")} 0` },
                        max: { value: 1, message: `${t("validation.max")} 1` },
                        valueAsNumber: true,
                      })}
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                      placeholder=" "
                    />
                    <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36]">
                      {t("agents.threshold")} *
                    </label>
                    {errors.confidence_threshold && (
                      <span className="text-[tomato] text-xs font-semibold block mt-1">
                        {errors.confidence_threshold.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Field - Floating Label Style */}
                <div className="relative">
                  <select
                    {...register("status", {
                      required: `${t("common.status")} ${t(
                        "validation.required"
                      )}`,
                    })}
                    className="peer h-12 w-full rounded-lg border-2 border-gray-600 dark:border-gray-600 bg-[#2C2F36] dark:bg-[#2C2F36] px-4 text-white focus:border-blue-400 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <label className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-400 bg-[#2C2F36] pointer-events-none">
                    {t("common.status")} *
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-do_border_light dark:border-none">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-do_text_light dark:text-do_text_dark bg-do_card_light dark:bg-do_card_dark rounded-lg hover:bg-do_bg_light dark:hover:bg-do_bg_dark"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating || updating
                      ? t("common.saving")
                      : editingAgent
                      ? t("common.update")
                      : t("common.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4">
                {t("agents.deleteConfirm")}
              </h3>
              <p className="text-do_text_gray_light dark:text-do_text_gray_dark mb-6">
                {t("agents.deleteMessage")}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-do_text_light dark:text-do_text_dark bg-do_card_light dark:bg-do_card_dark rounded-lg hover:bg-do_bg_light dark:hover:bg-do_bg_dark"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? t("common.saving") : t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsManagement;
