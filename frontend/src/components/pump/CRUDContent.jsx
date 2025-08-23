import { AgGridReact } from "ag-grid-react";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const CRUDContent = ({
  isLoading,
  isError,
  error,
  refetch,
  rowData,
  colDefs,
  isDarkMode,
  getCurrentTheme,
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
  handleViewPhotos,
  handleViewPumpDetails,
  ActionButtonsRenderer,
}) => {
  // Optimized AG Grid refresh - only when data actually changes
  const [gridApi, setGridApi] = useState(null);
  const [lastDataHash, setLastDataHash] = useState("");

  useEffect(() => {
    if (gridApi && rowData && rowData.length > 0) {
      // Create a simple hash of the data to detect actual changes
      const dataHash = JSON.stringify(
        rowData.map((item) => ({
          ccn_pump: item.ccn_pump,
          status: item.status,
          model: item.model,
          location: item.location,
        }))
      );

      if (dataHash !== lastDataHash) {
        console.log(
          "🔄 Data changed, refreshing AG Grid with",
          rowData.length,
          "rows"
        );
        try {
          // Use lighter refresh methods
          gridApi.refreshCells({
            force: false, // Don't force if not necessary
            suppressFlash: true, // Prevent flashing animation
          });
          setLastDataHash(dataHash);
          console.log("✅ AG Grid optimized refresh completed");
        } catch (error) {
          console.error("❌ Error refreshing AG Grid:", error);
        }
      }
    }
  }, [rowData, gridApi, lastDataHash]);

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

          {/* Data Grid - Extra Wide */}
          <div className="container mx-auto max-w-full px-4">
            {/* Main Data Grid - Extra Wide */}
            <div
              className={`${
                isDarkMode
                  ? "ag-theme-quartz-dark dark:bg-dark_mode_sidebar"
                  : "ag-theme-quartz"
              }`}
              style={{ height: "500px", width: "100%" }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                theme={getCurrentTheme()}
                suppressColumnMoveAnimation={true}
                suppressColumnVirtualisation={false}
                rowSelection={{
                  type: "singleRow",
                  enableClickSelection: true,
                }}
                suppressCellFocus={true}
                defaultColDef={{
                  hide: false,
                  resizable: true,
                  sortable: true,
                }}
                // Multiple sorting configuration
                multiSortKey="ctrl"
                // Improve pagination spacing
                paginationAutoPageSize={false}
                // Enhanced pagination configuration
                paginationNumberFormatter={(params) => {
                  return "[" + params.value.toLocaleString() + "]";
                }}
                // Improve event handling
                onGridReady={(params) => {
                  setGridApi(params.api);
                  params.api.sizeColumnsToFit();
                }}
                // Force re-render when data changes
                getRowId={(params) => params.data.ccn_pump}
                // Enable row animation for better UX
                animateRows={true}
                // Stable key to avoid unnecessary re-renders
                key="pump-grid"
              />
            </div>

            {/* CSS styles to improve pagination */}
            <style>{`
            .ag-paging-panel {
              padding: 12px 16px !important;
              gap: 12px !important;
              min-height: 60px !important;
            }
            .ag-paging-row-summary-panel {
              margin-right: 16px !important;
            }
            .ag-paging-button {
              margin: 0 4px !important;
              padding: 8px 12px !important;
            }
            .ag-paging-page-size-select {
              margin: 0 8px !important;
              padding: 6px 10px !important;
            }
            .ag-paging-number {
              margin: 0 2px !important;
              padding: 6px 10px !important;
            }
            @media (max-width: 768px) {
              .ag-paging-panel {
                flex-direction: column !important;
                gap: 8px !important;
                padding: 16px !important;
              }
              .ag-paging-row-summary-panel {
                margin-right: 0 !important;
                margin-bottom: 8px !important;
              }
              .ag-paging-button {
                margin: 0 2px !important;
                padding: 6px 10px !important;
                font-size: 14px !important;
              }
              .ag-paging-number {
                margin: 0 1px !important;
                padding: 4px 8px !important;
                font-size: 14px !important;
              }
            }
          `}</style>

            {/* Sync Panel - Footer Full Width */}
            {true && (
              <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left Side - Title and Status */}
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Synchronization Status
                    </h3>

                    {/* Sync Status Indicator */}
                    <div>
                      {syncState === "syncing" ? (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Synchronizing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">
                            Sincronizado
                            {lastSyncTime && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({new Date(lastSyncTime).toLocaleTimeString()})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Button and Debug Info */}
                  <div className="flex items-center gap-6">
                    {/* Sync Button - Text Only */}
                    <button
                      onClick={async () => {
                        console.log("🔄 Manual refresh triggered");
                        // Clear any existing timeout
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
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 transition-colors cursor-pointer"
                      title="Update table data"
                    >
                      {syncState === "syncing"
                        ? "Updating..."
                        : "🔄 Update data"}
                    </button>

                    {/* Debug Info - Comentado para producción */}
                    {/* 
                  <div className="text-xs text-gray-400 flex gap-4">
                    <span>RTK: {isFetching ? "Fetching" : "Idle"}</span>
                    <span>Local: {syncState}</span>
                    <span>Datos: {apiData?.Pumps?.length || 0} bombas</span>
                    <button
                      onClick={debugReduxState}
                      className="text-blue-500 hover:text-blue-700 underline"
                      title="Verificar estado de Redux"
                    >
                      🔍 Debug
                    </button>
                    <button
                      onClick={forceReduxRefresh}
                      className="text-green-500 hover:text-green-700 underline"
                      title="Forzar actualización completa de Redux"
                    >
                      🔄 Force Refresh
                    </button>
                    <button
                      onClick={aggressiveReduxRefresh}
                      className="text-red-500 hover:text-red-700 underline"
                      title="Limpieza agresiva del cache de Redux"
                    >
                      💥 Aggressive Clear
                    </button>
                    <button
                      onClick={directHttpRequest}
                      className="text-purple-500 hover:text-purple-700 underline"
                      title="Petición HTTP directa para comparar"
                    >
                      🌐 Direct HTTP
                    </button>
                    <button
                      onClick={investigateRTKQuery}
                      className="text-orange-500 hover:text-orange-700 underline"
                      title="Investigación detallada de RTK Query"
                    >
                      🔬 RTK Investigation
                    </button>
                  </div>
                  */}
                  </div>
                </div>
              </div>
            )}
          </div>
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
  colDefs: PropTypes.array.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  getCurrentTheme: PropTypes.func.isRequired,
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
  handleViewPhotos: PropTypes.func.isRequired,
  handleViewPumpDetails: PropTypes.func.isRequired,
  ActionButtonsRenderer: PropTypes.func.isRequired,
};

export default CRUDContent;
