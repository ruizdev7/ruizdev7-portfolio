import React from "react";

const DataAnalysisContent = ({ rowData }) => {
  // Calculate statistics from mock data
  const totalPumps = rowData.length;
  const activePumps = rowData.filter((pump) => pump.status === "Active").length;
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
          Data Analysis
        </h2>
        <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark">
          Statistics and metrics of the pump system
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
          Status Distribution
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
            Location Analysis
          </h3>
          <div className="space-y-3">
            {Array.from(
              new Set(rowData.map((pump) => pump.location.split(" - ")[0]))
            ).map((building, index) => {
              const count = rowData.filter((pump) =>
                pump.location.includes(building)
              ).length;
              return (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-do_text_gray_light dark:text-do_text_gray_dark">
                    {building}
                  </span>
                  <span className="font-semibold text-do_text_light dark:text-do_text_dark">
                    {count} pumps
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

export default DataAnalysisContent;
