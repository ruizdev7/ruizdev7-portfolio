import { useState } from "react";
import { AgCharts } from "ag-charts-react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import {
  useGetPumpsSummaryQuery,
  useGetPumpsStatusDistributionQuery,
  useGetPumpsByLocationQuery,
  useGetPumpsNumericStatsQuery,
  useGetPumpsQuery,
  useGetPumpsInsightsQuery,
} from "../../RTK_Query_app/services/pump/pumpApi";

const DataAnalysisContent = () => {
  const [showInsightsPanel, setShowInsightsPanel] = useState(true);
  // Fetch real data from analysis endpoints
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useGetPumpsSummaryQuery();
  const {
    data: statusDistributionData,
    isLoading: statusLoading,
    error: statusError,
  } = useGetPumpsStatusDistributionQuery();
  const {
    data: locationData,
    isLoading: locationLoading,
    error: locationError,
  } = useGetPumpsByLocationQuery();
  const {
    data: numericStatsData,
    isLoading: numericStatsLoading,
    error: numericStatsError,
  } = useGetPumpsNumericStatsQuery();
  const {
    data: pumpsListData,
    isLoading: pumpsLoading,
    error: pumpsError,
  } = useGetPumpsQuery();
  const {
    data: insightsData,
    isLoading: insightsLoading,
    error: insightsError,
    refetch: refetchInsights,
  } = useGetPumpsInsightsQuery();

  // Loading state
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
            Cargando análisis de datos...
          </p>
        </div>
      </div>
    );
  }

  // Error state
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
            Error al cargar los datos de análisis
          </p>
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark text-sm">
            Verifica tu conexión y permisos de acceso
          </p>
        </div>
      </div>
    );
  }

  // Extract data from API responses
  const totalPumps = summaryData?.total_pumps || 0;
  const statusCounts = summaryData?.status || {};
  const metrics = summaryData?.metrics || {};
  const distribution = statusDistributionData?.distribution || [];
  const locations = locationData?.locations || [];
  const pumps = pumpsListData?.Pumps || [];

  // Build datasets for charts
  const numericStatsArray = Object.entries(numericStatsData?.stats || {}).map(
    ([metric, stats]) => ({ metric, ...(stats || {}) })
  );

  const scatterData = pumps.map((p) => ({
    flow_rate: Number(p.flow_rate),
    pressure: Number(p.pressure),
    power: Number(p.power),
    efficiency: Number(p.efficiency),
    status: p.status,
  }));

  // Chart configurations using real data
  const statusChartOptions = {
    title: { text: "Status Distribution" },
    data: distribution.map((item) => ({
      status: item.status,
      count: item.count,
      percentage: item.percentage,
    })),
    series: [
      {
        type: "column",
        xKey: "status",
        yKey: "count",
        fills: ["#10B981", "#F59E0B", "#EF4444", "#6B7280"],
        strokes: "#ffffff",
        strokeWidth: 2,
      },
    ],
    axes: [
      { type: "category", position: "bottom", title: { text: "Status" } },
      { type: "number", position: "left", title: { text: "Number of Pumps" } },
    ],
  };

  const statusDonutOptions = {
    title: { text: "Status Distribution (Donut)" },
    data: distribution.map((d) => ({ label: d.status, value: d.count })),
    series: [
      {
        type: "pie",
        angleKey: "value",
        labelKey: "label",
        fills: ["#10B981", "#F59E0B", "#EF4444", "#6B7280"],
        strokes: "#ffffff",
        strokeWidth: 2,
        innerRadiusRatio: 0.6,
      },
    ],
  };

  const performanceChartOptions = {
    title: { text: "Performance Metrics" },
    data: [
      {
        metric: "Operational Efficiency",
        value: metrics.operational_efficiency_pct || 0,
      },
      { metric: "Maintenance", value: metrics.maintenance_pct || 0 },
      {
        metric: "System Availability",
        value: metrics.system_availability_pct || 0,
      },
    ],
    series: [
      {
        type: "pie",
        angleKey: "value",
        labelKey: "metric",
        fills: ["#10B981", "#F59E0B", "#3B82F6"],
        strokes: "#ffffff",
        strokeWidth: 2,
        innerRadiusRatio: 0.6,
      },
    ],
  };

  const locationChartOptions = {
    title: { text: "Pumps by Location" },
    data: locations.map((location) => ({
      building: location.building,
      count: location.count,
    })),
    series: [
      {
        type: "column",
        xKey: "building",
        yKey: "count",
        fill: "#8B5CF6",
        stroke: "#ffffff",
        strokeWidth: 2,
      },
    ],
    axes: [
      { type: "category", position: "bottom", title: { text: "Building" } },
      { type: "number", position: "left", title: { text: "Number of Pumps" } },
    ],
  };

  const topLocationsBarOptions = {
    title: { text: "Top Locations (Horizontal Bar)" },
    data: [...locations]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((l) => ({ building: l.building, count: l.count })),
    series: [
      {
        type: "bar",
        direction: "horizontal",
        xKey: "building",
        yKey: "count",
        fills: ["#06B6D4"],
        strokes: "#ffffff",
      },
    ],
    axes: [
      { type: "category", position: "left" },
      { type: "number", position: "bottom", title: { text: "Count" } },
    ],
  };

  // Column chart for numeric metrics mean (better than area for non-temporal data)
  const numericMeansOptions = {
    title: { text: "Numeric Metrics Mean" },
    data: numericStatsArray.map((s) => ({
      metric: s.metric,
      mean: s.mean || 0,
    })),
    series: [
      {
        type: "column",
        xKey: "metric",
        yKey: "mean",
        fills: ["#60A5FA"],
        strokes: ["#1D4ED8"],
      },
    ],
    axes: [
      { type: "category", position: "bottom", title: { text: "Metric" } },
      { type: "number", position: "left", title: { text: "Mean Value" } },
    ],
  };

  // Scatter (flow_rate vs pressure)
  const scatterOptions = {
    title: { text: "Flow Rate vs Pressure (Scatter)" },
    data: scatterData.filter(
      (d) => Number.isFinite(d.flow_rate) && Number.isFinite(d.pressure)
    ),
    series: [
      {
        type: "scatter",
        xKey: "flow_rate",
        yKey: "pressure",
        marker: { size: 8 },
      },
    ],
    axes: [
      { type: "number", position: "bottom", title: { text: "Flow Rate" } },
      { type: "number", position: "left", title: { text: "Pressure" } },
    ],
  };

  // Bubble (adds size by power)
  const bubbleOptions = {
    title: { text: "Flow Rate vs Pressure by Power (Bubble)" },
    data: scatterData.filter(
      (d) =>
        Number.isFinite(d.flow_rate) &&
        Number.isFinite(d.pressure) &&
        Number.isFinite(d.power)
    ),
    series: [
      { type: "bubble", xKey: "flow_rate", yKey: "pressure", sizeKey: "power" },
    ],
    axes: [
      { type: "number", position: "bottom", title: { text: "Flow Rate" } },
      { type: "number", position: "left", title: { text: "Pressure" } },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
          Data Analysis
        </h2>
        <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark">
          Statistics and metrics of the pump system
        </p>
      </div>

      {/* Métricas Clave */}
      <div
        className={`grid grid-cols-2 md:grid-cols-${
          1 + Object.keys(statusCounts).length
        } gap-4 mb-8`}
      >
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totalPumps}
          </div>
          <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            Total Bombas
          </div>
        </div>
        {Object.entries(statusCounts).map(([status, count]) => {
          // Colores por estado
          let color = "text-gray-500";
          if (status.toLowerCase() === "active")
            color = "text-green-600 dark:text-green-400";
          else if (status.toLowerCase() === "maintenance")
            color = "text-yellow-600 dark:text-yellow-400";
          else if (status.toLowerCase() === "inactive")
            color = "text-red-600 dark:text-red-400";
          else if (status.toLowerCase() === "standby")
            color = "text-gray-400 dark:text-gray-300";
          // Puedes agregar más colores según los estados posibles

          return (
            <div
              key={status}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center"
            >
              <div className={`text-3xl font-bold ${color}`}>{count || 0}</div>
              <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark capitalize">
                {status}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Insights Panel */}
      {showInsightsPanel && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 mb-8 border border-blue-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                AI Insights
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetchInsights()}
                disabled={insightsLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {insightsLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Regenerate
                  </>
                )}
              </button>
              <button
                onClick={() => setShowInsightsPanel(false)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors"
                title="Hide AI Insights panel"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          {insightsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-blue-700 dark:text-blue-300">
                  Generating insights with AI...
                </p>
              </div>
            </div>
          ) : insightsError ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                    {insightsError.message || "Error generating insights"}
                  </p>
                  {(insightsError.message || "")
                    .toLowerCase()
                    .includes("credits") ||
                  (insightsError.message || "")
                    .toLowerCase()
                    .includes("quota") ? (
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      This feature requires OpenAI credits. You can hide this
                      panel if you don&apos;t plan to use AI insights.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : insightsData?.insights ? (
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <div className="whitespace-pre-line text-slate-700 dark:text-gray-200 leading-relaxed">
                {insightsData.insights}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No insights available. Click &quot;Regenerate&quot; to generate AI
              insights.
            </div>
          )}
        </div>
      )}
      {!showInsightsPanel && (
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowInsightsPanel(true)}
            className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 mx-auto"
          >
            <SparklesIcon className="w-5 h-5" />
            Show AI Insights Panel
          </button>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <AgCharts options={statusChartOptions} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <AgCharts options={performanceChartOptions} />
          </div>
        </div>
      </div>

      {/* Extra Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <AgCharts options={statusDonutOptions} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <AgCharts options={topLocationsBarOptions} />
          </div>
        </div>
      </div>

      {/* Location Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <div className="h-80">
          <AgCharts options={locationChartOptions} />
        </div>
      </div>

      {/* Numeric Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <AgCharts options={numericMeansOptions} />
          </div>
        </div>
      </div>

      {/* Scatter & Bubble */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <AgCharts options={scatterOptions} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <AgCharts options={bubbleOptions} />
          </div>
        </div>
      </div>

      {/* Numeric Statistics Summary */}
      {numericStatsData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-6">
            Estadísticas Numéricas
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
                          Promedio:
                        </span>
                        <span className="font-mono">
                          {stats.mean?.toFixed(2) || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          Mediana:
                        </span>
                        <span className="font-mono">
                          {stats.median?.toFixed(2) || "N/A"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-do_text_gray_light dark:text-do_text_gray_dark text-sm">
                      Sin datos
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

export default DataAnalysisContent;
