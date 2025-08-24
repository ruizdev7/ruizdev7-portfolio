import { useMemo, useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import NumberFlow from "@number-flow/react";
import * as echarts from "echarts";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

// Configuración global de ECharts para optimizar rendimiento
echarts.registerPreprocessor((option) => {
  // Optimizar opciones para mejor rendimiento
  if (option.animation !== false) {
    option.animation = false; // Desactivar animaciones para mejor rendimiento
  }
  // Configurar opciones globales para mejor rendimiento
  option.useUTC = true;
  option.animationDuration = 0;
  option.animationEasing = "linear";
  return option;
});

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useOptimizedPumpsSummaryQuery,
  useOptimizedPumpsStatusDistributionQuery,
  useOptimizedPumpsByLocationQuery,
  useOptimizedPumpsNumericStatsQuery,
  useOptimizedPumpsQuery,
} from "../../RTK_Query_app/services/pump/pumpApi";
import { getStatusChartColors } from "../../pages/projects/PumpCRUD";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../RTK_Query_app/state_slices/authSlice";

// Sortable Chart Item Component
const SortableChartItem = ({
  chartId,
  children,
  isDark,
  isExpanded,
  onToggleExpansion,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chartId });

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
      className={`relative group cursor-move bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 ${
        isDragging ? "z-50" : ""
      }`}
    >
      {/* Drag Handle */}
      <div
        className={`absolute top-2 left-2 ${
          isDark
            ? "bg-gray-800 bg-opacity-50 text-white"
            : "bg-gray-100 bg-opacity-90 text-gray-700 border border-gray-300"
        } rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20`}
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
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggleExpansion(chartId);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className={`absolute top-2 right-2 ${
          isDark
            ? "bg-gray-800 bg-opacity-50 text-white"
            : "bg-gray-100 bg-opacity-90 text-gray-700 border border-gray-300"
        } rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 cursor-pointer hover:bg-opacity-70`}
        title={isExpanded ? "Contraer gráfica" : "Expandir gráfica"}
        style={{
          boxShadow: isDark
            ? "0 0 8px rgba(0,0,0,0.3)"
            : "0 2px 4px rgba(0,0,0,0.1)",
          pointerEvents: "auto",
        }}
      >
        {isExpanded ? (
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
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        )}
      </button>

      {/* Chart Content */}
      <div className="p-4 md:p-6">{children}</div>

      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center">
          <div className="text-blue-500 text-lg font-semibold">
            Moving chart...
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes for SortableChartItem
SortableChartItem.propTypes = {
  chartId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isDark: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggleExpansion: PropTypes.func.isRequired,
};

