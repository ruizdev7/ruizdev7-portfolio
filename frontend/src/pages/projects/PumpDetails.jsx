import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPumpQuery } from "../../RTK_Query_app/services/pump/pumpApi";
import { toast } from "react-toastify";

const PumpDetails = () => {
  const { ccn_pump } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Use RTK Query to fetch the specific pump
  const { data: pump, error, isLoading } = useGetPumpQuery(ccn_pump);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      console.error("Error fetching pump:", error);
      toast.error("Error loading pump data");
      navigate("/projects/pump-crud");
    }
  }, [error, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pump details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (!pump) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pump Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The pump you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/projects/pump-crud")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Pumps
          </button>
        </div>
      </div>
    );
  }

  // Mock data for maintenance history
  const maintenanceHistory = [
    {
      id: 1,
      date: "2024-01-15",
      type: "Preventive",
      description: "Oil and filter change",
      technician: "John Smith",
      cost: 150.0,
      nextMaintenance: "2024-04-15",
    },
    {
      id: 2,
      date: "2023-10-20",
      type: "Corrective",
      description: "Mechanical seal repair",
      technician: "Mary Johnson",
      cost: 300.0,
      nextMaintenance: "2024-01-20",
    },
    {
      id: 3,
      date: "2023-07-10",
      type: "Preventive",
      description: "General cleaning and lubrication",
      technician: "Carl Lewis",
      cost: 80.0,
      nextMaintenance: "2023-10-10",
    },
  ];

  // Mock data for spare parts
  const spareParts = [
    {
      id: 1,
      partNumber: "SP-001",
      description: "Mechanical seal",
      quantity: 2,
      cost: 45.0,
      supplier: "Industrial Pumps Inc.",
      lastOrder: "2024-01-10",
    },
    {
      id: 2,
      partNumber: "SP-002",
      description: "Oil filter",
      quantity: 5,
      cost: 12.0,
      supplier: "Filters Pro",
      lastOrder: "2024-01-15",
    },
    {
      id: 3,
      partNumber: "SP-003",
      description: "SKF 6205 bearing",
      quantity: 1,
      cost: 25.0,
      supplier: "Bearings Plus",
      lastOrder: "2023-12-20",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "maintenance":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Maintenance History</h3>
            <div className="space-y-3">
              {maintenanceHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.description}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.type} - {item.date}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Technician: {item.technician}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">${item.cost}</p>
                      <p className="text-xs text-gray-500">
                        Next: {item.nextMaintenance}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "spare-parts":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">
              Spare Parts Inventory
            </h3>
            <div className="space-y-3">
              {spareParts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.description}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Part #: {item.partNumber}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Supplier: {item.supplier}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">${item.cost} each</p>
                      <p className="text-xs text-gray-500">
                        Last order: {item.lastOrder}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pump ID
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">
                      {pump.ccn_pump}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Model
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {pump.model}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Serial Number
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {pump.serial_number}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Location
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {pump.location}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pump.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : pump.status === "Maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : pump.status === "Inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {pump.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Technical Specifications
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Power (kW)
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {pump.power} kW
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Flow Rate (L/min)
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {pump.flow_rate} L/min
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pressure (bar)
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {pump.pressure} bar
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Efficiency (%)
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {pump.efficiency}%
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Voltage (V)
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {pump.voltage} V
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Current (A)
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {pump.current} A
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Power Factor
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {pump.power_factor}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Information */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Maintenance Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Purchase Date
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(pump.purchase_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Last Maintenance
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(pump.last_maintenance).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Next Maintenance
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(pump.next_maintenance).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Photos Section */}
            {pump.photos && pump.photos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Photos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pump.photos.map((photo, index) => (
                    <div key={index} className="aspect-square">
                      <img
                        src={`/api/v1/pumps/${pump.ccn_pump}/photos/${photo}`}
                        alt={`Pump photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {pump.pump_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {pump.manufacturer} - {pump.model}
              </p>
            </div>
            <button
              onClick={() => navigate("/projects/pump-crud")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Pumps
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "maintenance", label: "Maintenance" },
              { id: "spare-parts", label: "Spare Parts" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default PumpDetails;
