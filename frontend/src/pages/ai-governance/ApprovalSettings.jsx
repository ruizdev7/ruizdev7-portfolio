/**
 * Approval Settings - Configuration Component
 * Configure global approval parameters for AI tasks
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useGetApprovalSettingsQuery,
  useUpdateApprovalSettingsMutation,
} from "../../RTK_Query_app/services/aiGovernance/aiGovernanceApi";
import {
  Cog6ToothIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const ApprovalSettings = () => {
  const { t } = useLanguage();
  const [taskTypeInput, setTaskTypeInput] = useState("");

  const {
    data: settingsData,
    isLoading,
    error,
    refetch,
  } = useGetApprovalSettingsQuery();
  const [updateSettings, { isLoading: updating }] =
    useUpdateApprovalSettingsMutation();

  const settings = settingsData?.settings;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      confidence_threshold: 0.7,
      high_risk_task_types: [],
      approval_sla_hours: 4,
      auto_approve_high_confidence: false,
      auto_approve_threshold: 0.95,
      require_approval_for_sensitive_data: true,
    },
  });

  const autoApproveEnabled = watch("auto_approve_high_confidence");

  useEffect(() => {
    if (settings) {
      reset({
        confidence_threshold: settings.confidence_threshold || 0.7,
        high_risk_task_types: settings.high_risk_task_types || [],
        approval_sla_hours: settings.approval_sla_hours || 4,
        auto_approve_high_confidence:
          settings.auto_approve_high_confidence || false,
        auto_approve_threshold: settings.auto_approve_threshold || 0.95,
        require_approval_for_sensitive_data:
          settings.require_approval_for_sensitive_data !== undefined
            ? settings.require_approval_for_sensitive_data
            : true,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data) => {
    try {
      await updateSettings(data).unwrap();
      toast.success("Configuración de aprobaciones actualizada exitosamente");
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.error || "Error al actualizar la configuración"
      );
    }
  };

  const addTaskType = () => {
    if (taskTypeInput.trim()) {
      const currentTypes = watch("high_risk_task_types") || [];
      if (!currentTypes.includes(taskTypeInput.trim())) {
        reset({
          ...watch(),
          high_risk_task_types: [...currentTypes, taskTypeInput.trim()],
        });
        setTaskTypeInput("");
      } else {
        toast.warning("Este tipo de tarea ya está en la lista");
      }
    }
  };

  const removeTaskType = (taskType) => {
    const currentTypes = watch("high_risk_task_types") || [];
    reset({
      ...watch(),
      high_risk_task_types: currentTypes.filter((t) => t !== taskType),
    });
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
            Error al cargar configuración: {error?.data?.error || error?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/ai-governance"
            className="inline-flex items-center gap-2 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver al Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <Cog6ToothIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark">
                Configuración de Aprobaciones
              </h1>
              <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
                Ajusta los parámetros globales para determinar cuándo las tareas
                requieren aprobación humana
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 space-y-6"
        >
          {/* Confidence Threshold */}
          <div className="relative">
            <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
              Umbral de Confianza (0.0 - 1.0) *
            </label>
            <input
              {...register("confidence_threshold", {
                required: "El umbral de confianza es requerido",
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
                max: { value: 1, message: "Debe ser menor o igual a 1" },
                valueAsNumber: true,
              })}
              type="number"
              step="0.01"
              min="0"
              max="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-do_text_light dark:text-do_text_dark focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
              Las tareas con confianza menor a este valor requerirán aprobación
            </p>
            {errors.confidence_threshold && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.confidence_threshold.message}
              </p>
            )}
          </div>

          {/* High Risk Task Types */}
          <div>
            <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
              Tipos de Tareas de Alto Riesgo
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={taskTypeInput}
                onChange={(e) => setTaskTypeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTaskType();
                  }
                }}
                placeholder="Ej: financial_transaction"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-do_text_light dark:text-do_text_dark focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTaskType}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(watch("high_risk_task_types") || []).map((taskType) => (
                <span
                  key={taskType}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-lg text-sm"
                >
                  {taskType}
                  <button
                    type="button"
                    onClick={() => removeTaskType(taskType)}
                    className="hover:text-red-600 dark:hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="mt-1 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
              Las tareas de estos tipos siempre requerirán aprobación
            </p>
          </div>

          {/* Approval SLA */}
          <div className="relative">
            <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
              SLA de Aprobación (horas) *
            </label>
            <input
              {...register("approval_sla_hours", {
                required: "El SLA es requerido",
                min: { value: 1, message: "Debe ser al menos 1 hora" },
                max: { value: 168, message: "Máximo 168 horas (1 semana)" },
                valueAsNumber: true,
              })}
              type="number"
              min="1"
              max="168"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-do_text_light dark:text-do_text_dark focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
              Tiempo máximo para aprobar una tarea antes de marcarla como
              vencida
            </p>
            {errors.approval_sla_hours && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.approval_sla_hours.message}
              </p>
            )}
          </div>

          {/* Auto-approve High Confidence */}
          <div className="flex items-center">
            <input
              {...register("auto_approve_high_confidence")}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-do_text_light dark:text-do_text_dark">
              Auto-aprobar tareas con confianza muy alta
            </label>
          </div>

          {/* Auto-approve Threshold */}
          {autoApproveEnabled && (
            <div className="relative ml-6">
              <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
                Umbral de Auto-aprobación (0.0 - 1.0)
              </label>
              <input
                {...register("auto_approve_threshold", {
                  min: { value: 0, message: "Debe ser mayor o igual a 0" },
                  max: { value: 1, message: "Debe ser menor o igual a 1" },
                  valueAsNumber: true,
                })}
                type="number"
                step="0.01"
                min="0"
                max="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-do_text_light dark:text-do_text_dark focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
                Las tareas con confianza mayor o igual a este valor se
                aprobarán automáticamente
              </p>
              {errors.auto_approve_threshold && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.auto_approve_threshold.message}
                </p>
              )}
            </div>
          )}

          {/* Require Approval for Sensitive Data */}
          <div className="flex items-center">
            <input
              {...register("require_approval_for_sensitive_data")}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-do_text_light dark:text-do_text_dark">
              Requerir aprobación para datos sensibles
            </label>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Nota:</strong> Estos parámetros se aplican
                  globalmente a todas las tareas. Si un agente tiene su propio
                  umbral de confianza, se usará el valor global para determinar
                  si se requiere aprobación.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-do_border_light dark:border-none">
            <Link
              to="/ai-governance"
              className="px-4 py-2 text-do_text_light dark:text-do_text_dark bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalSettings;

