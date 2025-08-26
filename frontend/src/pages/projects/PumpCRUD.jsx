import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { PencilIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import { themeQuartz } from "ag-grid-community";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useForm } from "react-hook-form";

import {
  useCreatePumpMutation,
  useUpdatePumpMutation,
  useDeletePumpMutation,
  useUploadPumpPhotosMutation,
  useDeletePumpPhotoMutation,
  useOptimizedPumpsQuery,
} from "../../RTK_Query_app/services/pump/pumpApi";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PropTypes from "prop-types";

// Import the new tab content components
import RequirementsContent from "../../components/pump/RequirementsContent";
import ConclusionsContent from "../../components/pump/ConclusionsContent";
import CRUDContent from "../../components/pump/CRUDContent";
import DataAnalysisContentECharts from "../../components/pump/DataAnalysisContentECharts";

// Tab navigation data (RolesManagement-style tabs with icons)
const projectTabs = [
  {
    id: "requirements",
    title: "Requirements Specification",
    icon: "📋",
  },
  {
    id: "crud",
    title: "CRUD Operations",
    icon: "⚙️",
  },
  {
    id: "analysis",
    title: "Data Analysis",
    icon: "📊",
  },
  {
    id: "conclusions",
    title: "Conclusions",
    icon: "📝",
  },
];

// Colores únicos para cada estado, sin repetir
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

// Función para obtener colores hexadecimales para gráficas
export const getStatusChartColors = () => ({
  Active: "#10B981", // Verde
  Standby: "#3B82F6", // Azul
  Maintenance: "#F59E0B", // Amarillo
  Repair: "#F43F5E", // Rose (rojo)
  Inactive: "#9CA3AF", // Gris
  Testing: "#8B5CF6", // Púrpura
  Out_of_Service: "#F97316", // Naranja
});

// Dark theme for ag-grid
const darkTheme = themeQuartz.withParams({
  // Main background colors
  backgroundColor: "#17181C",
  oddRowBackgroundColor: "#1A1B1F",
  evenRowBackgroundColor: "#17181C",

  // Header styling
  chromeBackgroundColor: "#27282C",
  headerBackgroundColor: "#27282C",
  headerTextColor: "#919191",
  headerFontSize: 14,
  headerFontWeight: 600,
  headerHeight: 48,

  // Text colors
  foregroundColor: "#FFF",
  secondaryForegroundColor: "#B8B8B8",
  subtleTextColor: "#919191",

  // Borders and lines
  borderColor: "#2A2B2F",
  rowBorderColor: "#2A2B2F",

  // Interactive elements
  selectedRowBackgroundColor: "#2563EB20",
  rangeSelectionBackgroundColor: "#2563EB15",

  // Input and filter styling
  inputBackgroundColor: "#27282C",
  inputBorderColor: "#3F4045",
  inputTextColor: "#FFF",
  inputPlaceholderTextColor: "#919191",

  // Buttons and controls
  buttonBackgroundColor: "#27282C",
  buttonTextColor: "#FFF",

  // Scrollbars
  scrollbarThumbBackgroundColor: "#3F4045",
  scrollbarTrackBackgroundColor: "#27282C",

  // Focus and hover states
  cellHorizontalBorder: true,
  rowHoverColor: "#1E1F23",

  // Spacing and sizing
  spacing: 6,
  gridSize: 8,
  rowHeight: 50,

  // Browser scheme
  browserColorScheme: "dark",
});

// Light theme for ag-grid (based on dark theme, but adapted for light)
const lightTheme = themeQuartz.withParams({
  // Main background colors
  backgroundColor: "#F9FAFB",
  oddRowBackgroundColor: "#F3F4F6",
  evenRowBackgroundColor: "#FFFFFF",

  // Header styling
  chromeBackgroundColor: "#E5E7EB",
  headerBackgroundColor: "#E5E7EB",
  headerTextColor: "#374151",
  headerFontSize: 14,
  headerFontWeight: 600,
  headerHeight: 48,

  // Text colors
  foregroundColor: "#111827",
  secondaryForegroundColor: "#6B7280",
  subtleTextColor: "#9CA3AF",

  // Borders and lines
  borderColor: "#D1D5DB",
  rowBorderColor: "#E5E7EB",

  // Interactive elements
  selectedRowBackgroundColor: "#2563EB20",
  rangeSelectionBackgroundColor: "#2563EB10",

  // Input and filter styling
  inputBackgroundColor: "#FFFFFF",
  inputBorderColor: "#D1D5DB",
  inputTextColor: "#111827",
  inputPlaceholderTextColor: "#9CA3AF",

  // Buttons and controls
  buttonBackgroundColor: "#E5E7EB",
  buttonTextColor: "#111827",

  // Scrollbars
  scrollbarThumbBackgroundColor: "#D1D5DB",
  scrollbarTrackBackgroundColor: "#F3F4F6",

  // Focus and hover states
  cellHorizontalBorder: true,
  rowHoverColor: "#F1F5F9",

  // Spacing and sizing
  spacing: 6,
  gridSize: 8,
  rowHeight: 50,

  // Browser scheme
  browserColorScheme: "light",
});

