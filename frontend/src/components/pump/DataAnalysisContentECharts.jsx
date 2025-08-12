import { useMemo, useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
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
import {
  useOptimizedPumpsSummaryQuery,
  useOptimizedPumpsStatusDistributionQuery,
  useOptimizedPumpsByLocationQuery,
  useOptimizedPumpsNumericStatsQuery,
  useOptimizedPumpsQuery,
} from "../../RTK_Query_app/services/pump/pumpApi";
import { getStatusChartColors } from "../../pages/projects/PumpCRUD";
import PropTypes from "prop-types";

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

  const {
    data: statusDistributionData,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatusDistribution,
  } = useOptimizedPumpsStatusDistributionQuery();

  const {
    data: locationData,
    isLoading: locationLoading,
    error: locationError,
    refetch: refetchLocation,
  } = useOptimizedPumpsByLocationQuery();

  const {
    data: numericStatsData,
    isLoading: numericStatsLoading,
    error: numericStatsError,
    refetch: refetchNumericStats,
  } = useOptimizedPumpsNumericStatsQuery();

  const {
    data: pumpsListData,
    isLoading: pumpsLoading,
    error: pumpsError,
    refetch: refetchPumps,
  } = useOptimizedPumpsQuery();

  // Función de refresh manual
  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    setSyncState("syncing");

    try {
      await Promise.all([
        refetchSummary(),
        refetchStatusDistribution(),
        refetchLocation(),
        refetchNumericStats(),
        refetchPumps(),
      ]);

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
        ]).catch((error) => {
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

  // Safety timeout to prevent stuck sync state
  useEffect(() => {
    if (syncState === "syncing") {
      const timeout = setTimeout(() => {
        console.log("⚠️ Sync timeout - forcing idle state");
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
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark text-sm">
            Check your connection and access permissions
          </p>
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
      data: completeDistribution.map((d) => d.status),
      bottom: 10,
      textStyle: { color: secondaryTextColor, fontSize: 12 },
      itemWidth: 15,
      itemHeight: 15,
      itemGap: 20,
      backgroundColor: isDark ? "transparent" : "#f9fafb",
      borderColor: borderColor,
      borderRadius: 6,
      padding: [8, 12],
      formatter: function (name) {
        const status = completeDistribution.find((d) => d.status === name);
        return `${name}: ${status?.count || 0}`;
      },
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
      data: completeDistribution.map((d) => d.status),
      bottom: 10,
      textStyle: { color: baseTextColor, fontSize: 12 },
      itemWidth: 15,
      itemHeight: 15,
      itemGap: 20,
      formatter: function (name) {
        const status = completeDistribution.find((d) => d.status === name);
        return `${name}: ${status?.percentage || 0}%`;
      },
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
      data: ["Count", "Percentage"],
      textStyle: { color: baseTextColor },
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

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totalPumps}
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
        ].map((status) => (
          <div
            key={status}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center"
          >
            <div className="text-3xl font-bold text-do_text_light dark:text-do_text_dark">
              {statusCounts[status] || 0}
            </div>
            <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark capitalize">
              {status}
            </div>
          </div>
        ))}
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
                    <div className={expanded ? "h-96" : config.height}>
                      <ReactECharts
                        option={config.option}
                        notMerge={true}
                        lazyUpdate={true}
                        style={{ height: "100%", width: "100%" }}
                        theme={isDark ? "dark" : undefined}
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
                          {stats.min?.toFixed(2) || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          Max:
                        </span>
                        <span className="font-mono">
                          {stats.max?.toFixed(2) || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          Average:
                        </span>
                        <span className="font-mono">
                          {stats.mean?.toFixed(2) || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          Median:
                        </span>
                        <span className="font-mono">
                          {stats.median?.toFixed(2) || "N/A"}
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
