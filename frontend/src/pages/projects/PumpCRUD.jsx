import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeQuartz } from "ag-grid-community";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useForm } from "react-hook-form";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Tab navigation data
const projectTabs = [
  {
    id: "requirements",
    title: "Especificación del Requerimiento",
    icon: "📋",
  },
  {
    id: "crud",
    title: "CRUD Operations",
    icon: "⚙️",
  },
  {
    id: "analysis",
    title: "Análisis de Datos",
    icon: "📊",
  },
  {
    id: "conclusions",
    title: "Conclusiones",
    icon: "📝",
  },
];

const getStatusColors = (isDark) => ({
  Active: isDark
    ? "bg-green-900 text-green-300 text-xs font-medium me-2 px-2.5 py-0.5 rounded"
    : "bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded",
  Inactive: isDark
    ? "bg-red-900 text-red-300 text-xs font-medium me-2 px-2.5 py-0.5 rounded"
    : "bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded",
  Maintenance: isDark
    ? "bg-yellow-900 text-yellow-300 text-xs font-medium me-2 px-2.5 py-0.5 rounded"
    : "bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded",
  Out_of_Service: isDark
    ? "bg-gray-700 text-gray-300 text-xs font-medium me-2 px-2.5 py-0.5 rounded"
    : "bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded",
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

// Light theme for ag-grid
const lightTheme = themeQuartz.withParams({
  browserColorScheme: "light",
  headerFontSize: 14,
});

const PumpCRUD = () => {
  const [activeTab, setActiveTab] = useState("requirements");
  const [isOpen, setIsOpen] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [editingPump, setEditingPump] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

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
  const statusColors = getStatusColors(isDarkMode);

  // Mock data for pumps - replace with actual API call
  const mockPumpData = [
    {
      id: 1,
      pumpId: "PMP-001",
      model: "Grundfos CR 15-2",
      location: "Building A - Basement",
      status: "Active",
      flowRate: "15 m³/h",
      pressure: "2.5 bar",
      power: "1.5 kW",
      installDate: "2023-01-15",
      lastMaintenance: "2024-11-01",
    },
    {
      id: 2,
      pumpId: "PMP-002",
      model: "Wilo TOP-S 40/10",
      location: "Building B - Roof",
      status: "Maintenance",
      flowRate: "40 m³/h",
      pressure: "1.0 bar",
      power: "0.75 kW",
      installDate: "2022-08-20",
      lastMaintenance: "2024-10-15",
    },
    {
      id: 3,
      pumpId: "PMP-003",
      model: "Grundfos UPS 25-80",
      location: "Building C - Mechanical Room",
      status: "Active",
      flowRate: "3.5 m³/h",
      pressure: "8.0 bar",
      power: "0.35 kW",
      installDate: "2023-06-10",
      lastMaintenance: "2024-09-20",
    },
    {
      id: 4,
      pumpId: "PMP-004",
      model: "KSB Etaline 65-40-200",
      location: "Building A - 2nd Floor",
      status: "Out_of_Service",
      flowRate: "65 m³/h",
      pressure: "4.0 bar",
      power: "5.5 kW",
      installDate: "2021-03-15",
      lastMaintenance: "2024-07-10",
    },
    {
      id: 5,
      pumpId: "PMP-005",
      model: "Wilo Stratos MAXO 25/0.5-12",
      location: "Building D - HVAC Room",
      status: "Active",
      flowRate: "8.2 m³/h",
      pressure: "1.2 bar",
      power: "0.28 kW",
      installDate: "2024-02-28",
      lastMaintenance: "2024-11-15",
    },
    {
      id: 6,
      pumpId: "PMP-006",
      model: "Grundfos MAGNA3 32-120 F",
      location: "Building B - Basement",
      status: "Inactive",
      flowRate: "32 m³/h",
      pressure: "12.0 bar",
      power: "2.8 kW",
      installDate: "2022-05-18",
      lastMaintenance: "2024-08-12",
    },
    {
      id: 7,
      pumpId: "PMP-007",
      model: "KSB Movitec VS 10/09",
      location: "Building C - Water Treatment",
      status: "Active",
      flowRate: "10 m³/h",
      pressure: "9.0 bar",
      power: "3.2 kW",
      installDate: "2023-11-03",
      lastMaintenance: "2024-10-28",
    },
    {
      id: 8,
      pumpId: "PMP-008",
      model: "Wilo CronoLine IL 50/190-7.5/2",
      location: "Building A - Pool Area",
      status: "Maintenance",
      flowRate: "50 m³/h",
      pressure: "1.9 bar",
      power: "7.5 kW",
      installDate: "2021-09-12",
      lastMaintenance: "2024-11-20",
    },
  ];

  useEffect(() => {
    setRowData(mockPumpData);
  }, []);

  // Action buttons renderer
  const ActionButtonsRenderer = (params) => {
    return (
      <div className="flex gap-2 justify-center items-center h-full">
        <button
          onClick={() => handleEdit(params.data)}
          className="px-2.5 py-1.5 text-xs font-medium border-2 border-emerald-500 text-emerald-500 rounded-lg hover:border-emerald-600 hover:text-emerald-600 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
          title="Edit Pump"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          onClick={() => handleDelete(params.data.id)}
          className="px-2.5 py-1.5 text-xs font-medium border-2 border-rose-500 text-rose-500 rounded-lg hover:border-rose-600 hover:text-rose-600 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
          title="Delete Pump"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    );
  };

  // Base column definitions
  const baseColDefs = [
    {
      field: "pumpId",
      headerName: "Pump ID",
      flex: 1,
      filter: true,
      floatingFilter: true,
      pinned: "left",
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "model",
      headerName: "Model",
      flex: 1.5,
      filter: true,
      floatingFilter: true,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "location",
      headerName: "Location",
      flex: 2,
      filter: true,
      floatingFilter: true,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-do_text_light dark:!text-do_text_dark",
      hide: isMobile,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      filter: true,
      floatingFilter: true,
      cellRenderer: (params) => (
        <span className={statusColors[params.value]}>
          {params.value.replace(/_/g, " ")}
        </span>
      ),
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-do_text_light dark:!text-do_text_dark",
    },
    {
      field: "flowRate",
      headerName: "Flow Rate",
      flex: 1,
      filter: true,
      floatingFilter: true,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-do_text_light dark:!text-do_text_dark",
      hide: isMobile,
    },
    {
      field: "pressure",
      headerName: "Pressure",
      flex: 1,
      filter: true,
      floatingFilter: true,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-do_text_light dark:!text-do_text_dark",
      hide: isMobile,
    },
    {
      field: "power",
      headerName: "Power",
      flex: 1,
      filter: true,
      floatingFilter: true,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-do_text_light dark:!text-do_text_dark",
      hide: isMobile,
    },
    {
      field: "lastMaintenance",
      headerName: "Last Maintenance",
      flex: 1.2,
      filter: true,
      floatingFilter: true,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-do_text_light dark:!text-do_text_dark",
      hide: isMobile,
    },
    {
      headerName: "Actions",
      flex: 1.3,
      cellRenderer: ActionButtonsRenderer,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass: "!text-do_text_light dark:!text-do_text_dark",
      sortable: false,
      filter: false,
      minWidth: 140,
    },
  ];

  const [colDefs, setColDefs] = useState(baseColDefs);

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

  // Update columns when screen size changes, including hiding Actions column on mobile
  useEffect(() => {
    setColDefs((prev) =>
      prev.map((column) => ({
        ...column,
        hide:
          (column.field === "location" ||
            column.field === "flowRate" ||
            column.field === "pressure" ||
            column.field === "power" ||
            column.field === "installDate" ||
            column.field === "pumpId" ||
            column.field === "lastMaintenance" ||
            column.headerName === "Actions") &&
          isMobile,
      }))
    );
  }, [isMobile]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const handleEdit = (pump) => {
    setEditingPump(pump);
    setValue("pumpId", pump.pumpId);
    setValue("model", pump.model);
    setValue("location", pump.location);
    setValue("status", pump.status);
    setValue("flowRate", pump.flowRate);
    setValue("pressure", pump.pressure);
    setValue("power", pump.power);
    setValue("installDate", pump.installDate);
    setIsOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this pump?")) {
      setRowData((prev) => prev.filter((pump) => pump.id !== id));
    }
  };

  const onSubmit = handleSubmit((data) => {
    if (editingPump) {
      // Update existing pump
      setRowData((prev) =>
        prev.map((pump) =>
          pump.id === editingPump.id
            ? {
                ...pump,
                ...data,
                lastMaintenance: new Date().toISOString().split("T")[0],
              }
            : pump
        )
      );
    } else {
      // Create new pump
      const newPump = {
        id: Date.now(),
        ...data,
        installDate: new Date().toISOString().split("T")[0],
        lastMaintenance: new Date().toISOString().split("T")[0],
      };
      setRowData((prev) => [...prev, newPump]);
    }

    reset();
    setEditingPump(null);
    setIsOpen(false);
  });

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingPump(null);
    reset();
  };

  // Requirements Content Component
  const RequirementsContent = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
          Especificación del Requerimiento de Software
        </h2>
        <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark">
          Sistema de gestión de bombas industriales
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Functional Requirements */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            Requerimientos Funcionales
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                <strong>CRUD Completo:</strong> Crear, leer, actualizar y
                eliminar registros de bombas
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                <strong>Filtrado y Búsqueda:</strong> Sistema de filtros
                avanzados por múltiples campos
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                <strong>Paginación:</strong> Navegación eficiente para grandes
                conjuntos de datos
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                <strong>Validación de Datos:</strong> Validación en tiempo real
                de formularios
              </span>
            </li>
          </ul>
        </div>

        {/* Non-Functional Requirements */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            Requerimientos No Funcionales
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                <strong>Responsividad:</strong> Adaptable a dispositivos móviles
                y desktop
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                <strong>Usabilidad:</strong> Interfaz intuitiva y fácil de
                navegar
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                <strong>Rendimiento:</strong> Carga rápida y operaciones fluidas
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                <strong>Accesibilidad:</strong> Soporte para temas claro y
                oscuro
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
          <span className="text-2xl">💻</span>
          Especificaciones Técnicas
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
              Frontend
            </h4>
            <ul className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark space-y-1">
              <li>• React 18</li>
              <li>• AG-Grid Community</li>
              <li>• Headless UI</li>
              <li>• React Hook Form</li>
              <li>• Tailwind CSS</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
              Funcionalidades
            </h4>
            <ul className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark space-y-1">
              <li>• Gestión de estado local</li>
              <li>• Validación de formularios</li>
              <li>• Modales responsivos</li>
              <li>• Filtros dinámicos</li>
              <li>• Temas adaptativos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
              Datos
            </h4>
            <ul className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark space-y-1">
              <li>• Datos mock realistas</li>
              <li>• Estados de bomba</li>
              <li>• Métricas técnicas</li>
              <li>• Fechas de mantenimiento</li>
              <li>• Información de ubicación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Data Analysis Content Component
  const DataAnalysisContent = () => {
    // Calculate statistics from mock data
    const totalPumps = rowData.length;
    const activePumps = rowData.filter(
      (pump) => pump.status === "Active"
    ).length;
    const maintenancePumps = rowData.filter(
      (pump) => pump.status === "Maintenance"
    ).length;
    const inactivePumps = rowData.filter(
      (pump) => pump.status === "Inactive"
    ).length;
    const outOfServicePumps = rowData.filter(
      (pump) => pump.status === "Out_of_Service"
    ).length;

    const statusDistribution = [
      {
        status: "Active",
        count: activePumps,
        percentage: ((activePumps / totalPumps) * 100).toFixed(1),
        color: "bg-green-500",
      },
      {
        status: "Maintenance",
        count: maintenancePumps,
        percentage: ((maintenancePumps / totalPumps) * 100).toFixed(1),
        color: "bg-yellow-500",
      },
      {
        status: "Inactive",
        count: inactivePumps,
        percentage: ((inactivePumps / totalPumps) * 100).toFixed(1),
        color: "bg-red-500",
      },
      {
        status: "Out of Service",
        count: outOfServicePumps,
        percentage: ((outOfServicePumps / totalPumps) * 100).toFixed(1),
        color: "bg-gray-500",
      },
    ];

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
            Análisis de Datos
          </h2>
          <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark">
            Estadísticas y métricas del sistema de bombas
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalPumps}
            </div>
            <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
              Total Pumps
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {activePumps}
            </div>
            <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
              Active
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {maintenancePumps}
            </div>
            <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
              Maintenance
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {inactivePumps + outOfServicePumps}
            </div>
            <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
              Inactive/OOS
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-6">
            Distribución por Estado
          </h3>
          <div className="space-y-4">
            {statusDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  {item.status}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                  <div
                    className={`${item.color} h-6 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                    {item.count} ({item.percentage}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
              Análisis por Ubicación
            </h3>
            <div className="space-y-3">
              {Array.from(
                new Set(rowData.map((pump) => pump.location.split(" - ")[0]))
              ).map((building, index) => {
                const count = rowData.filter((pump) =>
                  pump.location.includes(building)
                ).length;
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                      {building}
                    </span>
                    <span className="font-semibold text-do_text_light dark:text-do_text_dark">
                      {count} bombas
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
              Métricas de Rendimiento
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  Eficiencia Operacional
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {((activePumps / totalPumps) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  Bombas en Mantenimiento
                </span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {((maintenancePumps / totalPumps) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  Disponibilidad del Sistema
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {(
                    ((activePumps + maintenancePumps) / totalPumps) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Conclusions Content Component
  const ConclusionsContent = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
          Conclusiones del Proyecto
        </h2>
        <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark">
          Resultados y lecciones aprendidas del desarrollo
        </p>
      </div>

      <div className="grid gap-6">
        {/* Project Success */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Objetivos Alcanzados
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✅</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>Sistema CRUD Completo:</strong> Implementación exitosa
                  de todas las operaciones básicas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✅</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>Interfaz Responsiva:</strong> Adaptación perfecta a
                  diferentes dispositivos
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✅</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>Gestión de Temas:</strong> Sistema automático de
                  detección y cambio de temas
                </span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✅</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>Validación Robusta:</strong> Sistema de validación en
                  tiempo real
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✅</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>Filtrado Avanzado:</strong> Capacidades de búsqueda y
                  filtrado potentes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✅</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>Experiencia de Usuario:</strong> Interfaz intuitiva y
                  fácil de usar
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Technical Insights */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Aspectos Técnicos Destacados
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
                React Moderno
              </h4>
              <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                Uso efectivo de hooks modernos como useState y useEffect para
                gestión de estado local
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
                AG-Grid Integration
              </h4>
              <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                Implementación exitosa de una tabla de datos profesional con
                todas las funcionalidades
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-do_text_light dark:text-do_text_dark mb-2">
                Theme Detection
              </h4>
              <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                Sistema avanzado de detección de temas usando MutationObserver y
                preferencias del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Future Improvements */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Mejoras Futuras
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">📡</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>API Backend:</strong> Integración con una API real
                  para persistencia de datos
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">📊</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>Dashboard Avanzado:</strong> Gráficos y métricas en
                  tiempo real
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">🔐</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>Sistema de Autenticación:</strong> Control de acceso y
                  permisos de usuario
                </span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">📱</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>App Móvil:</strong> Aplicación nativa para
                  dispositivos móviles
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">🔔</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>Notificaciones:</strong> Alertas automáticas para
                  mantenimiento
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">📈</span>
                <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                  <strong>Analytics:</strong> Análisis predictivo y tendencias
                  de uso
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Final Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            Resumen Final
          </h3>
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark text-lg leading-relaxed">
            El proyecto PumpCRUD ha demostrado ser una solución exitosa para la
            gestión de equipos de bombeo, combinando tecnologías modernas de
            React con una experiencia de usuario excepcional. La implementación
            de AG-Grid, junto con un sistema robusto de validación y temas
            adaptativos, resulta en una aplicación profesional y escalable que
            puede servir como base para futuros desarrollos empresariales.
          </p>
        </div>
      </div>
    </div>
  );

  // Main CRUD Content (existing functionality)
  const CRUDContent = () => (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
          Gestión de Bombas
        </h2>
        <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark">
          Monitorea y administra todas las bombas del sistema
        </p>
      </div>
      <div className="container mx-auto max-w-7xl rounded-lg">
        <div className="flex justify-center items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span className="text-xl font-bold">+</span>
            <span className={`${isMobile ? "hidden" : "block"}`}>
              Agregar Nueva Bomba
            </span>
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="container mx-auto max-w-7xl">
        <div
          className={`${
            isDarkMode
              ? "ag-theme-quartz-dark dark:bg-dark_mode_sidebar"
              : "ag-theme-quartz"
          }`}
          style={{ height: 500, width: "100%" }}
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            theme={getCurrentTheme()}
          />
        </div>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "requirements":
        return <RequirementsContent />;
      case "crud":
        return <CRUDContent />;
      case "analysis":
        return <DataAnalysisContent />;
      case "conclusions":
        return <ConclusionsContent />;
      default:
        return <RequirementsContent />;
    }
  };

  return (
    <>
      <section className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
              PumpCRUD Project
            </h1>
            <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark max-w-2xl mx-auto">
              Sistema completo de gestión de bombas industriales con análisis de
              datos
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex justify-between items-center overflow-x-auto">
                {projectTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span
                      className={`${isMobile ? "hidden sm:block" : "block"}`}
                    >
                      {tab.title}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
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
              {/* Pump ID */}
              <div className="relative">
                <input
                  {...register("pumpId", {
                    required: "Pump ID is required",
                    minLength: {
                      value: 3,
                      message: "Pump ID must be at least 3 characters",
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
                  Pump ID
                </label>
                {errors.pumpId && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.pumpId.message}
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
                  {...register("flowRate", {
                    required: "Flow rate is required",
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
                  Flow Rate (e.g., 15 m³/h)
                </label>
                {errors.flowRate && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.flowRate.message}
                  </span>
                )}
              </div>

              {/* Pressure */}
              <div className="relative">
                <input
                  {...register("pressure", {
                    required: "Pressure is required",
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
                  Pressure (e.g., 2.5 bar)
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
                  Power (e.g., 1.5 kW)
                </label>
                {errors.power && (
                  <span className="text-[tomato] text-xs font-semibold block mt-1">
                    {errors.power.message}
                  </span>
                )}
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
                  className="flex-1 h-12 bg-blue-400 text-white rounded-lg font-semibold
                    hover:bg-blue-500 transition-colors flex items-center justify-center"
                >
                  {editingPump ? "Update Pump" : "Create Pump"}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default PumpCRUD;
