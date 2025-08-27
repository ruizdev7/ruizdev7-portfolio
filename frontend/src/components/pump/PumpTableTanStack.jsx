import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { PencilIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

// Status colors configuration (same as AG Grid)
const getStatusColors = () => ({
  Active: {
    container: "flex items-center gap-2 text-green-600 dark:text-green-400",
    dot: "w-2 h-2 bg-green-500 rounded-full",
    text: "text-sm font-medium",
  },
  Inactive: {
    container: "flex items-center gap-2 text-gray-600 dark:text-gray-400",
    dot: "w-2 h-2 bg-gray-400 rounded-full",
    text: "text-sm font-medium",
  },
  Maintenance: {
    container: "flex items-center gap-2 text-yellow-700 dark:text-yellow-300",
    dot: "w-2 h-2 bg-yellow-400 rounded-full",
    text: "text-sm font-medium",
  },
  Out_of_Service: {
    container: "flex items-center gap-2 text-orange-700 dark:text-orange-400",
    dot: "w-2 h-2 bg-orange-500 rounded-full",
    text: "text-sm font-medium",
  },
  Standby: {
    container: "flex items-center gap-2 text-blue-600 dark:text-blue-400",
    dot: "w-2 h-2 bg-blue-400 rounded-full",
    text: "text-sm font-medium",
  },
  Repair: {
    container: "flex items-center gap-2 text-rose-700 dark:text-rose-400",
    dot: "w-2 h-2 bg-rose-500 rounded-full",
    text: "text-sm font-medium",
  },
  Testing: {
    container: "flex items-center gap-2 text-purple-700 dark:text-purple-400",
    dot: "w-2 h-2 bg-purple-500 rounded-full",
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
      columnHelper.accessor("ccn_pump", {
        header: "Pump Hash",
        cell: (info) => (
          <button
            onClick={() => onViewDetails(info.row.original)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline hover:no-underline transition-all duration-200 cursor-pointer"
            title="View equipment life sheet"
          >
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor("serial_number", {
        header: "Serial",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("model", {
        header: "Model",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => info.getValue(),
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
      columnHelper.accessor("last_maintenance", {
        header: "Last Maintenance",
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleDateString()
            : "-",
      }),
      columnHelper.accessor("photo_urls", {
        header: "Photos",
        cell: (info) => {
          const photoCount = info.getValue() ? info.getValue().length : 0;
          const hasPhotos = photoCount > 0;

          return (
            <div className="flex items-center justify-center h-full">
              <button
                onClick={() => onViewPhotos(info.row.original)}
                disabled={!hasPhotos}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  hasPhotos
                    ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex gap-2 justify-center items-center h-full">
            <button
              onClick={() => onEdit(info.row.original)}
              className="px-2.5 py-1.5 text-xs font-medium text-blue-500 rounded-lg hover:text-blue-600 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
              title="Edit Pump"
            >
              <PencilIcon className="w-4 h-4 text-gray-500" />
            </button>

            <button
              onClick={() => onUploadPhotos(info.row.original)}
              className="px-2.5 py-1.5 text-xs font-medium text-green-500 rounded-lg hover:text-green-600 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
              title="Upload Photos"
            >
              <PhotoIcon className="w-4 h-4 text-gray-500" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(
                  "🔘 Delete button clicked for pump:",
                  info.row.original.ccn_pump
                );
                onDelete(info.row.original.ccn_pump);
              }}
              disabled={isDeleting}
              className="px-2.5 py-1.5 text-xs font-medium text-red-500 rounded-lg hover:text-red-600 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete Pump"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <TrashIcon className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: rows || [],
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm">
          <thead
            className={
              isDarkMode
                ? "bg-gray-800 text-gray-200 border-b border-gray-700"
                : "bg-gray-50 text-gray-700 border-b border-gray-200"
            }
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-3 py-3 font-semibold text-center select-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={
                  isDarkMode
                    ? `hover:bg-gray-800 text-gray-100 ${
                        index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      }`
                    : `hover:bg-gray-50 text-gray-800 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-3 text-center border-b border-gray-100 dark:border-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <select
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
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
