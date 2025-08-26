// AG Grid Global Configuration
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// Register all Community features globally
ModuleRegistry.registerModules([AllCommunityModule]);

// Export a function to check if modules are registered
export const checkAGGridModules = () => {
  try {
    // Try to access a module to verify registration
    const modules = ModuleRegistry.getModules();
    console.log(
      "✅ AG Grid modules registered successfully:",
      modules.length,
      "modules"
    );
    return true;
  } catch (error) {
    console.error("❌ AG Grid modules not registered properly:", error);
    return false;
  }
};

// Export default configuration
export default {
  modules: [AllCommunityModule],
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: false,
    flex: 1,
  },
  pagination: true,
  paginationPageSize: 10,
  suppressMenuHide: true,
  enableCellTextSelection: true,
  ensureDomOrder: true,
  animateRows: true,
  rowHeight: 50,
  headerHeight: 48,
  floatingFiltersHeight: 35,
  domLayout: "normal",
  suppressHorizontalScroll: false,
};
