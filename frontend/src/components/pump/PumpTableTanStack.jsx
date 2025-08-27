import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import {
  PencilIcon,
  PhotoIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

// Status colors configuration - Enhanced light theme focus
const getStatusColors = () => ({
  Active: {
    container: "flex items-center gap-2 text-[#0272AD] dark:text-[#0272AD]",
    dot: "w-2 h-2 bg-[#0272AD] rounded-full",
    text: "text-sm font-medium",
  },
  Inactive: {
    container: "flex items-center gap-2 text-slate-500 dark:text-gray-400",
    dot: "w-2 h-2 bg-slate-400 rounded-full",
    text: "text-sm font-medium",
  },
  Maintenance: {
    container: "flex items-center gap-2 text-amber-700 dark:text-amber-500",
    dot: "w-2 h-2 bg-amber-600 rounded-full",
    text: "text-sm font-medium",
  },
  Out_of_Service: {
    container: "flex items-center gap-2 text-slate-600 dark:text-gray-500",
    dot: "w-2 h-2 bg-slate-500 rounded-full",
    text: "text-sm font-medium",
  },
  Standby: {
    container: "flex items-center gap-2 text-slate-600 dark:text-slate-400",
    dot: "w-2 h-2 bg-slate-400 rounded-full",
    text: "text-sm font-medium",
  },
  Repair: {
    container: "flex items-center gap-2 text-red-700 dark:text-red-500",
    dot: "w-2 h-2 bg-red-600 rounded-full",
    text: "text-sm font-medium",
  },
  Testing: {
    container: "flex items-center gap-2 text-indigo-700 dark:text-indigo-500",
    dot: "w-2 h-2 bg-indigo-600 rounded-full",
    text: "text-sm font-medium",
  },
});

const columnHelper = createColumnHelper();

function PumpTableTanStack({
  rows,
  isDarkMode,
  onEdit,
  onDelete,
  onUploadPhotos,
  onViewDetails,
  onViewPhotos,
  isDeleting = false,
}) {
  const columns = useMemo(
    () => [
      // Primary Information (Most Important)
      columnHelper.accessor("serial_number", {
        header: "Serial Number",
        cell: (info) => (
          <div className="font-medium text-gray-900 dark:text-white">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("model", {
        header: "Model",
        cell: (info) => (
          <div className="text-gray-700 dark:text-gray-300">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => (
          <div className="text-gray-700 dark:text-gray-300">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const statusColors = getStatusColors();
          let normalizedStatus = info.getValue();
          if (normalizedStatus === "Operational") {
            normalizedStatus = "Active";
          }

          const status = statusColors[normalizedStatus] || statusColors.Active;
          const displayValue = normalizedStatus
            ? normalizedStatus.replace(/_/g, " ")
            : "Unknown";

          return (
            <div className={status.container}>
              <div className={status.dot}></div>
              <span className={status.text}>{displayValue}</span>
            </div>
          );
        },
      }),

      // Performance Metrics (Key Technical Data)
      columnHelper.accessor("flow_rate", {
        header: "Flow Rate",
        cell: (info) => (
          <div className="text-right">
            <span className="font-medium text-gray-900 dark:text-white">
              {info.getValue() ? `${info.getValue()}` : "-"}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              L/min
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("power", {
        header: "Power",
        cell: (info) => (
          <div className="text-right">
            <span className="font-medium text-gray-900 dark:text-white">
              {info.getValue() ? `${info.getValue()}` : "-"}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400">kW</div>
          </div>
        ),
      }),
      columnHelper.accessor("efficiency", {
        header: "Efficiency",
        cell: (info) => (
          <div className="text-right">
            <span className="font-medium text-gray-900 dark:text-white">
              {info.getValue() ? `${info.getValue()}` : "-"}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400">%</div>
          </div>
        ),
      }),

      // Maintenance Information
      columnHelper.accessor("next_maintenance", {
        header: "Maintenance",
        cell: (info) => {
          const date = info.getValue() ? new Date(info.getValue()) : null;
          const today = new Date();
          const daysUntil = date
            ? Math.ceil((date - today) / (1000 * 60 * 60 * 24))
            : null;

          if (!date) {
            return (
              <div className="text-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">
                  -
                </span>
              </div>
            );
          }

          const isOverdue = daysUntil < 0;
          const isUrgent = daysUntil <= 7;
          const isWarning = daysUntil <= 30;

          return (
            <div className="flex flex-col items-center space-y-1">
              {/* Date */}
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {date.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </div>

              {/* Status Text */}
              {daysUntil !== null && (
                <div className="text-center">
                  <span
                    className={`text-xs font-medium ${
                      isOverdue
                        ? "text-red-700 dark:text-red-400"
                        : isUrgent
                        ? "text-orange-700 dark:text-orange-400"
                        : isWarning
                        ? "text-amber-700 dark:text-yellow-400"
                        : "text-emerald-700 dark:text-green-400"
                    }`}
                  >
                    {isOverdue
                      ? `${Math.abs(daysUntil)}d overdue`
                      : isUrgent
                      ? `${daysUntil}d urgent`
                      : isWarning
                      ? `${daysUntil}d`
                      : `${daysUntil}d`}
                  </span>
                </div>
              )}
            </div>
          );
        },
      }),

      // Media & Actions
      columnHelper.accessor("photo_urls", {
        header: "Media",
        cell: (info) => {
          const photoCount = info.getValue() ? info.getValue().length : 0;
          const hasPhotos = photoCount > 0;

          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => onViewPhotos(info.row.original)}
                disabled={!hasPhotos}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  hasPhotos
                    ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                title={hasPhotos ? "View photos" : "No photos available"}
              >
                <span className="font-medium">{photoCount}</span>
                <span>📷</span>
              </button>
            </div>
          );
        },
      }),
      // Actions Column
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex gap-1 justify-center items-center">
            <button
              onClick={() => onViewDetails(info.row.original)}
              className="p-1.5 text-xs font-medium text-slate-500 rounded-md hover:text-[#0272AD] hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200"
              title="View Details"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>

            <button
              onClick={() => onEdit(info.row.original)}
              className="p-1.5 text-xs font-medium text-slate-500 rounded-md hover:text-[#0272AD] hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200"
              title="Edit Pump"
            >
              <PencilIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => onUploadPhotos(info.row.original)}
              className="p-1.5 text-xs font-medium text-slate-500 rounded-md hover:text-[#0272AD] hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200"
              title="Upload Photos"
            >
              <PhotoIcon className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(info.row.original.ccn_pump);
              }}
              disabled={isDeleting}
              className="p-1.5 text-xs font-medium text-slate-500 rounded-md hover:text-red-600 hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete Pump"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <TrashIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [globalFilter, setGlobalFilter] = useState("");

  // Export functionality
  const exportToCSV = () => {
    const headers = columns.map((col) => col.header).join(",");
    const csvContent = [
      headers,
      ...table.getFilteredRowModel().rows.map((row) =>
        columns
          .map((col) => {
            const value = row.getValue(col.id);
            return typeof value === "string" ? `"${value}"` : value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pumps_data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const table = useReactTable({
    data: rows || [],
    columns,
    state: { sorting, pagination, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      {/* Global Search and Export */}
      <div className="mb-4 flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0272AD] focus:border-[#0272AD] dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 text-sm font-medium text-white bg-[#0272AD] border border-transparent rounded-md hover:bg-[#0272AD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0272AD] flex items-center gap-2"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <table className="min-w-full text-sm">
          <thead
            className={
              isDarkMode
                ? "bg-gray-800/50 text-gray-200 border-b border-gray-700"
                : "bg-slate-50 text-slate-700 border-b border-slate-200"
            }
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-4 font-medium text-left select-none cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-700/50 transition-colors text-xs uppercase tracking-wider"
                    title={
                      header.column.getIsSorted() === "asc"
                        ? "Sorted asc"
                        : header.column.getIsSorted() === "desc"
                        ? "Sorted desc"
                        : "Click to sort"
                    }
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && "▲"}
                      {header.column.getIsSorted() === "desc" && "▼"}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={
                  isDarkMode
                    ? `hover:bg-gray-800/50 text-gray-100 transition-colors ${
                        index % 2 === 0 ? "bg-gray-900" : "bg-gray-900/50"
                      }`
                    : `hover:bg-slate-50 text-slate-800 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      }`
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-4 text-left border-b border-slate-100 dark:border-gray-800"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 p-4 bg-slate-50 dark:bg-gray-800/50 rounded-xl border border-slate-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {table.getState().pagination.pageSize === -1 ? (
            <div className="px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md">
              📊 All Results Displayed
            </div>
          ) : (
            <>
              <button
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md hover:bg-slate-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              <button
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md hover:bg-slate-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {table.getState().pagination.pageSize === -1
              ? `Showing all ${table.getFilteredRowModel().rows.length} results`
              : `Showing ${table.getFilteredRowModel().rows.length} of ${
                  table.getPreFilteredRowModel().rows.length
                } results`}
          </span>
          {table.getState().pagination.pageSize !== -1 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          )}
          <select
            className="px-3 py-2 text-sm border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0272AD] focus:border-transparent"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[25, 50, 100, 250, 500, 1000].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
            <option value={-1}>Show All</option>
          </select>
        </div>
      </div>
    </div>
  );
}

PumpTableTanStack.propTypes = {
  rows: PropTypes.array.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUploadPhotos: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onViewPhotos: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
};

export default PumpTableTanStack;
