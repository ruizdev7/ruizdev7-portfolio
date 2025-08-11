import { AgCharts } from "ag-charts-react";
import {
  useGetPumpsSummaryQuery,
  useGetPumpsStatusDistributionQuery,
  useGetPumpsByLocationQuery,
  useGetPumpsNumericStatsQuery,
  useGetPumpsQuery,
} from "../../RTK_Query_app/services/pump/pumpApi";

const DataAnalysisContent = () => {
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

  // Line (community) over percentages per status
  const statusLineOptions = {
    title: { text: "Status Percentage (Line)" },
    data: distribution.map((item) => ({
      status: item.status,
      percentage: item.percentage,
    })),
    series: [{ type: "line", xKey: "status", yKey: "percentage" }],
    axes: [
      { type: "category", position: "bottom" },
      { type: "number", position: "left", title: { text: "%" } },
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

  // Area/Line over numeric means per metric (not time-based but valid for comparison)
  const numericMeansOptions = {
    title: { text: "Numeric Metrics Mean (Area)" },
    data: numericStatsArray.map((s) => ({
      metric: s.metric,
      mean: s.mean || 0,
    })),
    series: [
      {
        type: "area",
        xKey: "metric",
        yKey: "mean",
        fills: ["#60A5FA"],
        strokes: ["#1D4ED8"],
      },
    ],
    axes: [
      { type: "category", position: "bottom" },
      { type: "number", position: "left" },
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

  // Combination (bar + line) using counts and percentages per status
  const combinationStatusOptions = {
    title: { text: "Status: Count (Bar) + Percentage (Line)" },
    data: distribution.map((d) => ({
      status: d.status,
      count: d.count,
      percentage: d.percentage,
    })),
    series: [
      { type: "column", xKey: "status", yKey: "count", yName: "Count" },
      { type: "line", xKey: "status", yKey: "percentage", yName: "%" },
    ],
    axes: [
      { type: "category", position: "bottom" },
      { type: "number", position: "left" },
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-80">
            <AgCharts options={combinationStatusOptions} />
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

      {/* Line over Status Percentage */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <div className="h-80">
          <AgCharts options={statusLineOptions} />
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
