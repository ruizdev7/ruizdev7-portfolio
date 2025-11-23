/**
 * Blockchain Audit Trail - View Component
 * Displays blockchain audit records with filtering options
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetBlockchainAuditQuery } from "../../RTK_Query_app/services/aiGovernance/aiGovernanceApi";
import {
  ArrowLeftIcon,
  FunnelIcon,
  LinkIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  HashtagIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

const BlockchainAudit = () => {
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [limit, setLimit] = useState(50);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isBlockDetailOpen, setIsBlockDetailOpen] = useState(false);

  const {
    data: auditData,
    isLoading,
    error,
    refetch,
  } = useGetBlockchainAuditQuery({
    eventType: eventTypeFilter || undefined,
    limit,
  });

  const auditRecords = auditData?.audit_trail || [];
  const total = auditData?.total || 0;

  const eventTypes = [
    "ai_task_execution",
    "human_approval",
    "human_rejection",
    "agent_created",
    "agent_updated",
    "policy_created",
  ];

  const getEventTypeColor = (eventType) => {
    const colors = {
      ai_task_execution:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      human_approval:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      human_rejection:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      agent_created:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      agent_updated:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      policy_created:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    };
    return (
      colors[eventType] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const truncateHash = (hash) => {
    if (!hash) return "N/A";
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
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
            Error al cargar el audit trail:{" "}
            {error?.data?.error || error?.message}
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
            <span>Volver al Dashboard</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark">
                Blockchain Audit Trail
              </h1>
              <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
                Registro inmutable de todas las decisiones y acciones del
                sistema
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
              <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark">
                Filtros:
              </span>
            </div>
            <div className="flex-1 min-w-[200px]">
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-do_border_light dark:border-gray-600 rounded-lg bg-do_card_light dark:bg-do_card_dark text-do_text_light dark:text-do_text_dark focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos de eventos</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                Límite:
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 border border-do_border_light dark:border-gray-600 rounded-lg bg-do_card_light dark:bg-do_card_dark text-do_text_light dark:text-do_text_dark focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  Total de Registros
                </p>
                <p className="text-2xl font-bold text-do_text_light dark:text-do_text_dark mt-1">
                  {total}
                </p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  Mostrando
                </p>
                <p className="text-2xl font-bold text-do_text_light dark:text-do_text_dark mt-1">
                  {auditRecords.length}
                </p>
              </div>
              <HashtagIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  Tipos Únicos
                </p>
                <p className="text-2xl font-bold text-do_text_light dark:text-do_text_dark mt-1">
                  {new Set(auditRecords.map((r) => r.event_type)).size}
                </p>
              </div>
              <FunnelIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Audit Records Table */}
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-md dark:shadow-gray-900/50 border border-do_border_light dark:border-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-do_border_light dark:divide-gray-700">
              <thead className="bg-do_card_light dark:bg-do_card_dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Tipo de Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Actor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Entity ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    TX Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Block #
                  </th>
                </tr>
              </thead>
              <tbody className="bg-do_card_light dark:bg-do_card_dark divide-y divide-do_border_light dark:divide-gray-700">
                {auditRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-do_text_gray_light dark:text-do_text_gray_dark"
                    >
                      No hay registros de auditoría disponibles
                    </td>
                  </tr>
                ) : (
                  auditRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-do_bg_light dark:hover:bg-do_bg_dark transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-do_text_gray_light dark:text-do_text_gray_dark" />
                          <span className="text-sm text-do_text_light dark:text-do_text_dark">
                            {formatTimestamp(record.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getEventTypeColor(
                            record.event_type
                          )}`}
                        >
                          {record.event_type
                            ?.replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()) || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-do_text_gray_light dark:text-do_text_gray_dark" />
                          <span className="text-sm text-do_text_light dark:text-do_text_dark">
                            {record.actor_name ||
                              `User #${record.actor_id || "N/A"}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-do_text_light dark:text-do_text_dark">
                          {record.action || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-do_text_gray_light dark:text-do_text_gray_dark">
                          {record.entity_id
                            ? truncateHash(record.entity_id)
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedBlock(record);
                            setIsBlockDetailOpen(true);
                          }}
                          className="flex items-center gap-2 hover:underline group"
                        >
                          <LinkIcon className="h-4 w-4 text-do_text_gray_light dark:text-do_text_gray_dark group-hover:text-blue-400 transition-colors" />
                          <span className="text-sm font-mono text-blue-600 dark:text-blue-400 group-hover:text-blue-500">
                            {truncateHash(record.blockchain_tx_hash)}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-do_text_light dark:text-do_text_dark">
                          {record.block_number || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Block Detail Modal */}
        {isBlockDetailOpen && selectedBlock && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl dark:shadow-gray-900/50 border border-do_border_light dark:border-none max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-do_card_light dark:bg-do_card_dark border-b border-do_border_light dark:border-none px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
                  Detalles del Bloque Blockchain
                </h2>
                <button
                  onClick={() => {
                    setIsBlockDetailOpen(false);
                    setSelectedBlock(null);
                  }}
                  className="text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Block Header */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-1">
                      Block Number
                    </label>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark font-mono">
                      {selectedBlock.block_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-1">
                      Timestamp
                    </label>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark">
                      {formatTimestamp(selectedBlock.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Transaction Hash */}
                <div>
                  <label className="block text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-1">
                    Transaction Hash
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono text-do_text_light dark:text-do_text_dark bg-do_bg_light dark:bg-do_bg_dark p-2 rounded border border-do_border_light dark:border-none break-all">
                      {selectedBlock.blockchain_tx_hash || "N/A"}
                    </code>
                    {selectedBlock.blockchain_tx_hash && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedBlock.blockchain_tx_hash
                          );
                          toast.success("Hash copiado al portapapeles");
                        }}
                        className="p-2 text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark transition-colors"
                        title="Copiar hash"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-1">
                      Event Type
                    </label>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${getEventTypeColor(
                        selectedBlock.event_type
                      )}`}
                    >
                      {selectedBlock.event_type
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase()) || "N/A"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-1">
                      Action
                    </label>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark">
                      {selectedBlock.action || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Entity ID */}
                <div>
                  <label className="block text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-1">
                    Entity ID
                  </label>
                  <code className="block text-sm font-mono text-do_text_light dark:text-do_text_dark bg-do_bg_light dark:bg-do_bg_dark p-2 rounded border border-do_border_light dark:border-none break-all">
                    {selectedBlock.entity_id || "N/A"}
                  </code>
                </div>

                {/* Actor */}
                <div>
                  <label className="block text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-1">
                    Actor
                  </label>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-do_text_gray_light dark:text-do_text_gray_dark" />
                    <p className="text-sm text-do_text_light dark:text-do_text_dark">
                      {selectedBlock.actor_name ||
                        `User #${selectedBlock.actor_id || "N/A"}`}
                    </p>
                  </div>
                </div>

                {/* Additional Data */}
                {selectedBlock.additional_data && (
                  <div>
                    <label className="block text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-1">
                      Additional Data
                    </label>
                    <pre className="text-xs font-mono text-do_text_light dark:text-do_text_dark bg-do_bg_light dark:bg-do_bg_dark p-3 rounded border border-do_border_light dark:border-none overflow-x-auto">
                      {JSON.stringify(
                        typeof selectedBlock.additional_data === "string"
                          ? JSON.parse(selectedBlock.additional_data)
                          : selectedBlock.additional_data,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainAudit;
