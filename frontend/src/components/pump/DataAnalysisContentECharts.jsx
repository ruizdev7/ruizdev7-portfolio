import { useMemo, useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  useOptimizedPumpsSummaryQuery,
  useOptimizedPumpsStatusDistributionQuery,
  useOptimizedPumpsByLocationQuery,
  useOptimizedPumpsNumericStatsQuery,
  useOptimizedPumpsQuery,
} from "../../RTK_Query_app/services/pump/pumpApi";
import { getStatusChartColors } from "../../pages/projects/PumpCRUD";

const DataAnalysisContentECharts = () => {
  // Estados de sincronización
  const [syncState, setSyncState] = useState("idle"); // 'idle', 'syncing', 'success', 'error'

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

  // Update sync state based on fetching status - Eliminado para evitar conflictos
  // La lógica de estado se maneja directamente en handleRefresh y auto-refresh

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

  const baseTextColor = isDark ? "#e5e7eb" : "#374151";
  const baseGrid = { left: 48, right: 24, top: 40, bottom: 80 };

  const statusBarOption = {
    backgroundColor: "transparent",
    title: {
      text: "Status Distribution",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: { trigger: "axis" },
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
        return `${name}: ${status?.count || 0}`;
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
    yAxis: { type: "value", axisLabel: { color: baseTextColor } },
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
        },
      },
    ],
  };

  const statusLineOption = {
    backgroundColor: "transparent",
    title: {
      text: "Percentage by Status",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: { trigger: "axis" },
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
    backgroundColor: "transparent",
    title: {
      text: "Pump Status (Donut)",
      left: "center",
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    textStyle: { color: baseTextColor },
    series: [
      {
        type: "pie",
        radius: ["50%", "70%"],
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
      textStyle: { color: baseTextColor, fontSize: 16, fontWeight: "bold" },
    },
    tooltip: { trigger: "item", formatter: "{b}: {c}%" },
    textStyle: { color: baseTextColor },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
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

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
          Data Analysis (ECharts)
        </h2>
        <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark mb-6">
          Visualizations with Apache ECharts
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

      {/* Status: Bar & Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gráfica de Barras */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col">
          <div className="h-64 xs:h-72 sm:h-80 md:h-80 w-full">
            <ReactECharts
              option={statusBarOption}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: "100%", width: "100%" }}
              theme={isDark ? "dark" : undefined}
            />
          </div>
          {/* Descripción de los estados */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex flex-col items-center w-full">
            <h4 className="text-sm font-semibold text-do_text_light dark:text-do_text_dark mb-3 text-center w-full">
              What does each status mean?
            </h4>
            <ul className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark w-full max-w-md list-disc pl-5 space-y-1 text-left">
              <li>
                <span className="font-semibold text-do_text_light dark:text-do_text_dark">
                  Active:
                </span>{" "}
                The pump is running and operating normally.
              </li>
              <li>
                <span className="font-semibold text-do_text_light dark:text-do_text_dark">
                  Standby:
                </span>{" "}
                The pump is ready to operate but not currently in use.
              </li>
              <li>
                <span className="font-semibold text-do_text_light dark:text-do_text_dark">
                  Maintenance:
                </span>{" "}
                The pump is undergoing preventive or corrective maintenance.
              </li>
              <li>
                <span className="font-semibold text-do_text_light dark:text-do_text_dark">
                  Repair:
                </span>{" "}
                The pump is out of service due to a failure and requires repair.
              </li>
              <li>
                <span className="font-semibold text-do_text_light dark:text-do_text_dark">
                  Inactive:
                </span>{" "}
                The pump is installed but not used or available.
              </li>
              <li>
                <span className="font-semibold text-do_text_light dark:text-do_text_dark">
                  Testing:
                </span>{" "}
                The pump is being tested or calibrated.
              </li>
            </ul>
          </div>
        </div>
        {/* Gráfica Donut */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col">
          <div className="h-64 xs:h-72 sm:h-80 md:h-80 w-full">
            <ReactECharts
              option={statusDonutOption}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: "100%", width: "100%" }}
              theme={isDark ? "dark" : undefined}
            />
          </div>
          {/* Leyenda en dos columnas */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex flex-col items-center w-full">
            <h4 className="text-sm font-semibold text-do_text_light dark:text-do_text_dark mb-3 text-center w-full">
              Status Distribution
            </h4>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {completeDistribution.map((item) => (
                <div
                  key={item.status}
                  className="flex flex-wrap items-center gap-2 text-xs justify-start w-full"
                  style={{ gap: "0.5rem" }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  ></div>
                  <span className="text-do_text_gray_light dark:text-do_text_gray_dark capitalize">
                    {item.status}:
                  </span>
                  <span className="text-do_text_light dark:text-do_text_dark font-medium">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <div className="h-80">
          <ReactECharts
            option={performancePieOption}
            notMerge={true}
            lazyUpdate={true}
            style={{ height: "100%" }}
            theme={isDark ? "dark" : undefined}
          />
        </div>
      </div>

      {/* Locations */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <ReactECharts
              option={locationBarOption}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: "100%" }}
              theme={isDark ? "dark" : undefined}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <ReactECharts
              option={topLocationsHorizontalOption}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: "100%" }}
              theme={isDark ? "dark" : undefined}
            />
          </div>
        </div>
      </div>

      {/* Numeric Means (Area/Line) & Combination */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <ReactECharts
              option={numericMeansOption}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: "100%" }}
              theme={isDark ? "dark" : undefined}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <ReactECharts
              option={combinationOption}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: "100%" }}
              theme={isDark ? "dark" : undefined}
            />
          </div>
        </div>
      </div>

      {/* Scatter & Bubble */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <ReactECharts
              option={scatterOption}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: "100%" }}
              theme={isDark ? "dark" : undefined}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <ReactECharts
              option={bubbleOption}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: "100%" }}
              theme={isDark ? "dark" : undefined}
            />
          </div>
        </div>
      </div>

      {/* Status Line */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <div className="h-80">
          <ReactECharts
            option={statusLineOption}
            notMerge={true}
            lazyUpdate={true}
            style={{ height: "100%" }}
            theme={isDark ? "dark" : undefined}
          />
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
