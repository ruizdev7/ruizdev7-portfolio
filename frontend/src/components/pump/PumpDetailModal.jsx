import { useState } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CogIcon,
  BoltIcon,
  WrenchIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CpuChipIcon,
  BeakerIcon,
  Cog6ToothIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CalendarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

const PumpDetailModal = ({
  pump,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUploadPhotos,
  isDarkMode,
  isDeleting,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("specifications");

  if (!isOpen || !pump) return null;

  const photos = pump.photo_urls || [];
  const currentPhoto = photos[currentPhotoIndex];

  // Status colors configuration - Industrial standards
  const getStatusColors = () => ({
    Active: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-800 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "text-emerald-600",
      badge:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    Inactive: {
      bg: "bg-slate-50 dark:bg-slate-900/20",
      text: "text-slate-800 dark:text-slate-400",
      border: "border-slate-200 dark:border-slate-800",
      icon: "text-slate-600",
      badge:
        "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
    },
    Maintenance: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-800 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      icon: "text-amber-600",
      badge:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    },
    Out_of_Service: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600",
      badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
    Standby: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-800 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-600",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    Repair: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600",
      badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
    Testing: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-800 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
      icon: "text-purple-600",
      badge:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    },
  });

  const statusColors =
    getStatusColors()[pump.status] || getStatusColors().Inactive;

  // Calculate maintenance status with industrial standards
  const calculateMaintenanceStatus = () => {
    if (!pump.next_maintenance)
      return {
        status: "no-data",
        text: "No maintenance scheduled",
        color: "text-slate-500",
        severity: "info",
        icon: InformationCircleIcon,
      };

    const nextMaintenance = new Date(pump.next_maintenance);
    const today = new Date();
    const daysUntil = Math.ceil(
      (nextMaintenance - today) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil < 0) {
      return {
        status: "overdue",
        text: `${Math.abs(daysUntil)} days overdue`,
        color: "text-red-600",
        severity: "critical",
        icon: ExclamationCircleIcon,
      };
    } else if (daysUntil <= 7) {
      return {
        status: "urgent",
        text: `${daysUntil} days remaining`,
        color: "text-orange-600",
        severity: "warning",
        icon: ExclamationTriangleIcon,
      };
    } else if (daysUntil <= 30) {
      return {
        status: "warning",
        text: `${daysUntil} days remaining`,
        color: "text-amber-600",
        severity: "caution",
        icon: ClockIcon,
      };
    } else {
      return {
        status: "good",
        text: `${daysUntil} days remaining`,
        color: "text-emerald-600",
        severity: "normal",
        icon: CheckCircleIcon,
      };
    }
  };

  const maintenanceStatus = calculateMaintenanceStatus();

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNumber = (value, unit = "") => {
    if (value === null || value === undefined) return "Not specified";
    return `${value}${unit}`;
  };

  const getEfficiencyClass = (efficiency) => {
    if (!efficiency) return { class: "Unknown", color: "text-slate-500" };
    if (efficiency >= 90)
      return { class: "Premium", color: "text-emerald-600" };
    if (efficiency >= 80) return { class: "High", color: "text-blue-600" };
    if (efficiency >= 70) return { class: "Standard", color: "text-amber-600" };
    return { class: "Low", color: "text-red-600" };
  };

  const efficiencyClass = getEfficiencyClass(pump.efficiency);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-7xl max-h-[95vh] ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        } rounded-xl shadow-2xl overflow-hidden`}
      >
        {/* Header - Corporate Style */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <CogIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">Equipment Data Sheet</h1>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors.badge}`}
                  >
                    {pump.status}
                  </div>
                </div>
                <p className="text-slate-300">
                  {pump.serial_number || pump.ccn_pump} • {pump.model} •{" "}
                  {pump.location}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Document ID: {pump.ccn_pump} • Last Updated:{" "}
                  {formatDate(pump.updated_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUploadPhotos(pump)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Upload Documentation"
              >
                <PhotoIcon className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => onEdit(pump)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Edit Equipment Data"
              >
                <PencilIcon className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => onDelete(pump.ccn_pump)}
                disabled={isDeleting}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                title="Decommission Equipment"
              >
                <TrashIcon className="w-5 h-5 text-red-300" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800">
          <nav className="flex space-x-8 px-6">
            {[
              {
                id: "specifications",
                label: "Specifications",
                icon: DocumentTextIcon,
              },
              { id: "performance", label: "Performance", icon: ChartBarIcon },
              { id: "maintenance", label: "Maintenance", icon: WrenchIcon },
              { id: "documentation", label: "Documentation", icon: PhotoIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-[#0272AD] text-[#0272AD] dark:text-[#0272AD]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Left Side - Photos/Documentation */}
          <div className="lg:w-2/5 p-6 border-r border-slate-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <PhotoIcon className="w-5 h-5 text-slate-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Equipment Documentation ({photos.length})
              </h3>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <PhotoIcon className="w-10 h-10 text-slate-400 dark:text-gray-500" />
                </div>
                <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No Documentation Available
                </h4>
                <p className="text-slate-600 dark:text-gray-400 mb-4">
                  Upload technical drawings, photos, and maintenance records.
                </p>
                <button
                  onClick={() => onUploadPhotos(pump)}
                  className="px-6 py-3 bg-[#0272AD] text-white rounded-lg hover:bg-[#0272AD]/90 transition-colors font-medium"
                >
                  Upload Documentation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Main Photo */}
                <div className="relative">
                  <img
                    src={currentPhoto}
                    alt={`Equipment documentation ${currentPhotoIndex + 1}`}
                    className="w-full h-64 object-cover rounded-lg border border-slate-200 dark:border-gray-600"
                  />
                  {photos.length > 1 && (
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {currentPhotoIndex + 1} / {photos.length}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentPhotoIndex
                            ? "border-[#0272AD] ring-2 ring-[#0272AD]/20"
                            : "border-slate-300 dark:border-gray-600 hover:border-slate-400"
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`Documentation ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Tabbed Content */}
          <div className="lg:w-3/5 p-6 overflow-y-auto">
            {/* Specifications Tab */}
            {activeTab === "specifications" && (
              <div className="space-y-8">
                {/* Equipment Identification */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <TagIcon className="w-5 h-5" />
                    Equipment Identification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Serial Number
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {pump.serial_number || "Not specified"}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Model
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {pump.model || "Not specified"}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Location
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-slate-500" />
                        {pump.location || "Not specified"}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Purchase Date
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {formatDate(pump.purchase_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CpuChipIcon className="w-5 h-5" />
                    Technical Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Flow Rate
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <BoltIcon className="w-5 h-5 text-slate-500" />
                        {formatNumber(pump.flow_rate, " L/min")}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Pressure Rating
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {formatNumber(pump.pressure, " bar")}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Power Rating
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {formatNumber(pump.power, " kW")}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Efficiency Class
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        <span className={efficiencyClass.color}>
                          {pump.efficiency
                            ? `${pump.efficiency}% (${efficiencyClass.class})`
                            : "Not specified"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Electrical Specifications */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BoltIcon className="w-5 h-5" />
                    Electrical Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Voltage
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {formatNumber(pump.voltage, " V")}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Current
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {formatNumber(pump.current, " A")}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Power Factor
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {formatNumber(pump.power_factor)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                          <BoltIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <label className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide font-medium">
                            Flow Rate
                          </label>
                          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                            {formatNumber(pump.flow_rate, " L/min")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                          <Cog6ToothIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <label className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-medium">
                            Power Output
                          </label>
                          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                            {formatNumber(pump.power, " kW")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                          <BeakerIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <label className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide font-medium">
                            Efficiency
                          </label>
                          <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                            {formatNumber(pump.efficiency, "%")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                          <ShieldCheckIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <label className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wide font-medium">
                            Pressure Rating
                          </label>
                          <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                            {formatNumber(pump.pressure, " bar")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === "maintenance" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <WrenchIcon className="w-5 h-5" />
                    Maintenance Schedule
                  </h3>

                  {/* Maintenance Status Alert */}
                  <div
                    className={`p-4 rounded-lg border-l-4 mb-6 ${
                      maintenanceStatus.severity === "critical"
                        ? "bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-500"
                        : maintenanceStatus.severity === "warning"
                        ? "bg-amber-50 border-amber-400 dark:bg-amber-900/20 dark:border-amber-500"
                        : maintenanceStatus.severity === "caution"
                        ? "bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-500"
                        : "bg-emerald-50 border-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <maintenanceStatus.icon
                        className={`w-6 h-6 ${
                          maintenanceStatus.severity === "critical"
                            ? "text-red-600 dark:text-red-400"
                            : maintenanceStatus.severity === "warning"
                            ? "text-amber-600 dark:text-amber-400"
                            : maintenanceStatus.severity === "caution"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      />
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          Maintenance Status
                        </h4>
                        <p
                          className={`text-sm font-medium ${maintenanceStatus.color}`}
                        >
                          {maintenanceStatus.text}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Next Scheduled Maintenance
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-slate-500" />
                        {formatDate(pump.next_maintenance)}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Last Maintenance Performed
                      </label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <WrenchIcon className="w-5 h-5 text-slate-500" />
                        {formatDate(pump.last_maintenance)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documentation Tab */}
            {activeTab === "documentation" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    Technical Documentation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Equipment ID
                      </label>
                      <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                        {pump.ccn_pump}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Document Created
                      </label>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatDate(pump.created_at)}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Last Updated
                      </label>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatDate(pump.updated_at)}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                        Documentation Status
                      </label>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {photos.length > 0 ? "Complete" : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

PumpDetailModal.propTypes = {
  pump: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUploadPhotos: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool,
};

export default PumpDetailModal;
