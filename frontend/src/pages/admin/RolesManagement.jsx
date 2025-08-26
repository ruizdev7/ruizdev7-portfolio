import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useAssignPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
  useGetUsersQuery,
  useAssignRoleToUserMutation,
  useRemoveRoleFromUserMutation,
} from "../../RTK_Query_app/services/roles/rolesApi";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionGuard from "../../components/auth/PermissionGuard";
import {
  PlusIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Dark theme for ag-grid
const darkTheme = themeQuartz.withParams({
  // Main background colors
  backgroundColor: "#17181C",
  oddRowBackgroundColor: "#1A1B1F",
  evenRowBackgroundColor: "#17181C",

  // Header styling
  chromeBackgroundColor: "#27282C",
  headerBackgroundColor: "#27282C",
  headerTextColor: "#919191",
  headerFontSize: 14,
  headerFontWeight: 600,
  headerHeight: 48,

  // Text colors
  foregroundColor: "#FFF",
  secondaryForegroundColor: "#B8B8B8",
  subtleTextColor: "#919191",

  // Borders and lines
  borderColor: "#2A2B2F",
  rowBorderColor: "#2A2B2F",

  // Interactive elements
  selectedRowBackgroundColor: "#2563EB20",
  rangeSelectionBackgroundColor: "#2563EB15",

  // Input and filter styling
  inputBackgroundColor: "#27282C",
  inputBorderColor: "#3F4045",
  inputTextColor: "#FFF",
  inputPlaceholderTextColor: "#919191",

  // Buttons and controls
  buttonBackgroundColor: "#27282C",
  buttonTextColor: "#FFF",

  // Scrollbars
  scrollbarThumbBackgroundColor: "#3F4045",
  scrollbarTrackBackgroundColor: "#27282C",

  // Focus and hover states
  cellHorizontalBorder: true,
  rowHoverColor: "#1E1F23",

  // Spacing and sizing
  spacing: 6,
  gridSize: 8,
  rowHeight: 50,

  // Browser scheme
  browserColorScheme: "dark",
});

// Light theme for ag-grid
const lightTheme = themeQuartz.withParams({
  // Main background colors
  backgroundColor: "#F9FAFB",
  oddRowBackgroundColor: "#F3F4F6",
  evenRowBackgroundColor: "#FFFFFF",

  // Header styling
  chromeBackgroundColor: "#E5E7EB",
  headerBackgroundColor: "#E5E7EB",
  headerTextColor: "#374151",
  headerFontSize: 14,
  headerFontWeight: 600,
  headerHeight: 48,

  // Text colors
  foregroundColor: "#111827",
  secondaryForegroundColor: "#6B7280",
  subtleTextColor: "#9CA3AF",

  // Borders and lines
  borderColor: "#D1D5DB",
  rowBorderColor: "#E5E7EB",

  // Interactive elements
  selectedRowBackgroundColor: "#2563EB20",
  rangeSelectionBackgroundColor: "#2563EB10",

  // Input and filter styling
  inputBackgroundColor: "#FFFFFF",
  inputBorderColor: "#D1D5DB",
  inputTextColor: "#111827",
  inputPlaceholderTextColor: "#9CA3AF",

  // Buttons and controls
  buttonBackgroundColor: "#E5E7EB",
  buttonTextColor: "#111827",

  // Scrollbars
  scrollbarThumbBackgroundColor: "#D1D5DB",
  scrollbarTrackBackgroundColor: "#F3F4F6",

  // Focus and hover states
  cellHorizontalBorder: true,
  rowHoverColor: "#F1F5F9",

  // Spacing and sizing
  spacing: 6,
  gridSize: 8,
  rowHeight: 50,

  // Browser scheme
  browserColorScheme: "light",
});

const RolesManagement = () => {
  const { canRead } = usePermissions();
  const [activeTab, setActiveTab] = useState("roles");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useGetRolesQuery();

  const {
    data: permissionsResponse,
    isLoading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = useGetPermissionsQuery();

  // CRUD mutations
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  // Extract data correctly from response
  const roles = rolesResponse?.roles || [];
  const permissions = permissionsResponse?.permissions || [];

  // Debug logging
  console.log("🔍 RolesManagement Debug:");
  console.log("  - Roles Response:", rolesResponse);
  console.log("  - Roles Array:", roles);
  console.log("  - Roles Loading:", rolesLoading);
  console.log("  - Roles Error:", rolesError);
  console.log("  - Permissions Response:", permissionsResponse);
  console.log("  - Permissions Array:", permissions);
  console.log("  - Permissions Loading:", permissionsLoading);
  console.log("  - Permissions Error:", permissionsError);

  // Debug específico para users_count
  if (roles && roles.length > 0) {
    console.log("🔍 Users Count Debug:");
    roles.forEach((role, index) => {
      console.log(`  - Role ${index}: ${role.role_name}`);
      console.log(`    - users_count: ${role.users_count}`);
      console.log(`    - ccn_role: ${role.ccn_role}`);
      console.log(`    - Full role object:`, role);
    });
  }

  // Detect theme changes more effectively (siguiendo patrón de PumpCRUD)
  useEffect(() => {
    const detectTheme = () => {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;

      const hasDarkClassHtml = htmlElement.classList.contains("dark");
      const hasDarkClassBody = bodyElement.classList.contains("dark");

      const htmlTheme = htmlElement.getAttribute("data-theme");
      const bodyTheme = bodyElement.getAttribute("data-theme");

      let newDarkMode;

      if (hasDarkClassHtml || hasDarkClassBody) {
        newDarkMode = true;
      } else if (htmlTheme === "light" || bodyTheme === "light") {
        newDarkMode = false;
      } else if (htmlTheme === "dark" || bodyTheme === "dark") {
        newDarkMode = true;
      } else if (
        htmlElement.classList.contains("light") ||
        bodyElement.classList.contains("light")
      ) {
        newDarkMode = false;
      } else if (
        htmlElement.className.includes("theme") ||
        bodyElement.className.includes("theme")
      ) {
        newDarkMode = false;
      } else if (!htmlElement.className && !bodyElement.className) {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        newDarkMode = prefersDark;
      } else {
        newDarkMode = false;
      }

      setIsDarkMode(newDarkMode);
    };

    detectTheme();

    const htmlObserver = new MutationObserver(detectTheme);
    const bodyObserver = new MutationObserver(detectTheme);

    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", detectTheme);

    return () => {
      htmlObserver.disconnect();
      bodyObserver.disconnect();
      mediaQuery.removeEventListener("change", detectTheme);
    };
  }, []);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const isMobileSize = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(isMobileSize);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get current theme
  const getCurrentTheme = () => {
    return isDarkMode ? darkTheme : lightTheme;
  };

  // Retry logic for failed requests
  useEffect(() => {
    if (rolesError) {
      console.error("🚨 Error loading roles:", rolesError);
      // Retry after 2 seconds if there's an error
      setTimeout(() => {
        console.log("🔄 Retrying roles fetch...");
        refetchRoles();
      }, 2000);
    }
  }, [rolesError, refetchRoles]);

  useEffect(() => {
    if (permissionsError) {
      console.error("🚨 Error loading permissions:", permissionsError);
      // Retry after 2 seconds if there's an error
      setTimeout(() => {
        console.log("🔄 Retrying permissions fetch...");
        refetchPermissions();
      }, 2000);
    }
  }, [permissionsError, refetchPermissions]);

  // CRUD functions for roles
  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (
      window.confirm(`Are you sure you want to delete the role "${roleName}"?`)
    ) {
      try {
        await deleteRole(roleId).unwrap();
        toast.success("Role deleted successfully");
      } catch (error) {
        toast.error(
          "Error deleting role: " + (error.data?.error || error.message)
        );
      }
    }
  };

  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  };

  if (!canRead("roles")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark">
              Roles & Permissions Management
            </h1>
            <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
              Manage roles, permissions and user assignments
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab("roles")}
              className={`py-3 px-6 font-medium text-sm transition-all duration-300 ${
                activeTab === "roles"
                  ? "glass-tab active text-blue-600 dark:text-blue-400"
                  : "glass-tab text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
              }`}
            >
              <UserGroupIcon className="h-5 w-5 inline mr-2" />
              Roles
            </button>

            <button
              onClick={() => setActiveTab("permissions")}
              className={`py-3 px-6 font-medium text-sm transition-all duration-300 ${
                activeTab === "permissions"
                  ? "glass-tab active text-blue-600 dark:text-blue-400"
                  : "glass-tab text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
              }`}
            >
              <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
              Permissions
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`py-3 px-6 font-medium text-sm transition-all duration-300 ${
                activeTab === "users"
                  ? "glass-tab active text-blue-600 dark:text-blue-400"
                  : "glass-tab text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
              }`}
            >
              <UserGroupIcon className="h-5 w-5 inline mr-2" />
              Users
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="glass-card">
          {activeTab === "roles" && (
            <RolesTab
              roles={roles}
              permissions={permissions}
              isLoading={rolesLoading}
              error={rolesError}
              refetchRoles={refetchRoles}
              onCreateRole={handleCreateRole}
              onEditRole={handleEditRole}
              onDeleteRole={handleDeleteRole}
              onManagePermissions={handleManagePermissions}
              isDarkMode={isDarkMode}
              getCurrentTheme={getCurrentTheme}
              isMobile={isMobile}
            />
          )}

          {activeTab === "permissions" && (
            <PermissionsTab
              permissions={permissions}
              isLoading={permissionsLoading}
              error={permissionsError}
              refetchPermissions={refetchPermissions}
              isDarkMode={isDarkMode}
              getCurrentTheme={getCurrentTheme}
              isMobile={isMobile}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              roles={roles}
              isDarkMode={isDarkMode}
              getCurrentTheme={getCurrentTheme}
              isMobile={isMobile}
            />
          )}
        </div>

        {/* Modales */}
        {showRoleModal && (
          <RoleModal
            role={editingRole}
            onClose={() => setShowRoleModal(false)}
            onSave={async (roleData) => {
              try {
                if (editingRole) {
                  await updateRole({
                    roleId: editingRole.ccn_role,
                    roleData,
                  }).unwrap();
                  toast.success("Role updated successfully");
                } else {
                  await createRole(roleData).unwrap();
                  toast.success("Role created successfully");
                }
                setShowRoleModal(false);
              } catch (error) {
                toast.error("Error: " + (error.data?.error || error.message));
              }
            }}
            isLoading={creating || updating}
          />
        )}

        {showPermissionsModal && selectedRole && (
          <PermissionsModal
            role={selectedRole}
            permissions={permissions}
            onClose={() => setShowPermissionsModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Component for Roles tab with AG Grid
const RolesTab = ({
  roles,
  permissions,
  isLoading,
  error,
  refetchRoles,
  onCreateRole,
  onEditRole,
  onDeleteRole,
  onManagePermissions,
  isDarkMode,
  getCurrentTheme,
  isMobile,
}) => {
  // Removed unused permissions

  // Asegurar que roles sea un array
  const rolesArray = Array.isArray(roles) ? roles : [];

  // Action buttons renderer
  const ActionButtonsRenderer = (params) => {
    return (
      <div className="flex gap-2 justify-center items-center h-full py-0">
        <PermissionGuard resource="roles" action="update">
          <button
            onClick={() => onEditRole(params.data)}
            className="px-2.5 py-1.5 text-xs font-medium text-green-500 rounded-lg hover:text-green-600 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
            title="Editar Rol"
          >
            <PencilIcon className="w-4 h-4 text-gray-500" />
          </button>
        </PermissionGuard>

        <PermissionGuard resource="roles" action="delete">
          <button
            onClick={() =>
              onDeleteRole(params.data.ccn_role, params.data.role_name)
            }
            className="px-2.5 py-1.5 text-xs font-medium text-red-500 rounded-lg hover:text-red-600 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
            title="Eliminar Rol"
          >
            <TrashIcon className="w-4 h-4 text-gray-500" />
          </button>
        </PermissionGuard>
      </div>
    );
  };

  // Column definitions
  const colDefs = [
    {
      field: "role_name",
      headerName: "Role",
      flex: 2,
      minWidth: 200,
      filter: true,
      floatingFilter: true,
      pinned: "left",
      cellRenderer: (params) => {
        // Usamos min-h-[48px] para asegurar altura mínima igual al rowHeight de AG Grid (ajusta si tu rowHeight es diferente)
        // items-center y h-full para centrar verticalmente
        return (
          <div className="flex items-center h-full min-h-[48px] py-0">
            <div className="flex-shrink-0 h-8 w-8 mr-5 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 leading-none">
                  {params.value.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm font-medium text-do_text_light dark:text-do_text_dark leading-tight">
                {params.value}
              </div>
              <div className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark leading-tight">
                ID: {params.data.ccn_role}
              </div>
            </div>
          </div>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-left !text-do_text_light dark:!text-do_text_dark flex items-center min-h-[48px]",
    },
    {
      field: "permissions_count",
      headerName: "Permissions",
      flex: 1,
      minWidth: 150,
      filter: true,
      floatingFilter: true,
      valueGetter: () => {
        return "View Permissions";
      },
      cellRenderer: (params) => {
        // Horizontal and vertical centering like the previous column (Role)
        return (
          <div className="flex items-center h-full min-h-[48px] py-0">
            <div className="flex flex-col justify-center w-full items-center">
              <button
                onClick={() => onManagePermissions(params.data)}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium">Manage</span>
              </button>
            </div>
          </div>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-left !text-do_text_light dark:!text-do_text_dark flex items-center min-h-[48px]",
    },
    {
      field: "users_count",
      headerName: "Users",
      flex: 1,
      minWidth: 120,
      filter: false,
      valueGetter: (params) => params.data.users_count || 0,
      cellRenderer: (params) => {
        const count = params.data.users_count || 0;
        // Mensaje descriptivo para el administrador sobre cuántos usuarios usan este rol
        if (count === 0) {
          return (
            <div className="flex items-center h-full min-h-[48px] py-0 justify-start w-full">
              <span className="text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark leading-tight text-left">
                <span className="mr-1">😶</span>
                No users have this role
              </span>
            </div>
          );
        } else if (count === 1) {
          return (
            <div className="flex items-center h-full min-h-[48px] py-0 justify-start w-full">
              <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark leading-tight text-left">
                <span className="font-bold text-blue-600 dark:text-blue-400 mr-1">
                  1
                </span>
                user has this role 🎯
              </span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center h-full min-h-[48px] py-0 justify-start w-full">
              <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark leading-tight text-left">
                <span className="font-bold text-blue-600 dark:text-blue-400 mr-1">
                  {count}
                </span>
                users have this role 🎉
              </span>
            </div>
          );
        }
      },
      headerClass: "!text-center",
      cellClass:
        "!text-left !text-do_text_light dark:!text-do_text_dark flex items-center min-h-[48px] justify-start",
    },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      maxWidth: 200,
      cellRenderer: ActionButtonsRenderer,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-center !text-do_text_light dark:!text-do_text_dark flex items-center justify-center min-h-[48px]",
      sortable: false,
      filter: false,
      hide: isMobile,
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          Error loading roles: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark">
          System Roles ({rolesArray.length})
        </h2>

        <PermissionGuard resource="roles" action="create">
          <button
            onClick={onCreateRole}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Role
          </button>
        </PermissionGuard>
      </div>

      {/* Status Bar - Minimalist style */}
      <div className="bg-gray-800 dark:bg-gray-700 rounded-lg px-4 py-3 flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="text-gray-300 dark:text-gray-300 text-sm font-medium">
            Synchronization Status
          </span>
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-600 dark:text-blue-400 text-sm">
                Syncing...
              </span>
            </div>
          )}
          {!isLoading && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
              <span className="text-green-600 dark:text-green-400 text-sm">
                Synced
              </span>
            </div>
          )}
        </div>

        <button
          onClick={async () => {
            console.log("🔄 Manual refresh triggered for roles");
            try {
              await refetchRoles();
              console.log("✅ Roles data refreshed successfully");
            } catch (error) {
              console.error("❌ Error refreshing roles data:", error);
            }
          }}
          className="flex items-center gap-2 text-gray-300 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-400 transition-colors px-3 py-1 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600"
          disabled={isLoading}
        >
          {isLoading ? (
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

      {rolesArray.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
            No roles available
          </p>
        </div>
      ) : (
        <div className="h-96 w-full">
          <AgGridReact
            rowData={rolesArray}
            columnDefs={colDefs}
            theme={getCurrentTheme()}
            pagination={true}
            paginationPageSize={10}
            suppressMenuHide={true}
            enableCellTextSelection={true}
            ensureDomOrder={true}
            animateRows={true}
            rowHeight={50}
            headerHeight={48}
            floatingFiltersHeight={35}
            domLayout="normal"
            suppressHorizontalScroll={false}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: false,
              floatingFilter: false,
              suppressMovable: true,
              flex: 1,
            }}
            onGridReady={(params) => {
              setTimeout(() => {
                params.api.sizeColumnsToFit();
              }, 100);
            }}
            onFirstDataRendered={(params) => {
              setTimeout(() => {
                params.api.sizeColumnsToFit();
              }, 100);
            }}
            onGridSizeChanged={(params) => {
              params.api.sizeColumnsToFit();
            }}
            suppressRowClickSelection={true}
            suppressCellSelection={true}
          />
        </div>
      )}
    </div>
  );
};

// Component for Permissions tab with AG Grid
const PermissionsTab = ({
  permissions,
  isLoading,
  error,
  refetchPermissions,
  isDarkMode,
  getCurrentTheme,
  isMobile,
}) => {
  // Ensure permissions is an array
  const permissionsArray = Array.isArray(permissions) ? permissions : [];

  // Column definitions for permissions
  const colDefs = [
    {
      field: "resource",
      headerName: "Resource",
      flex: 1,
      minWidth: 150,
      filter: true,
      floatingFilter: true,
      pinned: "left",
      cellRenderer: (params) => {
        return (
          <div className="flex items-center h-full min-h-[48px] py-0">
            <div className="flex-shrink-0 h-8 w-8 mr-5 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400 leading-none">
                  {params.value.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm font-medium text-do_text_light dark:text-do_text_dark capitalize leading-tight">
                {params.value}
              </div>
            </div>
          </div>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-left !text-do_text_light dark:!text-do_text_dark flex items-center min-h-[48px]",
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 120,
      filter: true,
      floatingFilter: true,
      cellRenderer: (params) => {
        const actionColors = {
          create: {
            container:
              "flex items-center gap-2 text-green-600 dark:text-green-400",
            dot: "w-2 h-2 bg-green-500 rounded-full",
            text: "text-sm font-medium",
          },
          read: {
            container:
              "flex items-center gap-2 text-blue-600 dark:text-blue-400",
            dot: "w-2 h-2 bg-blue-400 rounded-full",
            text: "text-sm font-medium",
          },
          update: {
            container:
              "flex items-center gap-2 text-yellow-700 dark:text-yellow-300",
            dot: "w-2 h-2 bg-yellow-400 rounded-full",
            text: "text-sm font-medium",
          },
          delete: {
            container:
              "flex items-center gap-2 text-rose-700 dark:text-rose-400",
            dot: "w-2 h-2 bg-rose-500 rounded-full",
            text: "text-sm font-medium",
          },
        };

        const action = actionColors[params.value] || {
          container: "flex items-center gap-2 text-gray-600 dark:text-gray-400",
          dot: "w-2 h-2 bg-gray-400 rounded-full",
          text: "text-sm font-medium",
        };

        const displayValue = params.value
          ? params.value.charAt(0).toUpperCase() + params.value.slice(1)
          : "Unknown";

        return (
          <div className="flex items-center h-full min-h-[48px] py-0">
            <div className="flex flex-col justify-center w-full items-center">
              <div
                className={`${action.container} justify-center items-center h-full`}
              >
                <div className={action.dot}></div>
                <span className={action.text}>{displayValue}</span>
              </div>
            </div>
          </div>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-left !text-do_text_light dark:!text-do_text_dark flex items-center min-h-[48px]",
    },
    {
      field: "permission_name",
      headerName: "Permission Name",
      flex: 2,
      minWidth: 200,
      filter: true,
      floatingFilter: true,
      cellRenderer: (params) => {
        return (
          <div className="flex items-center h-full min-h-[48px] py-0">
            <div className="flex flex-col justify-center">
              <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark leading-tight">
                {params.value}
              </span>
            </div>
          </div>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-left !text-do_text_light dark:!text-do_text_dark flex items-center min-h-[48px]",
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      filter: true,
      floatingFilter: true,
      cellRenderer: (params) => {
        return (
          <div className="flex items-center h-full min-h-[48px] py-0">
            <div className="flex flex-col justify-center">
              <span className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark leading-tight">
                {params.value || "No description"}
              </span>
            </div>
          </div>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-left !text-do_text_light dark:!text-do_text_dark flex items-center min-h-[48px]",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          Error loading permissions: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark mb-6">
        System Permissions ({permissionsArray.length})
      </h2>

      {/* Status Bar - Minimalist style */}
      <div className="bg-gray-800 dark:bg-gray-700 rounded-lg px-4 py-3 flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="text-gray-300 dark:text-gray-300 text-sm font-medium">
            Synchronization Status
          </span>
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-600 dark:text-blue-400 text-sm">
                Syncing...
              </span>
            </div>
          )}
          {!isLoading && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
              <span className="text-green-600 dark:text-green-400 text-sm">
                Synced
              </span>
            </div>
          )}
        </div>

        <button
          onClick={async () => {
            console.log("🔄 Manual refresh triggered for permissions");
            try {
              await refetchPermissions();
              console.log("✅ Permissions data refreshed successfully");
            } catch (error) {
              console.error("❌ Error refreshing permissions data:", error);
            }
          }}
          className="flex items-center gap-2 text-gray-300 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-400 transition-colors px-3 py-1 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600"
          disabled={isLoading}
        >
          {isLoading ? (
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

      {permissionsArray.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
            No permissions available
          </p>
        </div>
      ) : (
        <div className="h-96 w-full">
          <AgGridReact
            rowData={permissionsArray}
            columnDefs={colDefs}
            theme={getCurrentTheme()}
            pagination={true}
            paginationPageSize={15}
            suppressMenuHide={true}
            enableCellTextSelection={true}
            ensureDomOrder={true}
            animateRows={true}
            rowHeight={50}
            headerHeight={48}
            floatingFiltersHeight={35}
            domLayout="normal"
            suppressHorizontalScroll={false}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: false,
              floatingFilter: false,
              suppressMovable: true,
              flex: 1,
            }}
            onGridReady={(params) => {
              setTimeout(() => {
                params.api.sizeColumnsToFit();
              }, 100);
            }}
            onFirstDataRendered={(params) => {
              setTimeout(() => {
                params.api.sizeColumnsToFit();
              }, 100);
            }}
            onGridSizeChanged={(params) => {
              params.api.sizeColumnsToFit();
            }}
            suppressRowClickSelection={true}
            suppressCellSelection={true}
          />
        </div>
      )}
    </div>
  );
};

// Component for Users tab with AG Grid
const UsersTab = ({ roles, isDarkMode, getCurrentTheme, isMobile }) => {
  // Removed unused permissions
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch: refetchUsers,
  } = useGetUsersQuery();
  const [assignRole] = useAssignRoleToUserMutation();
  const [removeRole] = useRemoveRoleFromUserMutation();
  const [showUserRoleModal, setShowUserRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const users = usersResponse?.users || [];

  // Action buttons renderer
  const ActionButtonsRenderer = (params) => {
    return (
      <div className="flex gap-2 justify-center items-center h-full py-0">
        <PermissionGuard resource="users" action="update">
          <button
            onClick={() => handleManageUserRoles(params.data)}
            className="px-2.5 py-1.5 text-xs font-medium text-blue-500 rounded-lg hover:text-blue-600 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
            title="Gestionar Roles"
          >
            <PencilIcon className="w-4 h-4 text-gray-500" />
          </button>
        </PermissionGuard>
      </div>
    );
  };

  // Column definitions para usuarios
  const colDefs = [
    {
      field: "first_name",
      headerName: "Usuario",
      flex: 2,
      minWidth: 200,
      filter: true,
      floatingFilter: true,
      pinned: "left",
      cellRenderer: (params) => {
        return (
          <div className="flex items-center h-full min-h-[48px] py-0">
            <div className="flex-shrink-0 h-8 w-8 mr-5 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 leading-none">
                  {params.value.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm font-medium text-do_text_light dark:text-do_text_dark leading-tight">
                {params.value} {params.data.last_name}
              </div>
              <div className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark leading-tight">
                ID: {params.data.ccn_user}
              </div>
            </div>
          </div>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-left !text-do_text_light dark:!text-do_text_dark flex items-center min-h-[48px]",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 2,
      minWidth: 200,
      filter: true,
      floatingFilter: true,
      cellRenderer: (params) => {
        return (
          <div className="flex items-center h-full min-h-[48px] py-0">
            <div className="flex flex-col justify-center">
              <span className="text-sm text-do_text_light dark:text-do_text_dark leading-tight">
                {params.value}
              </span>
            </div>
          </div>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-left !text-do_text_light dark:!text-do_text_dark flex items-center min-h-[48px]",
    },
    {
      field: "roles",
      headerName: "Current Roles",
      flex: 1,
      filter: false,
      cellRenderer: (params) => {
        const userRoles = params.value || [];

        // Colors for different roles
        const roleColors = {
          admin: {
            container: "flex items-center gap-2 text-red-600 dark:text-red-400",
            dot: "w-2 h-2 bg-red-500 rounded-full",
            text: "text-xs font-medium",
          },
          guest: {
            container:
              "flex items-center gap-2 text-blue-600 dark:text-blue-400",
            dot: "w-2 h-2 bg-blue-400 rounded-full",
            text: "text-xs font-medium",
          },
          user: {
            container:
              "flex items-center gap-2 text-green-600 dark:text-green-400",
            dot: "w-2 h-2 bg-green-500 rounded-full",
            text: "text-xs font-medium",
          },
          moderator: {
            container:
              "flex items-center gap-2 text-purple-600 dark:text-purple-400",
            dot: "w-2 h-2 bg-purple-500 rounded-full",
            text: "text-xs font-medium",
          },
        };

        return (
          <div className="flex flex-wrap gap-2 items-center h-full min-h-[48px] justify-start py-0">
            {userRoles.length > 0 ? (
              userRoles.map((role) => {
                const roleStyle = roleColors[role.role_name.toLowerCase()] || {
                  container:
                    "flex items-center gap-2 text-gray-600 dark:text-gray-400",
                  dot: "w-2 h-2 bg-gray-400 rounded-full",
                  text: "text-xs font-medium",
                };

                return (
                  <div
                    key={role.ccn_role}
                    className={`${roleStyle.container} justify-center items-center`}
                  >
                    <div className={roleStyle.dot}></div>
                    <span className={roleStyle.text}>{role.role_name}</span>
                  </div>
                );
              })
            ) : (
              <span className="text-do_text_gray_light dark:text-do_text_gray_dark text-sm">
                No roles
              </span>
            )}
          </div>
        );
      },
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-left !text-do_text_light dark:!text-do_text_dark flex items-center min-h-[48px]",
    },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 120,
      maxWidth: 150,
      cellRenderer: ActionButtonsRenderer,
      headerClass: "text-center !text-do_text_light dark:!text-do_text_dark",
      cellClass:
        "!text-center !text-do_text_light dark:!text-do_text_dark flex items-center justify-center min-h-[48px]",
      sortable: false,
      filter: false,
      hide: isMobile,
    },
  ];

  const handleManageUserRoles = (user) => {
    setSelectedUser(user);
    setShowUserRoleModal(true);
  };

  const handleAssignRole = async (userId, roleName) => {
    try {
      await assignRole({ userId, roleName }).unwrap();
      toast.success("Role assigned successfully");
    } catch (error) {
      toast.error("Error: " + (error.data?.error || error.message));
    }
  };

  const handleRemoveRole = async (userId, roleName) => {
    try {
      await removeRole({ userId, roleName }).unwrap();
      toast.success("Role removed successfully");
    } catch (error) {
      toast.error("Error: " + (error.data?.error || error.message));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          Error loading users: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark mb-6">
          User Management ({users.length})
        </h2>

        {/* Status Bar - Minimalist style */}
        <div className="bg-gray-800 dark:bg-gray-700 rounded-lg px-4 py-3 flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-gray-300 dark:text-gray-300 text-sm font-medium">
              Synchronization Status
            </span>
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  Syncing...
                </span>
              </div>
            )}
            {!isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                <span className="text-green-600 dark:text-green-400 text-sm">
                  Synced
                </span>
              </div>
            )}
          </div>

          <button
            onClick={async () => {
              console.log("🔄 Manual refresh triggered for users");
              try {
                await refetchUsers();
                console.log("✅ Users data refreshed successfully");
              } catch (error) {
                console.error("❌ Error refreshing users data:", error);
              }
            }}
            className="flex items-center gap-2 text-gray-300 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-400 transition-colors px-3 py-1 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600"
            disabled={isLoading}
          >
            {isLoading ? (
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

        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
              No users available
            </p>
          </div>
        ) : (
          <div className="h-96 w-full">
            <AgGridReact
              rowData={users}
              columnDefs={colDefs}
              theme={getCurrentTheme()}
              pagination={true}
              paginationPageSize={10}
              suppressMenuHide={true}
              enableCellTextSelection={true}
              ensureDomOrder={true}
              animateRows={true}
              rowHeight={50}
              headerHeight={48}
              floatingFiltersHeight={35}
              domLayout="normal"
              suppressHorizontalScroll={false}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: false,
                floatingFilter: false,
                suppressMovable: true,
                flex: 1,
              }}
              onGridReady={(params) => {
                setTimeout(() => {
                  params.api.sizeColumnsToFit();
                }, 100);
              }}
              onFirstDataRendered={(params) => {
                setTimeout(() => {
                  params.api.sizeColumnsToFit();
                }, 100);
              }}
              onGridSizeChanged={(params) => {
                params.api.sizeColumnsToFit();
              }}
              suppressRowClickSelection={true}
              suppressCellSelection={true}
            />
          </div>
        )}
      </div>

      {/* Modal para gestionar roles de usuario */}
      {showUserRoleModal && selectedUser && (
        <UserRoleModal
          user={selectedUser}
          roles={roles}
          onClose={() => setShowUserRoleModal(false)}
          onAssignRole={handleAssignRole}
          onRemoveRole={handleRemoveRole}
        />
      )}
    </>
  );
};

// Modal para crear/editar roles
const RoleModal = ({ role, onClose, onSave, isLoading }) => {
  const [roleName, setRoleName] = useState(role?.role_name || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roleName.trim()) {
      onSave({ role_name: roleName.trim() });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl max-w-md w-full mx-4 border border-do_border_light dark:border-do_border_dark">
        <div className="flex items-center justify-between p-6 border-b border-do_border_light dark:border-do_border_dark">
          <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark">
            {role ? "Editar Rol" : "Crear Nuevo Rol"}
          </h3>
          <button
            onClick={onClose}
            className="text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="roleName"
              className="block text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2"
            >
              Nombre del Rol
            </label>
            <input
              type="text"
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-3 py-2 border border-do_border_light dark:border-do_border_dark rounded-md bg-do_bg_light dark:bg-do_bg_dark text-do_text_light dark:text-do_text_dark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingresa el nombre del rol"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-do_text_light dark:text-do_text_dark bg-do_bg_light dark:bg-do_bg_dark hover:bg-do_card_light dark:hover:bg-do_card_dark rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 border border-do_border_light dark:border-do_border_dark"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !roleName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Guardando..." : role ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para gestionar permisos de un rol
const PermissionsModal = ({ role, permissions, onClose }) => {
  const { data: rolePermissions, isLoading: loadingPermissions } =
    useGetRolePermissionsQuery(role.ccn_role);

  const [assignPermission] = useAssignPermissionToRoleMutation();
  const [removePermission] = useRemovePermissionFromRoleMutation();

  const rolePermsArray = rolePermissions?.permissions || [];
  const rolePermIds = new Set(rolePermsArray.map((p) => p.ccn_permission));

  const handleTogglePermission = async (permission) => {
    try {
      if (rolePermIds.has(permission.ccn_permission)) {
        await removePermission({
          roleId: role.ccn_role,
          permissionId: permission.ccn_permission,
        }).unwrap();
        toast.success("Permission removed successfully");
      } else {
        await assignPermission({
          roleId: role.ccn_role,
          permissionId: permission.ccn_permission,
        }).unwrap();
        toast.success("Permission assigned successfully");
      }
    } catch (error) {
      toast.error("Error: " + (error.data?.error || error.message));
    }
  };

  // Agrupar permisos por recurso
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden border border-do_border_light dark:border-do_border_dark">
        <div className="flex items-center justify-between p-6 border-b border-do_border_light dark:border-do_border_dark">
          <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark">
            Gestionar Permisos - {role.role_name}
          </h3>
          <button
            onClick={onClose}
            className="text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {loadingPermissions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-do_text_gray_light dark:text-do_text_gray_dark">
                Loading permissions...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(permissionsByResource).map(
                ([resource, resourcePermissions]) => (
                  <div
                    key={resource}
                    className="bg-do_bg_light dark:bg-do_bg_dark rounded-lg p-4 border border-do_border_light dark:border-do_border_dark"
                  >
                    <h4 className="text-lg font-medium text-do_text_light dark:text-do_text_dark mb-3 capitalize">
                      {resource}
                    </h4>
                    <div className="space-y-2">
                      {resourcePermissions.map((permission) => (
                        <label
                          key={permission.ccn_permission}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={rolePermIds.has(permission.ccn_permission)}
                            onChange={() => handleTogglePermission(permission)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-do_border_light dark:border-do_border_dark rounded bg-do_bg_light dark:bg-do_bg_dark"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark capitalize">
                              {permission.action}
                            </span>
                            <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
                              {permission.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-do_border_light dark:border-do_border_dark">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-do_text_light dark:text-do_text_dark bg-do_bg_light dark:bg-do_bg_dark hover:bg-do_card_light dark:hover:bg-do_card_dark rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 border border-do_border_light dark:border-do_border_dark"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para gestionar roles de un usuario
const UserRoleModal = ({
  user,
  roles,
  onClose,
  onAssignRole,
  onRemoveRole,
}) => {
  const [selectedRole, setSelectedRole] = useState("");

  // Current user roles
  const userRoleNames = new Set(user.roles.map((r) => r.role_name));

  // Available roles to assign
  const availableRoles = roles.filter(
    (role) => !userRoleNames.has(role.role_name)
  );

  const handleAssign = () => {
    if (selectedRole) {
      onAssignRole(user.ccn_user, selectedRole);
      setSelectedRole("");
    }
  };

  const handleRemove = (roleName) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres remover el rol "${roleName}" del usuario?`
      )
    ) {
      onRemoveRole(user.ccn_user, roleName);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl max-w-lg w-full mx-4 border border-do_border_light dark:border-do_border_dark">
        <div className="flex items-center justify-between p-6 border-b border-do_border_light dark:border-do_border_dark">
          <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark">
            Gestionar Roles - {user.first_name} {user.last_name}
          </h3>
          <button
            onClick={onClose}
            className="text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Roles actuales */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-do_text_light dark:text-do_text_dark mb-3">
              Roles Actuales:
            </h4>
            {user.roles.length > 0 ? (
              <div className="space-y-2">
                {user.roles.map((role) => (
                  <div
                    key={role.ccn_role}
                    className="flex items-center justify-between bg-do_bg_light dark:bg-do_bg_dark rounded-lg p-3 border border-do_border_light dark:border-do_border_dark"
                  >
                    <span className="text-sm font-medium text-do_text_light dark:text-do_text_dark">
                      {role.role_name}
                    </span>
                    <button
                      onClick={() => handleRemove(role.role_name)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-do_text_gray_light dark:text-do_text_gray_dark text-sm">
                El usuario no tiene roles asignados
              </p>
            )}
          </div>

          {/* Asignar nuevo rol */}
          <div>
            <h4 className="text-sm font-medium text-do_text_light dark:text-do_text_dark mb-3">
              Asignar Nuevo Rol:
            </h4>
            {availableRoles.length > 0 ? (
              <div className="flex space-x-3">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="flex-1 px-3 py-2 border border-do_border_light dark:border-do_border_dark rounded-md bg-do_bg_light dark:bg-do_bg_dark text-do_text_light dark:text-do_text_dark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar rol...</option>
                  {availableRoles.map((role) => (
                    <option key={role.ccn_role} value={role.role_name}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={!selectedRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            ) : (
              <p className="text-do_text_gray_light dark:text-do_text_gray_dark text-sm">
                No roles available to assign
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-do_border_light dark:border-do_border_dark">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-do_text_light dark:text-do_text_dark bg-do_bg_light dark:bg-do_bg_dark hover:bg-do_card_light dark:hover:bg-do_card_dark rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 border border-do_border_light dark:border-do_border_dark"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesManagement;
