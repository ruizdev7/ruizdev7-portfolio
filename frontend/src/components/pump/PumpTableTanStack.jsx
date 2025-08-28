import PropTypes from "prop-types";
import { useMemo, useState, useEffect, Fragment } from "react";
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
import * as XLSX from "xlsx";

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
        header: () => <span className="hidden md:inline">Model</span>,
        cell: (info) => (
          <div className="hidden md:block text-gray-700 dark:text-gray-300">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("location", {
        header: () => <span className="hidden md:inline">Location</span>,
        cell: (info) => (
          <div className="hidden md:block text-gray-700 dark:text-gray-300">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        meta: { thClassName: "w-32", tdClassName: "w-32" },
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
            <div
              className={`${status.container} max-w-[120px] sm:max-w-none truncate`}
            >
              <div className={status.dot}></div>
              <span className={`${status.text} truncate`}>{displayValue}</span>
            </div>
          );
        },
      }),

      // Performance Metrics (Key Technical Data) - Hidden on mobile/tablet
      columnHelper.accessor("flow_rate", {
        header: () => <span className="hidden lg:inline">Flow Rate</span>,
        cell: (info) => (
          <div className="hidden lg:block text-right">
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
        header: () => <span className="hidden lg:inline">Power</span>,
        cell: (info) => (
          <div className="hidden lg:block text-right">
            <span className="font-medium text-gray-900 dark:text-white">
              {info.getValue() ? `${info.getValue()}` : "-"}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400">kW</div>
          </div>
        ),
      }),
      columnHelper.accessor("efficiency", {
        header: () => <span className="hidden lg:inline">Efficiency</span>,
        cell: (info) => (
          <div className="hidden lg:block text-right">
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
            {/* Desktop: Full buttons */}
            <div className="hidden md:flex gap-1">
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

            {/* Tablet & Mobile: Professional action buttons */}
            <div className="md:hidden flex gap-1">
              <button
                onClick={() => toggleRowExpansion(info.row.id)}
                className="p-2 text-slate-500 hover:text-[#0272AD] hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-md"
                title="More"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedRows.has(info.row.id) ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => onViewDetails(info.row.original)}
                className="p-2 text-slate-500 hover:text-[#0272AD] hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-md"
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
                className="p-2 text-slate-500 hover:text-[#0272AD] hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-md"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => onUploadPhotos(info.row.original)}
                className="p-2 text-slate-500 hover:text-[#0272AD] hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-md"
                title="Upload Photos"
              >
                <PhotoIcon className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm("Are you sure you want to delete this pump?")) {
                    onDelete(info.row.original.ccn_pump);
                  }
                }}
                disabled={isDeleting}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <TrashIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ),
      }),
    ],
    []
  );

  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [globalFilter, setGlobalFilter] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest(".export-menu-container")) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportMenu]);

  // Export functionality
  const exportToExcel = () => {
    try {
      // Build list of visible data columns (exclude display-only columns like actions)
      const dataColumns = table
        .getAllLeafColumns()
        .filter((col) =>
          Boolean(col.columnDef.accessorKey || col.columnDef.accessorFn)
        )
        .filter((col) => col.getIsVisible());

      // Resolve header text safely
      const resolveHeader = (col) => {
        const hdr = col.columnDef.header;
        if (typeof hdr === "string") return hdr;
        // Fallback to column id if header is a React node/function
        return col.id || String(col.columnDef.accessorKey || "");
      };

      // Normalize values to primitives for Excel/CSV
      const normalizeValue = (value) => {
        if (value === null || value === undefined) return "";
        if (Array.isArray(value)) return value.length; // e.g., photo_urls count
        if (value instanceof Date) return value.toISOString();
        if (typeof value === "object") return JSON.stringify(value);
        return value;
      };

      const exportData = table.getFilteredRowModel().rows.map((row) => {
        const obj = {};
        dataColumns.forEach((col) => {
          const headerText = resolveHeader(col);
          const cellValue = row.getValue(col.id);
          obj[headerText] = normalizeValue(cellValue);
        });
        return obj;
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths based on header length
      const columnWidths = dataColumns.map((col) => ({
        wch: Math.max(resolveHeader(col).length, 15),
      }));
      worksheet["!cols"] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Pumps Data");

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `pumps_data_${timestamp}.xlsx`;
      XLSX.writeFile(workbook, filename);
      console.log("✅ Excel file exported successfully:", filename);
    } catch (error) {
      console.error("❌ Error exporting to Excel:", error);
      alert("Error exporting to Excel. Please try again.");
    }
  };

  const exportToCSV = () => {
    try {
      const dataColumns = table
        .getAllLeafColumns()
        .filter((col) =>
          Boolean(col.columnDef.accessorKey || col.columnDef.accessorFn)
        )
        .filter((col) => col.getIsVisible());

      const resolveHeader = (col) => {
        const hdr = col.columnDef.header;
        if (typeof hdr === "string") return hdr;
        return col.id || String(col.columnDef.accessorKey || "");
      };

      const normalizeValue = (value) => {
        if (value === null || value === undefined) return "";
        if (Array.isArray(value)) return value.length;
        if (value instanceof Date) return value.toISOString();
        if (typeof value === "object") return JSON.stringify(value);
        return String(value).replace(/\n/g, " ");
      };

      const headers = dataColumns.map((c) => resolveHeader(c));
      const rowsCsv = table.getFilteredRowModel().rows.map((row) =>
        dataColumns
          .map((c) => {
            const v = normalizeValue(row.getValue(c.id));
            const s = String(v).replace(/"/g, '""');
            return `"${s}"`;
          })
          .join(",")
      );

      const csvContent = [headers.join(","), ...rowsCsv].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      a.download = `pumps_data_${timestamp}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      console.log("✅ CSV file exported successfully");
    } catch (error) {
      console.error("❌ Error exporting to CSV:", error);
      alert("Error exporting to CSV. Please try again.");
    }
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
      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        <div className="flex-1">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0272AD] focus:border-[#0272AD] dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="relative export-menu-container sm:self-auto self-end">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0272AD] border border-transparent rounded-md hover:bg-[#0272AD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0272AD] flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export Data
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <button
                onClick={() => {
                  exportToExcel();
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                📊 Export to Excel (.xlsx)
              </button>
              <button
                onClick={() => {
                  exportToCSV();
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                📄 Export to CSV (.csv)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <div className="h-[60vh] md:h-[70vh] lg:h-[600px] overflow-y-auto overscroll-y-contain touch-pan-y scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-gray-600 scrollbar-track-slate-100 dark:scrollbar-track-gray-800">
          <table className="min-w-full text-sm table-fixed">
            <thead
              className={
                isDarkMode
                  ? "bg-gray-800/50 text-gray-200 border-b border-gray-700 sticky top-0 z-10"
                  : "bg-slate-50 text-slate-700 border-b border-slate-200 sticky top-0 z-10"
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
                <Fragment key={row.id}>
                  <tr
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
                        className={`px-4 py-4 text-left border-b border-slate-100 dark:border-gray-800 ${
                          cell.column.columnDef.meta?.tdClassName || ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                  {expandedRows.has(row.id) && (
                    <tr className="md:hidden">
                      <td
                        colSpan={row.getVisibleCells().length}
                        className="px-4 py-3 border-b border-slate-100 dark:border-gray-800"
                      >
                        <div className="rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 p-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-[10px] uppercase text-slate-500">
                                Model
                              </div>
                              <div className="text-sm text-slate-800 dark:text-gray-200">
                                {row.original.model || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-slate-500">
                                Location
                              </div>
                              <div className="text-sm text-slate-800 dark:text-gray-200">
                                {row.original.location || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-slate-500">
                                Flow Rate
                              </div>
                              <div className="text-sm text-slate-800 dark:text-gray-200">
                                {row.original.flow_rate ?? "-"}
                                {row.original.flow_rate ? " L/min" : ""}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-slate-500">
                                Power
                              </div>
                              <div className="text-sm text-slate-800 dark:text-gray-200">
                                {row.original.power ?? "-"}
                                {row.original.power ? " kW" : ""}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-slate-500">
                                Efficiency
                              </div>
                              <div className="text-sm text-slate-800 dark:text-gray-200">
                                {row.original.efficiency ?? "-"}
                                {row.original.efficiency ? "%" : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
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
            {[20, 25, 50, 100, 250, 500, 1000].map((size) => (
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
