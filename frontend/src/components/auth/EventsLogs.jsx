import { useState } from "react";
import {
  useGetMyAuditLogsQuery,
  useGetAuditLogsQuery,
} from "../../RTK_Query_app/services/auditLogs/auditLogsApi";
import { usePermissions } from "../../hooks/usePermissions";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const EventsLogs = () => {
  const { isAdmin } = usePermissions();
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  // Use different queries based on admin status
  const {
    data: myLogsData,
    isLoading: myLogsLoading,
    error: myLogsError,
    refetch: refetchMyLogs,
  } = useGetMyAuditLogsQuery(
    {
      page,
      per_page: perPage,
      event_type: eventTypeFilter || undefined,
      resource: resourceFilter || undefined,
      action: actionFilter || undefined,
    },
    { skip: isAdmin() } // Skip if admin (we'll use all logs instead)
  );

  const {
    data: allLogsData,
    isLoading: allLogsLoading,
    error: allLogsError,
    refetch: refetchAllLogs,
  } = useGetAuditLogsQuery(
    {
      page,
      per_page: perPage,
      event_type: eventTypeFilter || undefined,
      resource: resourceFilter || undefined,
      action: actionFilter || undefined,
    },
    { skip: !isAdmin() } // Skip if not admin
  );

  const logs = (isAdmin() ? allLogsData?.logs : myLogsData?.logs) || [];
  const pagination = isAdmin()
    ? allLogsData?.pagination
    : myLogsData?.pagination;
  const isLoading = isAdmin() ? allLogsLoading : myLogsLoading;
  const error = isAdmin() ? allLogsError : myLogsError;
  const refetch = isAdmin() ? refetchAllLogs : refetchMyLogs;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  // Get event type badge color
  const getEventTypeColor = (eventType) => {
    const colors = {
      login:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      logout:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      create:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      update:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      delete: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      read: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };
    return (
      colors[eventType] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    );
  };

  // Get action icon
  const getActionIcon = (action) => {
    switch (action) {
      case "create":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "delete":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Clear all filters
  const clearFilters = () => {
    setEventTypeFilter("");
    setResourceFilter("");
    setActionFilter("");
    setPage(1);
  };

  // Available filters
  const eventTypes = ["login", "logout", "create", "update", "delete", "read"];
  const resources = ["users", "roles", "permissions", "posts", "pumps"];
  const actions = ["create", "read", "update", "delete"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading events & logs...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        <p className="font-bold">Error loading events & logs:</p>
        <p>{error?.data?.error || "Unknown error occurred"}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Events & Logs
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your account activity and system events
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Event Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Type
            </label>
            <select
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resource
            </label>
            <select
              value={resourceFilter}
              onChange={(e) => {
                setResourceFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Resources</option>
              {resources.map((resource) => (
                <option key={resource} value={resource}>
                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Stats Cards */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {pagination?.total || 0}
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Total Events
              </span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {logs.length}
              </span>
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                Showing Now
              </span>
            </div>
            {pagination && (
              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {pagination.page}
                </span>
                <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                  of {pagination.pages} Pages
                </span>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 text-center">
          <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No events found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your activity events will appear here once you start using the
            system.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                    {isAdmin() && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr
                      key={log.ccn_audit_log}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatTimestamp(log.created_at)}
                      </td>
                      {isAdmin() && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {log.user ? (
                            <div>
                              <div className="font-medium">
                                {log.user.first_name} {log.user.last_name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {log.user.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">System</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(
                            log.event_type
                          )}`}
                        >
                          {log.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm text-gray-900 dark:text-white">
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {log.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {logs.map((log) => (
              <div
                key={log.ccn_audit_log}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(
                      log.event_type
                    )}`}
                  >
                    {log.event_type}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTimestamp(log.created_at)}
                  </span>
                </div>

                <div className="space-y-2">
                  {isAdmin() && log.user && (
                    <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.user.first_name} {log.user.last_name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {log.user.email}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {log.resource} - {log.action}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {log.description}
                  </p>

                  {log.ip_address && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      IP: {log.ip_address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Page Navigation:</span>
              <span>
                Showing {perPage * (page - 1) + 1} to{" "}
                {Math.min(perPage * page, pagination.total)} of{" "}
                {pagination.total} events
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title="First page"
              >
                ««
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Previous
              </button>

              <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {pagination.page}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  / {pagination.pages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(pagination.pages)}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title="Last page"
              >
                »»
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsLogs;
