import PropTypes from "prop-types";
import PumpTableTanStack from "./PumpTableTanStack";

const CRUDContent = ({
  isLoading,
  isError,
  error,
  refetch,
  rowData,
  isDarkMode,
  isMobile,
  setIsOpen,
  syncState,
  lastSyncTime,
  syncTimeout,
  setSyncState,
  setSyncTimeout,
  handleEdit,
  handleDelete,
  handleUploadPhotos,
  handleViewPumpDetails,
  handleViewPhotos,
  isDeleting,
}) => {
  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
          Pump Management
        </h2>
        <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark">
          Monitor and manage all pumps in the system
        </p>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
            Loading pumps...
          </p>
        </div>
      )}

      {isError && (
        <div className="text-center py-8">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            <p className="font-bold">Error loading data:</p>
            <p>{error?.message || "Unknown error"}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="container mx-auto max-w-full px-4 rounded-lg">
            <div className="flex justify-center items-center">
              <button
                onClick={() => setIsOpen(true)}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"
              >
                <span className="text-lg font-bold">+</span>
                <span className={`${isMobile ? "hidden" : "block"}`}>
                  Add New Pump
                </span>
              </button>
            </div>
          </div>

          {/* Data Grid - TanStack Table */}
          <div className="container mx-auto max-w-full px-4">
            <PumpTableTanStack
              rows={rowData}
              isDarkMode={isDarkMode}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUploadPhotos={handleUploadPhotos}
              onViewDetails={handleViewPumpDetails}
              onViewPhotos={handleViewPhotos}
              isDeleting={isDeleting}
            />
          </div>

          {/* Sync Panel - Aligned with Table */}
          {true && (
            <div className="container mx-auto max-w-full px-4">
              <div className="bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm p-4 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left Side - Title and Status */}
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                      Synchronization Status
                    </h3>

                    {/* Sync Status Indicator */}
                    <div>
                      {syncState === "syncing" ? (
                        <div className="flex items-center gap-2 text-[#0272AD] dark:text-blue-400">
                          <div className="w-3 h-3 border-2 border-[#0272AD] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Synchronizing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-green-400">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                          <span className="text-sm">
                            Synchronized
                            {lastSyncTime && (
                              <span className="text-xs text-slate-500 ml-1">
                                ({new Date(lastSyncTime).toLocaleTimeString()})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Button */}
                  <div className="flex items-center gap-6">
                    <button
                      onClick={async () => {
                        console.log("🔄 Manual refresh triggered");
                        if (syncTimeout) {
                          clearTimeout(syncTimeout);
                          setSyncTimeout(null);
                        }
                        setSyncState("syncing");
                        try {
                          console.log("📡 Fetching data...");
                          await refetch();
                          console.log("✅ Data fetched successfully");
                          setSyncState("success");
                          setTimeout(() => {
                            console.log("🔄 Resetting sync state to idle");
                            setSyncState("idle");
                          }, 2000);
                        } catch (error) {
                          console.error(
                            "❌ Error during manual refresh:",
                            error
                          );
                          setSyncState("idle");
                        }
                      }}
                      disabled={syncState === "syncing"}
                      className="text-sm text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 transition-colors cursor-pointer"
                      title="Update table data"
                    >
                      {syncState === "syncing"
                        ? "Updating..."
                        : "🔄 Update data"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

CRUDContent.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  error: PropTypes.object,
  refetch: PropTypes.func.isRequired,
  rowData: PropTypes.array.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  syncState: PropTypes.string.isRequired,
  lastSyncTime: PropTypes.string,
  syncTimeout: PropTypes.number,
  setSyncState: PropTypes.func.isRequired,
  setSyncTimeout: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleUploadPhotos: PropTypes.func.isRequired,
  handleViewPumpDetails: PropTypes.func.isRequired,
  handleViewPhotos: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
};

export default CRUDContent;
