/**
 * Approvals Management - Human-in-the-Loop System
 * Review, approve, or reject AI task outputs
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetApprovalsQuery,
  useApproveTaskMutation,
  useRejectTaskMutation,
} from "../../RTK_Query_app/services/aiGovernance/aiGovernanceApi";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import AIOutputFormatter from "../../components/AIOutputFormatter";

const ApprovalsManagement = () => {
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [statusFilter, setStatusFilter] = useState("pending");

  const {
    data: approvalsData,
    isLoading,
    error,
    refetch,
  } = useGetApprovalsQuery({
    assigned_only: true,
    status: statusFilter,
  });
  const [approveTask, { isLoading: approving }] = useApproveTaskMutation();
  const [rejectTask, { isLoading: rejecting }] = useRejectTaskMutation();

  const approvals = approvalsData?.approvals || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      justification: "",
      modified_output: "",
    },
  });

  const openDetailModal = (approvalId) => {
    const approval = approvals.find((a) => a.approval_id === approvalId);
    setSelectedApproval(approval);
    setIsDetailModalOpen(true);
  };

  const openActionModal = (approval, type) => {
    setSelectedApproval(approval);
    setActionType(type);
    reset({
      justification: "",
      modified_output: "",
    });
    setIsActionModalOpen(true);
  };

  const closeModals = () => {
    setIsDetailModalOpen(false);
    setIsActionModalOpen(false);
    setSelectedApproval(null);
    setActionType(null);
    reset();
  };

  const onSubmitAction = async (data) => {
    if (!selectedApproval) return;

    try {
      if (actionType === "approve") {
        let modifiedOutput = null;
        if (data.modified_output) {
          try {
            modifiedOutput = JSON.parse(data.modified_output);
          } catch {
            modifiedOutput = { raw: data.modified_output };
          }
        }

        await approveTask({
          approvalId: selectedApproval.approval_id,
          justification: data.justification,
          modifiedOutput,
        }).unwrap();
        toast.success("Tarea aprobada exitosamente");
      } else {
        await rejectTask({
          approvalId: selectedApproval.approval_id,
          justification: data.justification,
        }).unwrap();
        toast.success("Tarea rechazada exitosamente");
      }

      closeModals();
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.error ||
          `Error al ${
            actionType === "approve" ? "aprobar" : "rechazar"
          } la tarea`
      );
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      modified:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return (
      badges[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  const isOverdue = (approval) => {
    if (!approval.deadline) return false;
    return (
      new Date(approval.deadline) < new Date() && approval.status === "pending"
    );
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
            Error al cargar aprobaciones: {error?.data?.error || error?.message}
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
            className="inline-flex items-center gap-2 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver al Dashboard</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark">
              Human-in-the-Loop Approvals
            </h1>
            <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
              Revisa y aprueba o rechaza las decisiones de IA
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "pending"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-do_card_light dark:bg-do_card_dark text-do_text_light dark:text-do_text_dark border-do_border_light dark:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "approved"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-do_card_light dark:bg-do_card_dark text-do_text_light dark:text-do_text_dark border-do_border_light dark:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Aprobadas
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              statusFilter === "rejected"
                ? "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700"
                : "bg-do_card_light dark:bg-do_card_dark text-do_text_light dark:text-do_text_dark border-do_border_light dark:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Rechazadas
          </button>
        </div>

        {/* Approvals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
                No hay aprobaciones{" "}
                {statusFilter === "pending"
                  ? "pendientes"
                  : statusFilter === "approved"
                  ? "aprobadas"
                  : "rechazadas"}
              </p>
            </div>
          ) : (
            approvals.map((approval) => {
              const overdue = isOverdue(approval);
              return (
                <div
                  key={approval.approval_id}
                  className={`bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 transition-all ${
                    overdue ? "ring-2 ring-red-500 dark:ring-red-400" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark">
                          Task #{approval.task_id?.slice(0, 8) || "N/A"}
                        </h3>
                        {overdue && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium rounded">
                            OVERDUE
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getStatusBadge(
                          approval.status
                        )}`}
                      >
                        {approval.status === "pending" && (
                          <ClockIcon className="h-4 w-4" />
                        )}
                        {approval.status === "approved" && (
                          <CheckCircleIcon className="h-4 w-4" />
                        )}
                        {approval.status === "rejected" && (
                          <XCircleIcon className="h-4 w-4" />
                        )}
                        {approval.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                    <div>
                      <span className="font-medium">Creado:</span>{" "}
                      {new Date(approval.created_at).toLocaleString()}
                    </div>
                    {approval.deadline && (
                      <div>
                        <span className="font-medium">Deadline:</span>{" "}
                        <span
                          className={
                            overdue ? "text-red-600 dark:text-red-400" : ""
                          }
                        >
                          {new Date(approval.deadline).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {approval.priority && (
                      <div>
                        <span className="font-medium">Prioridad:</span>{" "}
                        {approval.priority}
                      </div>
                    )}
                  </div>

                  {approval.task_output && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-do_text_light dark:text-do_text_dark mb-2">
                        📋 Respuesta de la IA (requiere revisión)
                      </label>
                      <AIOutputFormatter
                        output={approval.task_output}
                        maxHeight="max-h-40"
                        showCopyButton={true}
                        collapsible={false}
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetailModal(approval.approval_id)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-do_text_light dark:text-do_text_dark rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 inline mr-1" />
                      Ver
                    </button>
                    {approval.status === "pending" && (
                      <>
                        <button
                          onClick={() => openActionModal(approval, "approve")}
                          className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => openActionModal(approval, "reject")}
                          className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircleIcon className="h-4 w-4 inline mr-1" />
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Modal */}
        {isDetailModalOpen && selectedApproval && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl dark:shadow-gray-900/50 border border-do_border_light dark:border-none max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-do_card_light dark:bg-do_card_dark border-b border-do_border_light dark:border-none px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
                  Detalles de Aprobación
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-1">
                      Approval ID
                    </label>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark font-mono">
                      {selectedApproval.approval_id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-1">
                      Estado
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getStatusBadge(
                        selectedApproval.status
                      )}`}
                    >
                      {selectedApproval.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-1">
                      Task ID
                    </label>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark font-mono">
                      {selectedApproval.task_id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-1">
                      Prioridad
                    </label>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark">
                      {selectedApproval.priority || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedApproval.task_output && (
                  <div>
                    <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
                      📋 Respuesta de la IA
                    </label>
                    <AIOutputFormatter
                      output={selectedApproval.task_output}
                      maxHeight="max-h-96"
                      showCopyButton={true}
                      collapsible={true}
                      defaultCollapsed={false}
                    />
                  </div>
                )}

                {selectedApproval.justification && (
                  <div>
                    <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
                      Justificación
                    </label>
                    <p className="p-3 bg-do_bg_light dark:bg-do_bg_dark rounded-lg text-sm text-do_text_light dark:text-do_text_dark">
                      {selectedApproval.justification}
                    </p>
                  </div>
                )}

                {selectedApproval.modified_output && (
                  <div>
                    <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
                      Output Modificado
                    </label>
                    <pre className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-do_text_light dark:text-do_text_dark overflow-x-auto">
                      {typeof selectedApproval.modified_output === "string"
                        ? selectedApproval.modified_output
                        : JSON.stringify(
                            selectedApproval.modified_output,
                            null,
                            2
                          )}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-do_border_light dark:border-none">
                  <div>
                    <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-1">
                      Creado
                    </label>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark">
                      {new Date(selectedApproval.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedApproval.approved_at && (
                    <div>
                      <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-1">
                        {selectedApproval.status === "approved"
                          ? "Aprobado"
                          : "Rechazado"}
                      </label>
                      <p className="text-sm text-do_text_light dark:text-do_text_dark">
                        {new Date(
                          selectedApproval.approved_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Modal (Approve/Reject) */}
        {isActionModalOpen && selectedApproval && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl dark:shadow-gray-900/50 border border-do_border_light dark:border-none max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-do_card_light dark:bg-do_card_dark border-b border-do_border_light dark:border-none px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
                  {actionType === "approve"
                    ? "Aprobar Tarea"
                    : "Rechazar Tarea"}
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(onSubmitAction)}
                className="p-6 space-y-4"
              >
                {/* Show original output prominently before action */}
                {selectedApproval?.task_output && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
                      📋 Respuesta de la IA (revisa antes de aprobar/rechazar)
                    </label>
                    <AIOutputFormatter
                      output={selectedApproval.task_output}
                      maxHeight="max-h-60"
                      showCopyButton={true}
                      collapsible={false}
                    />
                  </div>
                )}

                {actionType === "approve" && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          Opcionalmente puedes modificar el output antes de
                          aprobar. Si no proporcionas un output modificado, se
                          aprobará el output original mostrado arriba.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
                    Justificación *
                  </label>
                  <textarea
                    {...register("justification", {
                      required: "La justificación es requerida",
                      minLength: {
                        value: 10,
                        message:
                          "La justificación debe tener al menos 10 caracteres",
                      },
                    })}
                    rows="4"
                    placeholder="Explica por qué apruebas o rechazas esta tarea..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-do_text_light dark:text-do_text_dark focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.justification && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.justification.message}
                    </p>
                  )}
                </div>

                {actionType === "approve" && (
                  <div>
                    <label className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
                      Output Modificado (JSON, opcional)
                    </label>
                    <textarea
                      {...register("modified_output", {
                        validate: (value) => {
                          if (!value) return true;
                          try {
                            JSON.parse(value);
                            return true;
                          } catch {
                            return "Debe ser un JSON válido";
                          }
                        },
                      })}
                      rows="6"
                      placeholder='{"key": "value"}'
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-do_text_light dark:text-do_text_dark focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    {errors.modified_output && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.modified_output.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-do_border_light dark:border-none">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 text-do_text_light dark:text-do_text_dark bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={approving || rejecting}
                    className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                      actionType === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {approving || rejecting
                      ? "Procesando..."
                      : actionType === "approve"
                      ? "Aprobar"
                      : "Rechazar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsManagement;