const DataAnalysisContentECharts = () => {
  // Estados de sincronización
  const [syncState, setSyncState] = useState("idle"); // 'idle', 'syncing', 'success', 'error'

  // Estado para el orden de las gráficas
  const [chartOrder, setChartOrder] = useState([
    "status-bar",
    "status-donut",
    "performance-pie",
    "location-bar",
    "location-horizontal",
    "numeric-means",
    "combination",
    "scatter",
    "bubble",
    "status-line",
  ]);

  // Estado para gráficas expandidas
  const [expandedCharts, setExpandedCharts] = useState(new Set());
  const [showKPIs, setShowKPIs] = useState(false);

  // Redux hooks
  const dispatch = useDispatch();

  // Verificar estado de autenticación
  const authState = useSelector((state) => state.auth);
  console.log("🔐 Current auth state:", {
    isAuthenticated: !!authState?.token,
    tokenExists: !!authState?.token,
    refreshTokenExists: !!authState?.refreshToken,
    user: authState?.current_user,
  });

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // RTK Query hooks optimizados con todas las características de sincronización
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useOptimizedPumpsSummaryQuery();

  console.log("🔍 Summary hook:", {
    summaryLoading,
    summaryError: !!summaryError,
    summaryData: !!summaryData,
  });
  if (summaryError) {
    console.error("❌ Summary hook error details:", {
      status: summaryError.status,
      data: summaryError.data,
      message: summaryError.message,
      originalStatus: summaryError.originalStatus,
    });
  }

  const {
    data: statusDistributionData,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatusDistribution,
  } = useOptimizedPumpsStatusDistributionQuery();

  console.log("🔍 Status hook:", {
    statusLoading,
    statusError: !!statusError,
    statusDistributionData: !!statusDistributionData,
  });
  if (statusError) {
    console.error("❌ Status hook error details:", {
      status: statusError.status,
      data: statusError.data,
      message: statusError.message,
      originalStatus: statusError.originalStatus,
    });
  }

  const {
    data: locationData,
    isLoading: locationLoading,
    error: locationError,
    refetch: refetchLocation,
  } = useOptimizedPumpsByLocationQuery();

  console.log("🔍 Location hook:", {
    locationLoading,
    locationError: !!locationError,
    locationData: !!locationData,
  });
  if (locationError) {
    console.error("❌ Location hook error details:", {
      status: locationError.status,
      data: locationError.data,
      message: locationError.message,
      originalStatus: locationError.originalStatus,
    });
  }

  const {
    data: numericStatsData,
    isLoading: numericStatsLoading,
    error: numericStatsError,
    refetch: refetchNumericStats,
  } = useOptimizedPumpsNumericStatsQuery();

  console.log("🔍 NumericStats hook:", {
    numericStatsLoading,
    numericStatsError: !!numericStatsError,
    numericStatsData: !!numericStatsData,
  });
  if (numericStatsError) {
    console.error("❌ NumericStats hook error details:", {
      status: numericStatsError.status,
      data: numericStatsError.data,
      message: numericStatsError.message,
      originalStatus: numericStatsError.originalStatus,
    });
  }

  const {
    data: pumpsListData,
    isLoading: pumpsLoading,
    error: pumpsError,
    refetch: refetchPumps,
  } = useOptimizedPumpsQuery();

  console.log("🔍 Pumps hook:", {
    pumpsLoading,
    pumpsError: !!pumpsError,
    pumpsListData: !!pumpsListData,
  });

  // Debug logs para entender el estado de los hooks
  console.log("🔍 DataAnalysisContentECharts - Hook States:", {
    summaryLoading,
    statusLoading,
    locationLoading,
    numericStatsLoading,
    pumpsLoading,
    summaryError: !!summaryError,
    statusError: !!statusError,
    locationError: !!locationError,
    numericStatsError: !!numericStatsError,
    pumpsError: !!pumpsError,
    summaryData: !!summaryData,
    statusDistributionData: !!statusDistributionData,
    locationData: !!locationData,
    numericStatsData: !!numericStatsData,
    pumpsListData: !!pumpsListData,
  });

  // Forzar la ejecución de los hooks de análisis cuando el componente se monta
  useEffect(() => {
    console.log("🚀 Forcing analysis hooks execution...");
    refetchSummary();
    refetchStatusDistribution();
    refetchLocation();
    refetchNumericStats();
  }, [
    refetchSummary,
    refetchStatusDistribution,
    refetchLocation,
    refetchNumericStats,
  ]);

  // Función de refresh manual
  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    setSyncState("syncing");

    try {
      // Refetch todos los datos
      const results = await Promise.all([
        refetchSummary(),
        refetchStatusDistribution(),
        refetchLocation(),
        refetchNumericStats(),
        refetchPumps(),
      ]);

      console.log("✅ Manual refresh completed successfully");
      console.log("📊 Summary data updated:", results[0]?.data);
      console.log("📊 Status distribution updated:", results[1]?.data);
      console.log("📊 Location data updated:", results[2]?.data);
      console.log("📊 Numeric stats updated:", results[3]?.data);
      console.log("📊 Pumps list updated:", results[4]?.data);

      setSyncState("success");
      setTimeout(() => setSyncState("idle"), 2000);
    } catch (error) {
      console.error("❌ Refresh error:", error);
      setSyncState("error");
      setTimeout(() => setSyncState("idle"), 3000);
    }
  };

  // Handle drag end for charts
  const handleChartDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setChartOrder((items) => {
        const oldIndex = items.findIndex((item) => item === active.id);
        const newIndex = items.findIndex((item) => item === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle chart expansion
  const toggleChartExpansion = (chartId) => {
    setExpandedCharts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chartId)) {
        newSet.delete(chartId);
      } else {
        newSet.add(chartId);
      }
      return newSet;
    });
  };

  // Check if a chart is expanded
  const isChartExpanded = (chartId) => expandedCharts.has(chartId);

  // Effect para mostrar KPIs con delay y manejar actualizaciones
  useEffect(() => {
    if (summaryData && !summaryLoading) {
      // Si es la primera carga, usar delay más largo
      const isFirstLoad = !showKPIs;
      const delay = isFirstLoad ? 800 : 300;

      const timer = setTimeout(() => {
        setShowKPIs(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [summaryData, summaryLoading, showKPIs]);

  // Auto-refresh effect - refetch data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Solo hacer auto-refresh si estamos en idle
      if (syncState === "idle") {
        console.log("🔄 Auto-refresh triggered");
        // Refetch sin cambiar el estado visual
        Promise.all([
          refetchSummary(),
          refetchStatusDistribution(),
          refetchLocation(),
          refetchNumericStats(),
          refetchPumps(),
        ])
          .then((results) => {
            console.log("✅ Auto-refresh completed");
            console.log("📊 Data freshness check:", {
              summary: results[0]?.data?.total_pumps,
              status: results[1]?.data?.distribution?.length,
              location: results[2]?.data?.locations?.length,
              numeric: Object.keys(results[3]?.data?.stats || {}).length,
              pumps: results[4]?.data?.Pumps?.length,
            });
          })
          .catch((error) => {
            console.error("❌ Auto-refresh error:", error);
          });
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [
    syncState,
    refetchSummary,
    refetchStatusDistribution,
    refetchLocation,
    refetchNumericStats,
    refetchPumps,
  ]);

  // Effect para detectar cambios en los datos y actualizar automáticamente
  useEffect(() => {
    if (summaryData && !summaryLoading) {
      console.log("📊 Summary data changed:", {
        total_pumps: summaryData.total_pumps,
        status_counts: summaryData.status,
        metrics: summaryData.metrics,
      });
    }
  }, [summaryData, summaryLoading]);

  useEffect(() => {
    if (statusDistributionData && !statusLoading) {
      console.log(
        "📊 Status distribution changed:",
        statusDistributionData.distribution
      );
    }
  }, [statusDistributionData, statusLoading]);

  useEffect(() => {
    if (locationData && !locationLoading) {
      console.log("📊 Location data changed:", locationData.locations);
    }
  }, [locationData, locationLoading]);

  useEffect(() => {
    if (numericStatsData && !numericStatsLoading) {
      console.log("📊 Numeric stats changed:", numericStatsData.stats);
    }
  }, [numericStatsData, numericStatsLoading]);

  // Safety timeout to prevent stuck sync state
  useEffect(() => {
    if (syncState === "syncing") {
      const timeout = setTimeout(() => {
        setSyncState("idle");
      }, 10000); // 10 second timeout

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [syncState]);

  const isDark = useMemo(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
    []
  );

  if (
    summaryLoading ||
    statusLoading ||
    locationLoading ||
    numericStatsLoading ||
    pumpsLoading
  ) {
    console.log("🔍 DataAnalysisContentECharts - Loading states:", {
      summaryLoading,
      statusLoading,
      locationLoading,
      numericStatsLoading,
      pumpsLoading,
    });

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
            Loading data analysis...
          </p>
        </div>
      </div>
    );
  }

  // Función para manejar errores de autenticación
  const handleAuthError = () => {
    console.log("🔐 Authentication error detected, redirecting to login...");
    window.location.href = "/auth";
  };

  // Verificar si hay errores de autenticación (401)
  const hasAuthError =
    (summaryError && summaryError.status === 401) ||
    (statusError && statusError.status === 401) ||
    (locationError && locationError.status === 401) ||
    (numericStatsError && numericStatsError.status === 401) ||
    (pumpsError && pumpsError.status === 401);

  // Si hay error de autenticación, redirigir al login
  if (hasAuthError) {
    handleAuthError();
    return null;
  }

  // Si hay otros errores, mostrar mensaje de error
  if (
    summaryError ||
    statusError ||
    locationError ||
    numericStatsError ||
    pumpsError
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 mb-2">
            Error loading analysis data
          </p>
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark text-sm mb-4">
            Check your connection and access permissions
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => {
                console.log("🔄 Manual token refresh triggered");
                // Forzar refresh de todos los hooks
                refetchSummary();
                refetchStatusDistribution();
                refetchLocation();
                refetchNumericStats();
                refetchPumps();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Refresh Data
            </button>
            <button
              onClick={() => {
                console.log("🚪 Logout triggered");
                // Limpiar localStorage
                localStorage.removeItem("jwt_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("auth_state");
                // Redirigir al login
                window.location.href = "/auth";
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout & Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPumps = summaryData?.total_pumps || 0;
  const statusCounts = summaryData?.status || {};
  const metrics = summaryData?.metrics || {};
  const distribution = statusDistributionData?.distribution || [];

  const locations = locationData?.locations || [];
  const pumps = pumpsListData?.Pumps || [];

  // Log cuando los datos se cargan exitosamente
  console.log("✅ DataAnalysisContentECharts - Data loaded successfully:", {
    totalPumps,
    statusCounts: Object.keys(statusCounts).length,
    distribution: distribution.length,
    locations: locations.length,
    pumps: pumps.length,
  });

  // Lista completa de todos los estados posibles
  const allPossibleStatuses = [
    "Active",
    "Standby",
    "Maintenance",
    "Repair",
    "Inactive",
    "Testing",
  ];

  // Obtener colores de la paleta centralizada
  const statusColors = getStatusChartColors();
  const getStatusColor = (status) => statusColors[status] || "#6B7280";

  // Crear distribución completa incluyendo estados con conteo 0
  const completeDistribution = allPossibleStatuses.map((status) => {
    const existingData = distribution.find((d) => d.status === status);
    return existingData || { status, count: 0, percentage: 0 };
  });

  const numericStatsArray = Object.entries(numericStatsData?.stats || {}).map(
    ([metric, stats]) => ({ metric, ...(stats || {}) })
  );

  const scatterData = pumps.map((p) => [
    Number(p.flow_rate),
    Number(p.pressure),
    Number(p.power),
    Number(p.efficiency),
  ]);

  // Colores optimizados para tema claro y oscuro
  const baseTextColor = isDark ? "#e5e7eb" : "#1f2937";
  const secondaryTextColor = isDark ? "#9ca3af" : "#6b7280";
  const backgroundColor = isDark ? "transparent" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#e5e7eb";
  const gridColor = isDark ? "#374151" : "#f3f4f6";

  const baseGrid = {
    left: 48,
    right: 24,
    top: 80,
    bottom: 60,
    borderColor: borderColor,
    backgroundColor: backgroundColor,
  };

  const statusBarOption = {
    backgroundColor: backgroundColor,
    animation: false, // Desactivar animaciones para mejor rendimiento
    title: {
      text: "Status Distribution",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      borderColor: borderColor,
      textStyle: { color: baseTextColor },
      extraCssText: isDark
        ? ""
        : "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);",
    },
    textStyle: { color: baseTextColor },
    legend: {
      show: false, // Ocultar leyenda para evitar errores
    },
    xAxis: {
      type: "category",
      data: completeDistribution.map((d) => d.status),
      axisLabel: {
        color: secondaryTextColor,
        interval: 0, // Mostrar todas las etiquetas
        rotate: 0, // Sin rotación
        fontSize: 11,
        margin: 8,
      },
      axisTick: {
        alignWithLabel: true,
        lineStyle: { color: gridColor },
      },
      axisLine: {
        lineStyle: { color: gridColor },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: secondaryTextColor },
      axisTick: {
        lineStyle: { color: gridColor },
      },
      axisLine: {
        lineStyle: { color: gridColor },
      },
      splitLine: {
        lineStyle: { color: gridColor, type: "dashed" },
      },
    },
    grid: baseGrid,
    series: [
      {
        type: "bar",
        data: completeDistribution.map((d) => ({
          value: d.count,
          itemStyle: { color: getStatusColor(d.status) },
        })),
        barWidth: "50%",
        label: {
          show: true,
          position: "top",
          color: baseTextColor,
          fontSize: 12,
          fontWeight: "bold",
          backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.9)",
          borderRadius: 4,
          padding: [4, 8],
        },
      },
    ],
  };

  const statusLineOption = {
    backgroundColor: backgroundColor,
    animation: false, // Desactivar animaciones para mejor rendimiento
    title: {
      text: "Percentage by Status",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      borderColor: borderColor,
      textStyle: { color: baseTextColor },
      extraCssText: isDark
        ? ""
        : "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);",
    },
    textStyle: { color: baseTextColor },
    legend: {
      show: false, // Ocultar leyenda para evitar errores
    },
    xAxis: {
      type: "category",
      data: completeDistribution.map((d) => d.status),
      axisLabel: {
        color: baseTextColor,
        interval: 0, // Mostrar todas las etiquetas
        rotate: 0, // Sin rotación
        fontSize: 11,
        margin: 8,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: { type: "value", axisLabel: { color: baseTextColor }, name: "%" },
    grid: baseGrid,
    series: [
      {
        type: "line",
        data: completeDistribution.map((d) => d.percentage),
        smooth: true,
        areaStyle: { opacity: 0.15, color: "#60A5FA" },
        lineStyle: { color: "#3B82F6" },
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: completeDistribution.map((d) => getStatusColor(d.status)),
        },
        label: {
          show: true,
          position: "top",
          color: baseTextColor,
          fontSize: 11,
          formatter: "{c}%",
        },
      },
    ],
  };

  const statusDonutOption = {
    backgroundColor: backgroundColor,
    animation: false, // Desactivar animaciones para mejor rendimiento
    title: {
      text: "Pump Status (Donut)",
      left: "center",
      top: 15,
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      borderColor: borderColor,
      textStyle: { color: baseTextColor },
      extraCssText: isDark
        ? ""
        : "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);",
    },
    textStyle: { color: baseTextColor },
    series: [
      {
        type: "pie",
        radius: ["50%", "70%"],
        center: ["50%", "60%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, color: baseTextColor },
        data: completeDistribution.map((d) => ({
          name: d.status,
          value: d.count,
          itemStyle: { color: getStatusColor(d.status) },
        })),
      },
    ],
  };

  const performancePieOption = {
    backgroundColor: "transparent",
    title: {
      text: "Performance Metrics",
      left: "center",
      top: 15,
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: { trigger: "item", formatter: "{b}: {c}%" },
    textStyle: { color: baseTextColor },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "60%"],
        label: { show: true, color: baseTextColor },
        data: [
          {
            name: "Operational Efficiency",
            value: metrics.operational_efficiency_pct || 0,
          },
          { name: "Maintenance", value: metrics.maintenance_pct || 0 },
          {
            name: "System Availability",
            value: metrics.system_availability_pct || 0,
          },
        ],
      },
    ],
  };

  const locationBarOption = {
    backgroundColor: "transparent",
    title: {
      text: "Pumps by Location",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: { trigger: "axis" },
    textStyle: { color: baseTextColor },
    xAxis: {
      type: "category",
      data: locations.map((l) => l.building),
      axisLabel: { color: baseTextColor },
    },
    yAxis: { type: "value", axisLabel: { color: baseTextColor } },
    grid: baseGrid,
    series: [
      {
        type: "bar",
        data: locations.map((l) => l.count),
        itemStyle: { color: "#8B5CF6" },
        label: {
          show: true,
          position: "top",
          color: baseTextColor,
          fontSize: 11,
          fontWeight: "bold",
        },
      },
    ],
  };

  const topLocations = [...locations]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const topLocationsHorizontalOption = {
    backgroundColor: "transparent",
    title: {
      text: "Top 10 Locations",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: { trigger: "axis" },
    textStyle: { color: baseTextColor },
    xAxis: { type: "value", axisLabel: { color: baseTextColor } },
    yAxis: {
      type: "category",
      data: topLocations.map((l) => l.building),
      axisLabel: { color: baseTextColor },
    },
    grid: baseGrid,
    series: [
      {
        type: "bar",
        data: topLocations.map((l) => l.count),
        itemStyle: { color: "#06B6D4" },
        label: {
          show: true,
          position: "right",
          color: baseTextColor,
          fontSize: 11,
          fontWeight: "bold",
        },
      },
    ],
  };

  const numericMeansOption = {
    backgroundColor: "transparent",
    title: {
      text: "Averages by Metric",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: { trigger: "axis" },
    textStyle: { color: baseTextColor },
    xAxis: {
      type: "category",
      data: numericStatsArray.map((s) => s.metric),
      axisLabel: { color: baseTextColor },
    },
    yAxis: { type: "value", axisLabel: { color: baseTextColor } },
    grid: baseGrid,
    series: [
      {
        type: "line",
        data: numericStatsArray.map((s) => s.mean ?? 0),
        smooth: true,
        areaStyle: { opacity: 0.15, color: "#60A5FA" },
        lineStyle: { color: "#1D4ED8" },
        symbol: "circle",
        symbolSize: 8,
        label: {
          show: true,
          position: "top",
          color: baseTextColor,
          fontSize: 10,
          formatter: "{c}",
        },
      },
    ],
  };

  const scatterOption = {
    backgroundColor: "transparent",
    title: {
      text: "Flow vs Pressure",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "item",
      formatter: (p) => `Flow: ${p.value[0]}<br/>Pressure: ${p.value[1]}`,
    },
    textStyle: { color: baseTextColor },
    xAxis: {
      type: "value",
      name: "Flow Rate",
      axisLabel: { color: baseTextColor },
    },
    yAxis: {
      type: "value",
      name: "Pressure",
      axisLabel: { color: baseTextColor },
    },
    grid: baseGrid,
    series: [
      {
        type: "scatter",
        data: scatterData.filter(
          (v) => Number.isFinite(v[0]) && Number.isFinite(v[1])
        ),
        symbolSize: 8,
        itemStyle: { color: "#10B981" },
      },
    ],
  };

  const bubbleOption = {
    backgroundColor: "transparent",
    title: {
      text: "Power Analysis",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: {
      trigger: "item",
      formatter: (p) =>
        `Flow: ${p.value[0]}<br/>Pressure: ${p.value[1]}<br/>Power: ${p.value[2]}`,
    },
    textStyle: { color: baseTextColor },
    xAxis: {
      type: "value",
      name: "Flow Rate",
      axisLabel: { color: baseTextColor },
    },
    yAxis: {
      type: "value",
      name: "Pressure",
      axisLabel: { color: baseTextColor },
    },
    grid: baseGrid,
    series: [
      {
        type: "scatter",
        data: scatterData.filter(
          (v) =>
            Number.isFinite(v[0]) &&
            Number.isFinite(v[1]) &&
            Number.isFinite(v[2])
        ),
        symbolSize: (val) => Math.max(6, Math.min(30, (val[2] || 0) * 1.2)),
        itemStyle: { color: "#F59E0B" },
      },
    ],
  };

  const combinationOption = {
    backgroundColor: "transparent",
    title: {
      text: "Status: Count and Percentage",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: { trigger: "axis" },
    legend: {
      show: false, // Ocultar leyenda para evitar errores
    },
    textStyle: { color: baseTextColor },
    xAxis: {
      type: "category",
      data: distribution.map((d) => d.status),
      axisLabel: { color: baseTextColor },
    },
    yAxis: [
      { type: "value", name: "Count", axisLabel: { color: baseTextColor } },
      { type: "value", name: "%", axisLabel: { color: baseTextColor } },
    ],
    grid: baseGrid,
    series: [
      {
        name: "Count",
        type: "bar",
        data: distribution.map((d) => d.count),
        itemStyle: { color: "#3B82F6" },
        label: {
          show: true,
          position: "top",
          color: baseTextColor,
          fontSize: 11,
          fontWeight: "bold",
        },
      },
      {
        name: "Percentage",
        type: "line",
        yAxisIndex: 1,
        data: distribution.map((d) => d.percentage),
        lineStyle: { color: "#10B981" },
        symbol: "circle",
        symbolSize: 6,
        label: {
          show: true,
          position: "top",
          color: baseTextColor,
          fontSize: 10,
          formatter: "{c}%",
        },
      },
    ],
  };

  // Chart configurations mapping
  const chartConfigs = {
    "status-bar": {
      title: "Status Bar",
      option: statusBarOption,
      height: "h-64 xs:h-72 sm:h-80 md:h-80",
    },
    "status-donut": {
      title: "Status Donut",
      option: statusDonutOption,
      height: "h-64 xs:h-72 sm:h-80 md:h-80",
    },
    "performance-pie": {
      title: "Performance",
      option: performancePieOption,
      height: "h-80",
    },
    "location-bar": {
      title: "Location Bar",
      option: locationBarOption,
      height: "h-80",
    },
    "location-horizontal": {
      title: "Top Locations",
      option: topLocationsHorizontalOption,
      height: "h-80",
    },
    "numeric-means": {
      title: "Numeric Means",
      option: numericMeansOption,
      height: "h-80",
    },
    combination: {
      title: "Combination",
      option: combinationOption,
      height: "h-80",
    },
    scatter: {
      title: "Scatter",
      option: scatterOption,
      height: "h-80",
    },
    bubble: {
      title: "Bubble",
      option: bubbleOption,
      height: "h-80",
    },
    "status-line": {
      title: "Status Line",
      option: statusLineOption,
      height: "h-80",
    },
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
          Data Analysis (ECharts)
        </h2>
        <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark mb-6">
          Visualizations with Apache ECharts - Drag to reorder
        </p>

        {/* Status Bar - Minimalist style */}
        <div className="bg-gray-800 dark:bg-gray-700 rounded-lg px-4 py-3 flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-gray-300 dark:text-gray-300 text-sm font-medium">
              Synchronization Status
            </span>
            {syncState === "syncing" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  Syncing...
                </span>
              </div>
            )}
            {syncState === "success" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                <span className="text-green-600 dark:text-green-400 text-sm">
                  Synced
                </span>
              </div>
            )}
            {syncState === "error" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"></div>
                <span className="text-red-600 dark:text-red-400 text-sm">
                  Error
                </span>
              </div>
            )}
            {syncState === "idle" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                <span className="text-green-600 dark:text-green-400 text-sm">
                  Synced
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 text-gray-300 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-400 transition-colors px-3 py-1 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600"
            disabled={
              syncState === "syncing" ||
              summaryLoading ||
              statusLoading ||
              locationLoading ||
              numericStatsLoading ||
              pumpsLoading
            }
          >
            {syncState === "syncing" ? (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            <span className="text-sm">Update</span>
          </button>
        </div>
      </div>

      {/* Loading indicator for KPIs */}
      {!showKPIs && summaryData && (
        <div className="flex justify-center items-center mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-do_text_light dark:text-do_text_dark font-medium">
                Preparando KPIs...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div
        className={`grid grid-cols-2 md:grid-cols-6 gap-4 mb-8 transition-all duration-1000 ${
          showKPIs
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform translate-y-4"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-blue-500">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            <NumberFlow
              value={totalPumps}
              duration={1500}
              easing="easeOutQuart"
              format="number"
              className="text-3xl font-bold text-blue-600 dark:text-blue-400"
            />
          </div>
          <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            Total Pumps
          </div>
        </div>
        {/* Mostrar todos los estados relevantes, incluso si el conteo es 0 */}
        {[
          "Active",
          "Standby",
          "Maintenance",
          "Repair",
          "Inactive",
          "Testing",
        ].map((status) => {
          // Definir colores específicos para cada estado
          const getStatusColor = (status) => {
            switch (status) {
              case "Active":
                return "border-green-500 text-green-600 dark:text-green-400";
              case "Standby":
                return "border-blue-500 text-blue-600 dark:text-blue-400";
              case "Maintenance":
                return "border-yellow-500 text-yellow-600 dark:text-yellow-400";
              case "Repair":
                return "border-orange-500 text-orange-600 dark:text-orange-400";
              case "Inactive":
                return "border-gray-500 text-gray-600 dark:text-gray-400";
              case "Testing":
                return "border-purple-500 text-purple-600 dark:text-purple-400";
              default:
                return "border-gray-500 text-gray-600 dark:text-gray-400";
            }
          };

          return (
            <div
              key={status}
              className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 ${getStatusColor(
                status
              )}`}
            >
              <div className="text-3xl font-bold text-do_text_light dark:text-do_text_dark">
                <NumberFlow
                  value={statusCounts[status] || 0}
                  duration={1200}
                  easing="easeOutQuart"
                  format="number"
                  className="text-3xl font-bold text-do_text_light dark:text-do_text_dark"
                />
              </div>
              <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark capitalize">
                {status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Draggable Charts Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleChartDragEnd}
      >
        <SortableContext items={chartOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {chartOrder.map((chartId) => {
              const config = chartConfigs[chartId];
              if (!config) return null;

              const expanded = isChartExpanded(chartId);
              const gridClass = expanded
                ? "col-span-1 md:col-span-2"
                : "col-span-1";

              return (
                <div key={chartId} className={gridClass}>
                  <SortableChartItem
                    chartId={chartId}
                    isDark={isDark}
                    isExpanded={expanded}
                    onToggleExpansion={toggleChartExpansion}
                  >
                    <div
                      className={expanded ? "h-96" : config.height}
                      style={{
                        // Optimizar para mejor rendimiento de scroll
                        willChange: "transform",
                        contain: "layout style paint",
                      }}
                    >
                      <ReactECharts
                        option={config.option}
                        notMerge={true}
                        lazyUpdate={true}
                        style={{ height: "100%", width: "100%" }}
                        theme={isDark ? "dark" : undefined}
                        opts={{
                          renderer: "canvas",
                          useDirtyRect: true,
                          useCoarsePointer: true,
                          pointerSize: 4,
                        }}
                        onEvents={{
                          // Optimizar eventos para mejor rendimiento
                          mousewheel: (e) => {
                            e.event.preventDefault();
                            e.event.stopPropagation();
                          },
                          wheel: (e) => {
                            e.event.preventDefault();
                            e.event.stopPropagation();
                          },
                          // Prevenir eventos de scroll que causan advertencias
                          touchstart: (e) => {
                            e.event.preventDefault();
                          },
                          touchmove: (e) => {
                            e.event.preventDefault();
                          },
                        }}
                      />
                    </div>
                  </SortableChartItem>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-[#2C2F36] rounded-lg">
        <div className="text-center text-gray-400 text-sm">
          <p>
            💡 <strong>Tip:</strong> Drag charts to reorder them • Hover to see
            drag handle • Click expand button to make charts full-width • Charts
            automatically adapt to screen size
          </p>
        </div>
      </div>

      {/* Numeric Statistics Summary */}
      {numericStatsData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-6">
            Numerical Statistics
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(numericStatsData.stats || {}).map(
              ([metric, stats]) => (
                <div key={metric} className="space-y-2">
                  <h4 className="font-semibold text-do_text_light dark:text-do_text_dark capitalize">
                    {metric.replace("_", " ")}
                  </h4>
                  {stats ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          Min:
                        </span>
                        <span className="font-mono">
                          {stats.min !== undefined ? (
                            <NumberFlow
                              value={stats.min}
                              duration={1200}
                              easing="easeOutQuart"
                              format="number"
                              decimals={2}
                              className="font-mono"
                            />
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          Max:
                        </span>
                        <span className="font-mono">
                          {stats.max !== undefined ? (
                            <NumberFlow
                              value={stats.max}
                              duration={1200}
                              easing="easeOutQuart"
                              format="number"
                              decimals={2}
                              className="font-mono"
                            />
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          Average:
                        </span>
                        <span className="font-mono">
                          {stats.mean !== undefined ? (
                            <NumberFlow
                              value={stats.mean}
                              duration={1200}
                              easing="easeOutQuart"
                              format="number"
                              decimals={2}
                              className="font-mono"
                            />
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          Median:
                        </span>
                        <span className="font-mono">
                          {stats.median !== undefined ? (
                            <NumberFlow
                              value={stats.median}
                              duration={1200}
                              easing="easeOutQuart"
                              format="number"
                              decimals={2}
                              className="font-mono"
                            />
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-do_text_gray_light dark:text-do_text_gray_dark text-sm">
                      No data
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysisContentECharts;
