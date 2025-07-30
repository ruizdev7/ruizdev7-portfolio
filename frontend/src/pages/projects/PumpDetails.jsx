import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchPumps } from "../../RTK_Query_app/state_slices/pump/pumpSlice";
import { toast } from "react-toastify";

const PumpDetails = () => {
  const { ccn_pump } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { pumps } = useSelector((state) => state.pump);
  const [pump, setPump] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pump data
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchPumps());
      } catch (error) {
        console.error("Error fetching pump data:", error);
        toast.error("Error loading pump data");
      }
    };
    fetchData();
  }, [dispatch]);

  // Find the specific pump
  useEffect(() => {
    if (pumps && pumps.length > 0) {
      const foundPump = pumps.find((p) => p.ccn_pump === ccn_pump);
      if (foundPump) {
        setPump(foundPump);
      } else {
        toast.error("Pump not found");
        navigate("/projects/pump-crud");
      }
      setIsLoading(false);
    }
  }, [pumps, ccn_pump, navigate]);

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
      supplier: "Central Bearings",
      lastOrder: "2023-12-20",
    },
  ];

  // Calculate warranty status
  const calculateWarrantyStatus = () => {
    if (!pump) return { status: "Unknown", daysLeft: 0 };

    const purchaseDate = new Date(pump.purchase_date);
    const warrantyPeriod = 2; // 2 years warranty
    const warrantyEndDate = new Date(purchaseDate);
    warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + warrantyPeriod);

    const today = new Date();
    const daysLeft = Math.ceil(
      (warrantyEndDate - today) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft > 0) {
      return { status: "Under Warranty", daysLeft, color: "green" };
    } else {
      return {
        status: "Warranty Expired",
        daysLeft: Math.abs(daysLeft),
        color: "red",
      };
    }
  };

  const warrantyStatus = calculateWarrantyStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pump) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            Pump not found
          </h2>
          <button
            onClick={() => navigate("/projects/pump-crud")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/projects/pump-crud")}
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Volver a la lista
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Hoja de Vida - {pump.model}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                CCN: {pump.ccn_pump} | Serial: {pump.serial_number}
              </p>
            </div>

            {/* Warranty Status */}
            <div
              className={`px-4 py-2 rounded-lg ${
                warrantyStatus.color === "green"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              <div className="text-sm font-medium">{warrantyStatus.status}</div>
              <div className="text-xs">
                {warrantyStatus.daysLeft > 0
                  ? `${warrantyStatus.daysLeft} días restantes`
                  : `Expirada hace ${warrantyStatus.daysLeft} días`}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "General Overview", icon: "📊" },
              { id: "maintenance", name: "Maintenance", icon: "🔧" },
              { id: "parts", name: "Spare Parts", icon: "⚙️" },
              { id: "photos", name: "Photos", icon: "📷" },
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
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Model:</span> {pump.model}
                  </div>
                  <div>
                    <span className="font-medium">Serial:</span>{" "}
                    {pump.serial_number}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>{" "}
                    {pump.location}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        pump.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : pump.status === "Maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {pump.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Technical Specifications
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Flow Rate:</span>{" "}
                    {pump.flow_rate} L/min
                  </div>
                  <div>
                    <span className="font-medium">Pressure:</span>{" "}
                    {pump.pressure} bar
                  </div>
                  <div>
                    <span className="font-medium">Power:</span> {pump.power} kW
                  </div>
                  <div>
                    <span className="font-medium">Efficiency:</span>{" "}
                    {pump.efficiency}%
                  </div>
                  <div>
                    <span className="font-medium">Voltage:</span> {pump.voltage}
                    V
                  </div>
                  <div>
                    <span className="font-medium">Current:</span> {pump.current}
                    A
                  </div>
                </div>
              </div>

              {/* Maintenance Schedule */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Maintenance Schedule
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Last Maintenance:</span>
                    <br />
                    {new Date(pump.last_maintenance).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Next Maintenance:</span>
                    <br />
                    {new Date(pump.next_maintenance).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Purchase Date:</span>
                    <br />
                    {new Date(pump.purchase_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Maintenance History
                </h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  + Add Maintenance
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Technician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Next
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {maintenanceHistory.map((maintenance) => (
                      <tr
                        key={maintenance.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(maintenance.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              maintenance.type === "Preventivo"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {maintenance.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {maintenance.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {maintenance.technician}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${maintenance.cost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(
                            maintenance.nextMaintenance
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "parts" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Spare Parts Inventory
                </h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  + Add Spare Part
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Part Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Unit Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Last Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {spareParts.map((part) => (
                      <tr
                        key={part.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {part.partNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {part.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {part.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${part.cost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {part.supplier}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(part.lastOrder).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "photos" && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Equipment Photos
              </h3>

              {pump.photo_urls && pump.photo_urls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pump.photo_urls.map((photoUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photoUrl}
                        alt={`Photo ${index + 1} of ${pump.model}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 p-2 rounded-full transition-all duration-200">
                          <svg
                            className="w-5 h-5 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No photos available
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No photos have been uploaded for this equipment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PumpDetails;