const PumpCRUD = () => {
  const [activeTab, setActiveTab] = useState("crud");
  const [isOpen, setIsOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);
  const [isUploadPhotosOpen, setIsUploadPhotosOpen] = useState(false);
  const [selectedPump, setSelectedPump] = useState(null);
  const [uploadingPump, setUploadingPump] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  // RTK Query hooks - usando completamente el store de Redux con parámetros de paginación
  const {
    data: pumpsData,
    isLoading: pumpsLoading,
    error: pumpsError,
    isFetching: pumpsFetching,
    refetch: refetchPumps,
  } = useOptimizedPumpsQuery({
    page: 1,
    per_page: 1000, // Aumentar límite para cargar más bombas
  });

  // Debug logs
  console.log("🔍 PumpCRUD - pumpsData:", pumpsData);
  console.log("🔍 PumpCRUD - pumpsLoading:", pumpsLoading);
  console.log("🔍 PumpCRUD - pumpsError:", pumpsError);
  console.log("🔍 PumpCRUD - pumpsFetching:", pumpsFetching);

  // Estado local para almacenar todos los datos de bombas
  const [rowData, setRowData] = useState([]);

  const [photoOrder, setPhotoOrder] = useState([]);

  // DnD Sensors - must be outside conditional rendering
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [isMobile, setIsMobile] = useState(false);
  const [editingPump, setEditingPump] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [syncState, setSyncState] = useState("idle"); // 'idle', 'syncing', 'success', 'error'
  const [syncTimeout, setSyncTimeout] = useState(null);

  // lastSyncTime now comes from Redux slice

  // Monitor data changes without forcing refetch
  useEffect(() => {
    if (pumpsData && pumpsData.Pumps) {
      console.log("📊 Data updated:", pumpsData.Pumps.length, "pumps loaded");
    }
  }, [pumpsData]);

  // Detect theme changes more effectively
  useEffect(() => {
    const detectTheme = () => {
      // Check multiple sources for theme detection
      const htmlElement = document.documentElement;
      const bodyElement = document.body;

      // Check for dark class on html or body element
      const hasDarkClassHtml = htmlElement.classList.contains("dark");
      const hasDarkClassBody = bodyElement.classList.contains("dark");

      // Check data attributes (some themes use data-theme)
      const htmlTheme = htmlElement.getAttribute("data-theme");
      const bodyTheme = bodyElement.getAttribute("data-theme");

      // Priority order: explicit theme settings > system preference only as last resort
      let newDarkMode;

      // EXPLICIT DARK MODE: dark class present
      if (hasDarkClassHtml || hasDarkClassBody) {
        newDarkMode = true;
      }
      // EXPLICIT LIGHT MODE: data-theme="light" OR no dark class but has light-related classes
      else if (htmlTheme === "light" || bodyTheme === "light") {
        newDarkMode = false;
      }
      // EXPLICIT DARK MODE: data-theme="dark"
      else if (htmlTheme === "dark" || bodyTheme === "dark") {
        newDarkMode = true;
      }
      // Check for light theme indicators (common class names)
      else if (
        htmlElement.classList.contains("light") ||
        bodyElement.classList.contains("light")
      ) {
        newDarkMode = false;
      }
      // Check if theme was manually set by looking for theme-related classes
      else if (
        htmlElement.className.includes("theme") ||
        bodyElement.className.includes("theme")
      ) {
        // If there are theme classes but no dark class, assume light
        newDarkMode = false;
      }
      // LAST RESORT: system preference only if no theme classes found at all
      else if (!htmlElement.className && !bodyElement.className) {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        newDarkMode = prefersDark;
      }
      // DEFAULT: If we can't determine anything, assume light mode to avoid system preference override
      else {
        newDarkMode = false;
      }

      setIsDarkMode(newDarkMode);
    };

    // Initial detection
    detectTheme();

    // Create observers for both html and body elements
    const htmlObserver = new MutationObserver(detectTheme);
    const bodyObserver = new MutationObserver(detectTheme);

    // Watch for changes on both elements
    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // Also watch system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", detectTheme);

    return () => {
      htmlObserver.disconnect();
      bodyObserver.disconnect();
      mediaQuery.removeEventListener("change", detectTheme);
    };
  }, []);

  // Detecta automáticamente el tema actual
  const getCurrentTheme = () => {
    return isDarkMode ? darkTheme : lightTheme;
  };

  // Badges adaptativos según el tema
  const statusColors = getStatusColors();

  // Use Redux slice for pump data

  // RTK Query mutations
  const [createPump, { isLoading: isCreating }] = useCreatePumpMutation();
  const [updatePump, { isLoading: isUpdating }] = useUpdatePumpMutation();
  const [deletePump, { isLoading: isDeleting }] = useDeletePumpMutation();
  const [uploadPumpPhotos, { isLoading: isUploadingPhotos }] =
    useUploadPumpPhotosMutation();
  const [deletePumpPhoto, { isLoading: isDeletingPhoto }] =
    useDeletePumpPhotoMutation();

  // RTK Query maneja automáticamente la sincronización de datos
  useEffect(() => {
    if (pumpsLoading) {
      setSyncState("syncing");
    } else if (pumpsError) {
      setSyncState("error");
    } else {
      setSyncState("idle");
    }
  }, [pumpsLoading, pumpsError]);

  // Auto-refresh effect - RTK Query maneja el polling automáticamente
  useEffect(() => {
    console.log(
      "🔄 Auto-refresh configured - RTK Query handles polling automatically"
    );
  }, [activeTab, syncState]);

  // Safety timeout to prevent stuck sync state
  useEffect(() => {
    if (syncState === "syncing") {
      const timeout = setTimeout(() => {
        setSyncState("idle");
      }, 10000); // 10 second timeout

      setSyncTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [syncState]);

  // Action buttons renderer
  const ActionButtonsRenderer = (params) => {
    return (
      <div className="flex gap-2 justify-center items-center h-full">
        <button
          onClick={() => handleEdit(params.data)}
          className="px-2.5 py-1.5 text-xs font-medium text-blue-500 rounded-lg hover:text-blue-600 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
          title="Edit Pump"
        >
          <PencilIcon className="w-4 h-4 text-gray-500" />
        </button>

        <button
          onClick={() => handleUploadPhotos(params.data)}
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
              params.data.ccn_pump
            );
            handleDelete(params.data.ccn_pump);
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
    );
  };

  // All column definitions
  const allColDefs = [
    {
      field: "ccn_pump",
      headerName: "Pump Hash",
      width: 120,
      filter: true,
      floatingFilter: true,
      pinned: "left",
      cellRenderer: (params) => {
        return (
          <button
            onClick={() => handleViewPumpDetails(params.data)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline hover:no-underline transition-all duration-200 cursor-pointer"
            title="View equipment life sheet"
          >
            {params.value}
          </button>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-center !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "serial_number",
      headerName: "Serial Number",
      width: 140,
      filter: true,
      floatingFilter: true,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-left !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "model",
      headerName: "Model",
      width: 150,
      filter: true,
      floatingFilter: true,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-left !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "location",
      headerName: "Location",
      width: 180,
      filter: true,
      floatingFilter: true,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-left !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      filter: true,
      floatingFilter: true,
      cellRenderer: (params) => {
        console.log("🔍 Status renderer - Original value:", params.value);
        console.log(
          "🔍 Status renderer - Available statusColors keys:",
          Object.keys(statusColors)
        );

        // Normalizar estados problemáticos
        let normalizedStatus = params.value;
        if (params.value === "Operational") {
          normalizedStatus = "Active";
          console.log(
            "🔍 Status renderer - Normalized 'Operational' to 'Active'"
          );
        }

        console.log(
          "🔍 Status renderer - Normalized status:",
          normalizedStatus
        );
        console.log(
          "🔍 Status renderer - Status exists in statusColors:",
          normalizedStatus in statusColors
        );

        const status = statusColors[normalizedStatus] || statusColors.Active; // Fallback a Active si no existe
        const displayValue = normalizedStatus
          ? normalizedStatus.replace(/_/g, " ")
          : "Unknown";
        console.log("🔍 Status renderer - Display value:", displayValue);
        console.log("🔍 Status renderer - Selected status config:", status);

        return (
          <div
            className={`${status.container} justify-start items-center h-full`}
          >
            <div className={status.dot}></div>
            <span className={status.text}>{displayValue}</span>
          </div>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-left !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "purchase_date",
      headerName: "Purchase Date",
      width: 130,
      filter: true,
      floatingFilter: true,
      sort: "desc", // Ordenamiento descendente por defecto
      sortIndex: 0, // Primera columna en el ordenamiento
      valueFormatter: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString();
        }
        return "";
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-center !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "flow_rate",
      headerName: "Flow Rate (L/min)",
      width: 140,
      filter: true,
      floatingFilter: true,
      valueFormatter: (params) => `${params.value} L/min`,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-center !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "pressure",
      headerName: "Pressure (bar)",
      width: 140,
      filter: true,
      floatingFilter: true,
      valueFormatter: (params) => `${params.value} bar`,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-center !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "power",
      headerName: "Power (kW)",
      width: 120,
      filter: true,
      floatingFilter: true,
      valueFormatter: (params) => `${params.value} kW`,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-center !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "voltage",
      headerName: "Voltage (V)",
      width: 100,
      filter: true,
      floatingFilter: true,
      valueFormatter: (params) => `${params.value}V`,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-center !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "efficiency",
      headerName: "Efficiency (%)",
      width: 130,
      filter: true,
      floatingFilter: true,
      valueFormatter: (params) => `${params.value}%`,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-center !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "last_maintenance",
      headerName: "Last Maintenance",
      width: 150,
      filter: true,
      floatingFilter: true,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-center !text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "photo_urls",
      headerName: "Photos",
      width: 100,
      filter: false,
      valueFormatter: (params) => {
        // Return a simple string representation for AG-Grid
        const photoCount = params.value ? params.value.length : 0;
        return `${photoCount} photo${photoCount !== 1 ? "s" : ""}`;
      },
      cellRenderer: (params) => {
        const photoCount = params.value ? params.value.length : 0;
        const hasPhotos = photoCount > 0;

        return (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => handleViewPhotos(params.data)}
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
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-center !text-do_text_light dark:!text-do_text_dark",
    },
    {
      headerName: "Actions",
      width: 140,
      cellRenderer: ActionButtonsRenderer,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-center !text-do_text_light dark:!text-do_text_dark",
      sortable: false,
      filter: false,
    },
  ];

  // Filter to show only the columns we want by default
  const visibleFields = [
    "ccn_pump",
    "serial_number",
    "model",
    "location",
    "status",
    "purchase_date",
    "last_maintenance",
    "photo_urls",
  ];

  // Create simplified column definitions with content-based width
  const simplifiedColDefs = allColDefs
    .filter((col) => {
      if (col.headerName === "Actions") return true; // Always include Actions
      return visibleFields.includes(col.field);
    })
    .map((col) => ({
      ...col,
      flex: undefined, // Remove flex to use content-based width
      width:
        col.field === "ccn_pump"
          ? 120
          : col.field === "serial_number"
          ? 140
          : col.field === "model"
          ? 150
          : col.field === "location"
          ? 180
          : col.field === "status"
          ? 150
          : col.field === "purchase_date"
          ? 130
          : col.field === "last_maintenance"
          ? 150
          : col.field === "photo_urls"
          ? 100
          : col.headerName === "Actions"
          ? 140
          : 120, // Default width
      resizable: true, // Allow users to resize columns
      suppressSizeToFit: true, // Don't auto-fit to container
    }));

  const [colDefs, setColDefs] = useState(simplifiedColDefs);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const isMobileSize = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(isMobileSize);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update columns when screen size changes
  useEffect(() => {
    setColDefs((prev) =>
      prev.map((column) => ({
        ...column,
        hide:
          isMobile &&
          !["ccn_pump", "status", "photo_urls"].includes(column.field) &&
          column.headerName !== "Actions",
      }))
    );
  }, [isMobile]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const handleEdit = (pump) => {
    console.log("🔍 handleEdit - Pump data:", pump);
    console.log("🔍 handleEdit - Pump status:", pump.status);

    setEditingPump(pump);
    setValue("serial_number", pump.serial_number);
    setValue("model", pump.model);
    setValue("location", pump.location);
    setValue("status", pump.status);
    setValue("flow_rate", pump.flow_rate);
    setValue("pressure", pump.pressure);
    setValue("power", pump.power);
    setValue("voltage", pump.voltage);
    setValue("efficiency", pump.efficiency);
    setValue("current", pump.current);
    setValue("power_factor", pump.power_factor);

    console.log("🔍 handleEdit - Form values set, opening modal...");
    setIsOpen(true);
  };

  const handleDelete = async (ccn_pump) => {
    if (window.confirm("Are you sure you want to delete this pump?")) {
      try {
        console.log("🗑️ Starting deletion of pump:", ccn_pump);

        await deletePump(ccn_pump).unwrap();
        console.log("✅ Pump deletion API call successful");

        // RTK Query invalidates cache automatically, but we also force a refetch
        console.log(
          "🔄 RTK Query will automatically invalidate cache and refetch data"
        );

        // Force immediate table refresh with multiple strategies
        console.log("🔄 Forcing immediate table refresh...");

        // Strategy 1: Force refetch
        await refetchPumps();

        // Strategy 2: Clear RTK Query cache and force reload
        setTimeout(() => {
          console.log("🔄 Clearing cache and forcing page reload...");
          // Clear localStorage to remove any cached data
          localStorage.removeItem("persist:root");
          window.location.reload();
        }, 500);

        console.log(
          "🔄 Delete completed - cache cleared and page will reload shortly"
        );

        toast.success("Pump deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error("Error deleting pump:", error);
        toast.error("Error deleting the pump. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleViewPhotos = (pump) => {
    console.log("📸 Opening photo modal for pump:", pump.ccn_pump);
    console.log("📸 Photo URLs:", pump.photo_urls);
    setSelectedPump(pump);
    setPhotoOrder(pump.photo_urls || []);
    setIsPhotosOpen(true);
  };

  const handleViewPumpDetails = (pump) => {
    // Navigate to pump details view
    window.location.href = `/projects/pump-details/${pump.ccn_pump}`;
  };

  const handleDeletePhoto = async (photoUrl) => {
    if (!selectedPump) {
      toast.error("Error: No pump has been selected", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Extract filename from URL
    const filename = photoUrl.split("/").pop();

    if (window.confirm(`Are you sure you want to delete this photo?`)) {
      try {
        await deletePumpPhoto({
          ccn_pump: selectedPump.ccn_pump,
          photo_filename: filename,
        }).unwrap();

        // Update local state
        setPhotoOrder((prev) => prev.filter((url) => url !== photoUrl));

        // Update the selectedPump state to reflect the change
        setSelectedPump((prev) => ({
          ...prev,
          photo_urls: prev.photo_urls.filter((url) => url !== photoUrl),
        }));

        // Manual refetch to ensure table updates immediately
        await refetchPumps();
        console.log("🔄 Manual refetch completed after photo deletion");

        toast.success("Photo deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error("Error deleting photo:", error);
        toast.error(
          `Error deleting the photo: ${
            error.data?.error || error.message || "Error desconocido"
          }`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPhotoOrder((items) => {
        const oldIndex = items.findIndex((item) => item === active.id);
        const newIndex = items.findIndex((item) => item === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleUploadPhotos = (pump) => {
    setUploadingPump(pump);
    setIsUploadPhotosOpen(true);
  };

  const handleUploadPhotosSubmit = async () => {
    if (!uploadFiles || uploadFiles.length === 0) return;

    try {
      const formData = new FormData();
      uploadFiles.forEach((file) => {
        formData.append("photos", file);
      });

      await uploadPumpPhotos({
        ccn_pump: uploadingPump.ccn_pump,
        body: formData,
      }).unwrap();

      // Manual refetch to ensure table updates immediately
      await refetchPumps();
      console.log("🔄 Manual refetch completed after photo upload");

      toast.success("Photos uploaded successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setUploadFiles([]);
      setIsUploadPhotosOpen(false);
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error(
        `Error uploading photos: ${
          error.data?.error || error.message || "Unknown error"
        }`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log("🔄 Starting pump save process...");
      console.log("📝 Form data:", data);
      console.log("🔧 Editing pump:", editingPump);

      // Create FormData for file upload
      const formData = new FormData();

      // Add all form fields
      Object.keys(data).forEach((key) => {
        if (key !== "photos") {
          formData.append(key, data[key]);
          console.log(`📋 Added field ${key}:`, data[key]);
        }
      });

      // Add photos if any
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach((file) => {
          formData.append("photos", file);
          console.log("📸 Added photo:", file.name);
        });
      }

      // Add required fields
      formData.append("user_id", "1"); // Default user ID

      if (editingPump) {
        console.log("🔄 Updating existing pump:", editingPump.ccn_pump);

        // Update existing pump
        formData.append("purchase_date", editingPump.purchase_date);
        formData.append("last_maintenance", editingPump.last_maintenance);
        formData.append("next_maintenance", editingPump.next_maintenance);

        // Log all form data being sent
        console.log("📤 FormData contents:");
        for (let [key, value] of formData.entries()) {
          console.log("  ", key, "=", value);
          if (key === "status") {
            console.log("🎯 STATUS FIELD FOUND:", value);
          }
        }

        // Also log the original form data object
        console.log("📝 Original form data object:", data);
        console.log("🎯 Status in original data:", data.status);

        console.log("📤 Sending update request...");
        const result = await updatePump({
          ccn_pump: editingPump.ccn_pump,
          body: formData,
        }).unwrap();

        console.log("✅ Update successful:", result);

        // RTK Query invalidates cache automatically, but we also force a refetch
        console.log(
          "🔄 RTK Query will automatically invalidate cache and refetch data"
        );

        // Force immediate table refresh with multiple strategies
        console.log("🔄 Forcing immediate table refresh...");

        // Strategy 1: Force refetch
        await refetchPumps();

        // Strategy 2: Clear RTK Query cache and force reload
        setTimeout(() => {
          console.log("🔄 Clearing cache and forcing page reload...");
          // Clear localStorage to remove any cached data
          localStorage.removeItem("persist:root");
          window.location.reload();
        }, 500);

        console.log(
          "🔄 Update completed - cache cleared and page will reload shortly"
        );

        toast.success("Pump updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        console.log("🆕 Creating new pump...");

        // Create new pump
        formData.append("purchase_date", new Date().toISOString());
        formData.append("last_maintenance", new Date().toISOString());
        formData.append(
          "next_maintenance",
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        ); // 90 days from now

        console.log("📤 Sending create request...");
        const result = await createPump(formData).unwrap();

        console.log("✅ Create successful:", result);

        // RTK Query invalidates cache automatically, but we also force a refetch
        console.log(
          "🔄 RTK Query will automatically invalidate cache and refetch data"
        );

        // Force immediate table refresh with multiple strategies
        console.log("🔄 Forcing immediate table refresh...");

        // Strategy 1: Force refetch
        await refetchPumps();

        // Strategy 2: Clear RTK Query cache and force reload
        setTimeout(() => {
          console.log("🔄 Clearing cache and forcing page reload...");
          // Clear localStorage to remove any cached data
          localStorage.removeItem("persist:root");
          window.location.reload();
        }, 500);

        console.log(
          "🔄 Create completed - cache cleared and page will reload shortly"
        );

        toast.success("Pump created successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      reset();
      setEditingPump(null);
      setIsOpen(false);
      console.log("✅ Form reset and modal closed");
      // RTK Query will automatically refetch the data
    } catch (error) {
      console.error("❌ Error saving pump:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.status,
        data: error.data,
        originalError: error,
      });

      // Mostrar error más específico
      let errorMessage = "Error saving the pump. Please try again.";
      if (error.status === 400) {
        errorMessage = "Invalid data. Please check the form fields.";
      } else if (error.status === 401) {
        errorMessage = "Authentication error. Please log in again.";
      } else if (error.status === 404) {
        errorMessage = "Pump not found.";
      } else if (error.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  });

  // Sortable Photo Item Component
  const SortablePhotoItem = ({ photoUrl, index }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: photoUrl });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative group cursor-move bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200"
      >
        {/* Loading indicator */}
        {imageLoading && (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm text-gray-500">Error loading image</p>
            </div>
          </div>
        )}

        {/* Image */}
        <img
          src={photoUrl}
          alt={`Foto ${index + 1}`}
          className={`w-full h-48 object-cover ${
            imageLoading || imageError ? "hidden" : ""
          }`}
          onLoad={() => {
            console.log("✅ Image loaded successfully:", photoUrl);
            setImageLoading(false);
            setImageError(false);
          }}
          onError={(e) => {
            console.error("❌ Error loading image:", photoUrl, e);
            setImageLoading(false);
            setImageError(true);
          }}
        />

        {/* Delete Button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleDeletePhoto(photoUrl);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-100 transition-opacity duration-200 z-20 cursor-pointer"
          title="Eliminar foto"
          style={{
            border: "2px solid white",
            boxShadow: "0 0 8px rgba(0,0,0,0.3)",
            pointerEvents: "auto",
          }}
        >
          {isDeletingPhoto ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>

        {/* Drag Handle */}
        <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>

        {/* Photo Number */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {index + 1}
        </div>
      </div>
    );
  };

  // PropTypes for SortablePhotoItem
  SortablePhotoItem.propTypes = {
    photoUrl: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingPump(null);
    reset();
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "requirements":
        return <RequirementsContent />;
      case "crud":
        return (
          <CRUDContent
            isLoading={pumpsLoading}
            isError={!!pumpsError}
            error={pumpsError}
            refetch={() => window.location.reload()}
            rowData={rowData}
            colDefs={colDefs}
            isDarkMode={isDarkMode}
            getCurrentTheme={getCurrentTheme}
            isMobile={isMobile}
            setIsOpen={setIsOpen}
            syncState={syncState}
            lastSyncTime={new Date().toISOString()}
            syncTimeout={syncTimeout}
            setSyncState={setSyncState}
            setSyncTimeout={setSyncTimeout}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleUploadPhotos={handleUploadPhotos}
            handleViewPhotos={handleViewPhotos}
            handleViewPumpDetails={handleViewPumpDetails}
            ActionButtonsRenderer={ActionButtonsRenderer}
          />
        );
      case "analysis":
        return <DataAnalysisContentECharts />;
      case "conclusions":
        return <ConclusionsContent />;
      default:
        return <RequirementsContent />;
    }
  };

  // Actualizar rowData cuando pumpsData cambie
  useEffect(() => {
    console.log("🔄 useEffect triggered - pumpsData changed");
    console.log("📊 pumpsData:", pumpsData);
    console.log("📊 pumpsData.Pumps:", pumpsData?.Pumps);

    if (pumpsData && pumpsData.Pumps) {
      console.log(
        "🔍 PumpCRUD - Setting rowData with",
        pumpsData.Pumps.length,
        "pumps"
      );
      console.log("📋 First pump data:", pumpsData.Pumps[0]);
      setRowData(pumpsData.Pumps);
    } else {
      console.log("❌ No pumps data available");
    }
  }, [pumpsData]);

  return (
    <>
      <section className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
              Pump Management System
            </h1>
            <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark max-w-2xl mx-auto">
              This is a project that allows you to manage the pumps in the
              database.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4">
              {projectTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 sm:px-6 font-medium text-sm transition-all duration-300 flex items-center justify-center ${
                    activeTab === tab.id
                      ? "glass-tab active text-blue-600 dark:text-blue-400"
                      : "glass-tab text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span
                    className={`ml-2 ${
                      isMobile ? "hidden sm:inline" : "inline"
                    }`}
                  >
                    {tab.title}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">{renderTabContent()}</div>
        </div>
      </section>

      {/* Create/Edit Pump Dialog */}
      <Dialog
        open={isOpen}
        onClose={handleCloseDialog}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-3xl w-full bg-[#23262F] p-8 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <DialogTitle className="text-4xl text-white font-bold hover:text-blue-400 transition-colors">
                {editingPump ? "Edit Pump" : "Create New Pump"}
              </DialogTitle>
              <Description className="text-xl text-center uppercase font-bold tracking-[3px] text-white mt-2">
                Pump<span className="ml-2 text-blue-400">Management</span>
              </Description>
            </div>

            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6"
            >
              {/* Serial Number */}
              <div className="relative">
                <input
                  {...register("serial_number", {
                    required: "Serial number is required",
                    pattern: {
                      value: /^[A-Z0-9-]+$/,
                      message:
                        "Serial number must contain only uppercase letters, numbers, and hyphens",
                    },
                    minLength: {
                      value: 3,
                      message: "Serial number must be at least 3 characters",
                    },
                  })}
                  type="text"
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                  placeholder=" "
                />
                <label
                  className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                  peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
                  peer-focus:text-blue-400 bg-[#2C2F36]"
                >
                  Serial Number
                </label>
                {errors.serial_number && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.serial_number.message}
                  </span>
                )}
              </div>

              {/* Model */}
              <div className="relative">
                <input
                  {...register("model", {
                    required: "Model is required",
                  })}
                  type="text"
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                  placeholder=" "
                />
                <label
                  className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                  peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
                  peer-focus:text-blue-400 bg-[#2C2F36]"
                >
                  Model
                </label>
                {errors.model && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.model.message}
                  </span>
                )}
              </div>

              {/* Location - Full width */}
              <div className="relative md:col-span-2">
                <input
                  {...register("location", {
                    required: "Location is required",
                  })}
                  type="text"
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                  placeholder=" "
                />
                <label
                  className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                  peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
                  peer-focus:text-blue-400 bg-[#2C2F36]"
                >
                  Location
                </label>
                {errors.location && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.location.message}
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="relative">
                <select
                  {...register("status", {
                    required: "Status is required",
                  })}
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white focus:border-blue-400 focus:outline-none appearance-none"
                >
                  <option value="" className="bg-[#2C2F36]">
                    Select status
                  </option>
                  <option value="Active" className="bg-[#2C2F36]">
                    Active
                  </option>
                  <option value="Inactive" className="bg-[#2C2F36]">
                    Inactive
                  </option>
                  <option value="Maintenance" className="bg-[#2C2F36]">
                    Maintenance
                  </option>
                  <option value="Out_of_Service" className="bg-[#2C2F36]">
                    Out of Service
                  </option>
                  <option value="Repair" className="bg-[#2C2F36]">
                    Repair
                  </option>
                  <option value="Testing" className="bg-[#2C2F36]">
                    Testing
                  </option>
                  <option value="Standby" className="bg-[#2C2F36]">
                    Standby
                  </option>
                </select>
                <label className="absolute left-3 -top-2.5 px-1 text-sm text-blue-400 bg-[#2C2F36]">
                  Status
                </label>
                {errors.status && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.status.message}
                  </span>
                )}
              </div>

              {/* Flow Rate */}
              <div className="relative">
                <input
                  {...register("flow_rate", {
                    required: "Flow rate is required",
                    pattern: {
                      value: /^\d+(\.\d+)?$/,
                      message: "Flow rate must be a valid number",
                    },
                    min: {
                      value: 0,
                      message: "Flow rate must be positive",
                    },
                    max: {
                      value: 10000,
                      message: "Flow rate must be less than 10,000 L/min",
                    },
                  })}
                  type="number"
                  step="0.1"
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                  placeholder=" "
                />
                <label
                  className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                  peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
                  peer-focus:text-blue-400 bg-[#2C2F36]"
                >
                  Flow Rate (L/min)
                </label>
                {errors.flow_rate && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.flow_rate.message}
                  </span>
                )}
              </div>

              {/* Pressure */}
              <div className="relative">
                <input
                  {...register("pressure", {
                    required: "Pressure is required",
                    pattern: {
                      value: /^\d+(\.\d+)?$/,
                      message: "Pressure must be a valid number",
                    },
                    min: {
                      value: 0,
                      message: "Pressure must be positive",
                    },
                    max: {
                      value: 1000,
                      message: "Pressure must be less than 1,000 bar",
                    },
                  })}
                  type="number"
                  step="0.1"
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                  placeholder=" "
                />
                <label
                  className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                  peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
                  peer-focus:text-blue-400 bg-[#2C2F36]"
                >
                  Pressure (bar)
                </label>
                {errors.pressure && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.pressure.message}
                  </span>
                )}
              </div>

              {/* Power */}
              <div className="relative">
                <input
                  {...register("power", {
                    required: "Power is required",
                    pattern: {
                      value: /^\d+(\.\d+)?$/,
                      message: "Power must be a valid number",
                    },
                    min: {
                      value: 0,
                      message: "Power must be positive",
                    },
                    max: {
                      value: 10000,
                      message: "Power must be less than 10,000 kW",
                    },
                  })}
                  type="number"
                  step="0.1"
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                  placeholder=" "
                />
                <label
                  className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                  peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
                  peer-focus:text-blue-400 bg-[#2C2F36]"
                >
                  Power (kW)
                </label>
                {errors.power && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.power.message}
                  </span>
                )}
              </div>

              {/* Voltage */}
              <div className="relative">
                <select
                  {...register("voltage", {
                    required: "Voltage is required",
                  })}
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white focus:border-blue-400 focus:outline-none appearance-none"
                >
                  <option value="" className="bg-[#2C2F36]">
                    Select voltage
                  </option>
                  <option value="220" className="bg-[#2C2F36]">
                    220V
                  </option>
                  <option value="380" className="bg-[#2C2F36]">
                    380V
                  </option>
                  <option value="440" className="bg-[#2C2F36]">
                    440V
                  </option>
                  <option value="480" className="bg-[#2C2F36]">
                    480V
                  </option>
                </select>
                <label className="absolute left-3 -top-2.5 px-1 text-sm text-blue-400 bg-[#2C2F36]">
                  Voltage
                </label>
                {errors.voltage && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.voltage.message}
                  </span>
                )}
              </div>

              {/* Efficiency */}
              <div className="relative">
                <input
                  {...register("efficiency", {
                    required: "Efficiency is required",
                    pattern: {
                      value: /^\d+(\.\d+)?$/,
                      message: "Efficiency must be a valid number",
                    },
                    min: {
                      value: 0,
                      message: "Efficiency must be positive",
                    },
                    max: {
                      value: 100,
                      message: "Efficiency must be between 0 and 100%",
                    },
                  })}
                  type="number"
                  step="0.1"
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                  placeholder=" "
                />
                <label
                  className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                  peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
                  peer-focus:text-blue-400 bg-[#2C2F36]"
                >
                  Efficiency (%)
                </label>
                {errors.efficiency && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.efficiency.message}
                  </span>
                )}
              </div>

              {/* Current */}
              <div className="relative">
                <input
                  {...register("current", {
                    required: "Current is required",
                    pattern: {
                      value: /^\d+(\.\d+)?$/,
                      message: "Current must be a valid number",
                    },
                    min: {
                      value: 0,
                      message: "Current must be positive",
                    },
                    max: {
                      value: 1000,
                      message: "Current must be less than 1,000 A",
                    },
                  })}
                  type="number"
                  step="0.1"
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                  placeholder=" "
                />
                <label
                  className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                  peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
                  peer-focus:text-blue-400 bg-[#2C2F36]"
                >
                  Current (A)
                </label>
                {errors.current && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.current.message}
                  </span>
                )}
              </div>

              {/* Power Factor */}
              <div className="relative">
                <input
                  {...register("power_factor", {
                    required: "Power factor is required",
                    pattern: {
                      value: /^\d+(\.\d+)?$/,
                      message: "Power factor must be a valid number",
                    },
                    min: {
                      value: 0,
                      message: "Power factor must be positive",
                    },
                    max: {
                      value: 1,
                      message: "Power factor must be between 0 and 1",
                    },
                  })}
                  type="number"
                  step="0.01"
                  className="peer h-12 w-full rounded-lg border-2 border-gray-600 bg-[#2C2F36] px-4 text-white placeholder-transparent focus:border-blue-400 focus:outline-none"
                  placeholder=" "
                />
                <label
                  className="absolute left-3 -top-2.5 px-1 text-sm text-gray-400 transition-all
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                  peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm
                  peer-focus:text-blue-400 bg-[#2C2F36]"
                >
                  Power Factor
                </label>
                {errors.power_factor && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.power_factor.message}
                  </span>
                )}
              </div>

              {/* Photo Upload */}
              <div className="relative col-span-full">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 bg-[#2C2F36] hover:border-blue-400 transition-colors">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📷</div>
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Click to upload photos
                    </label>
                    <p className="text-gray-400 text-sm mt-2">
                      PNG, JPG, JPEG, GIF, WEBP up to 5MB each
                    </p>
                    <input
                      id="photo-upload"
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.gif,.webp"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setValue("photos", files);
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Selected Files Preview */}
                  {watch("photos") && watch("photos").length > 0 && (
                    <div className="mt-4">
                      <p className="text-white text-sm font-medium mb-2">
                        Selected files ({watch("photos").length}):
                      </p>
                      <div className="space-y-2">
                        {watch("photos").map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-700 rounded px-3 py-2"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400">📄</span>
                              <span className="text-white text-sm">
                                {file.name}
                              </span>
                              <span className="text-gray-400 text-xs">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = watch("photos").filter(
                                  (_, i) => i !== index
                                );
                                setValue("photos", newFiles);
                              }}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons - Full width */}
              <div className="md:col-span-2 flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="flex-1 h-12 bg-gray-600 text-white rounded-lg font-semibold
                    hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 h-12 bg-blue-400 text-white rounded-lg font-semibold
                  hover:bg-blue-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating || isUpdating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingPump ? "Updating..." : "Creating..."}
                    </div>
                  ) : editingPump ? (
                    "Update Pump"
                  ) : (
                    "Create Pump"
                  )}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Photos Modal */}
      <Dialog
        open={isPhotosOpen}
        onClose={() => setIsPhotosOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-6xl w-full bg-[#23262F] p-8 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-center flex-1">
                <DialogTitle className="text-3xl text-white font-bold">
                  Photos - {selectedPump?.model}
                </DialogTitle>
                <Description className="text-lg text-gray-400 mt-2">
                  {selectedPump?.serial_number} | {selectedPump?.location}
                </Description>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {photoOrder.length} photo{photoOrder.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => setIsPhotosOpen(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Photos Grid with Drag & Drop */}
            {photoOrder && photoOrder.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={photoOrder}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {photoOrder.map((photoUrl, index) => (
                      <SortablePhotoItem
                        key={photoUrl}
                        photoUrl={photoUrl}
                        index={index}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-gray-400 text-lg">
                  No photos available for this pump
                </p>
              </div>
            )}

            {/* Instructions */}
            {photoOrder && photoOrder.length > 0 && (
              <div className="mt-6 p-4 bg-[#2C2F36] rounded-lg">
                <div className="text-center text-gray-400 text-sm">
                  <p>
                    💡 <strong>Tip:</strong> Drag photos to reorder them • Hover
                    to see delete button • Click to view full size
                  </p>
                </div>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      {/* Upload Photos Modal */}
      <Dialog
        open={isUploadPhotosOpen}
        onClose={() => setIsUploadPhotosOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-2xl w-full bg-[#23262F] p-8 rounded-xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <DialogTitle className="text-3xl text-white font-bold">
                Upload Photos
              </DialogTitle>
              <Description className="text-lg text-gray-400 mt-2">
                {uploadingPump?.model} - {uploadingPump?.serial_number}
              </Description>
            </div>

            {/* Upload Form */}
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 bg-[#2C2F36] hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <div className="text-4xl mb-4">📷</div>
                  <label
                    htmlFor="upload-photo-input"
                    className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Click to upload photos
                  </label>
                  <p className="text-gray-400 text-sm mt-2">
                    PNG, JPG, JPEG, GIF, WEBP up to 5MB each
                  </p>
                  <input
                    id="upload-photo-input"
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.gif,.webp"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setUploadFiles(files);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Selected Files Preview */}
                {uploadFiles && uploadFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-white text-sm font-medium mb-2">
                      Selected files ({uploadFiles.length}):
                    </p>
                    <div className="space-y-2">
                      {uploadFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-700 rounded px-3 py-2"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-400">📄</span>
                            <span className="text-white text-sm">
                              {file.name}
                            </span>
                            <span className="text-gray-400 text-xs">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = uploadFiles.filter(
                                (_, i) => i !== index
                              );
                              setUploadFiles(newFiles);
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex gap-4">
                <button
                  onClick={handleUploadPhotosSubmit}
                  disabled={
                    !uploadFiles ||
                    uploadFiles.length === 0 ||
                    isUploadingPhotos
                  }
                  className="flex-1 h-12 bg-blue-400 text-white rounded-lg font-semibold
                    hover:bg-blue-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingPhotos ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </div>
                  ) : (
                    "Upload Photos"
                  )}
                </button>
                <button
                  onClick={() => setIsUploadPhotosOpen(false)}
                  className="flex-1 h-12 bg-gray-600 text-white rounded-lg font-semibold
                    hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default PumpCRUD;
