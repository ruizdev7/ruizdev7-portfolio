import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGetRolePermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useAssignPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
} from "../../RTK_Query_app/services/roles/rolesApi";
import { usePermissions } from "../../hooks/usePermissions";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Permission Modal Component
const PermissionModal = ({
  editingPermission,
  availableResources,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    permission_name: editingPermission?.permission_name || "",
    resource: editingPermission?.resource || "",
    action: editingPermission?.action || "read",
    description: editingPermission?.description || "",
  });

  const [hasUserEdited, setHasUserEdited] = useState({
    permission_name: false,
    description: false,
  });

  // Initialize hasUserEdited when editing
  useEffect(() => {
    if (editingPermission) {
      setHasUserEdited({ permission_name: true, description: true });
    }
  }, [editingPermission]);

  // Generate permission name and description when resource or action changes
  useEffect(() => {
    if (editingPermission) return; // Don't auto-generate when editing

    if (formData.resource && formData.action) {
      // Auto-generate permission name
      if (!hasUserEdited.permission_name) {
        const newPermissionName = `${formData.resource}_${formData.action}`;
        setFormData((prev) => ({
          ...prev,
          permission_name: newPermissionName,
        }));
      }

      // Auto-generate description
      if (!hasUserEdited.description) {
        const actionLabels = {
          create: "Create",
          read: "Read",
          update: "Update",
          delete: "Delete",
        };

        const resourceLabels = {
          posts: "posts",
          users: "users",
          pumps: "pumps",
          categories: "categories",
          comments: "comments",
          roles: "roles",
        };

        const resourceLabel =
          resourceLabels[formData.resource] || formData.resource;
        const newDescription = `${
          actionLabels[formData.action]
        } ${resourceLabel}`;
        setFormData((prev) => ({ ...prev, description: newDescription }));
      }
    }
  }, [formData.resource, formData.action, editingPermission, hasUserEdited]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPermission) {
      onSubmit({
        ...formData,
        ccn_permission: editingPermission.ccn_permission,
      });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingPermission ? "Edit Permission" : "Create Permission"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permission Name
            </label>
            <input
              type="text"
              value={formData.permission_name}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  permission_name: e.target.value,
                }));
                setHasUserEdited((prev) => ({
                  ...prev,
                  permission_name: true,
                }));
              }}
              required
              disabled={!!editingPermission}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resource
            </label>
            <input
              type="text"
              list="available-resources"
              value={formData.resource}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, resource: e.target.value }));
                setHasUserEdited((prev) => ({
                  ...prev,
                  permission_name: false,
                  description: false,
                }));
              }}
              placeholder="Type or select a resource..."
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <datalist id="available-resources">
              {availableResources.map((resource) => (
                <option key={resource.value} value={resource.value}>
                  {resource.label}
                </option>
              ))}
            </datalist>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Action
            </label>
            <select
              value={formData.action}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, action: e.target.value }));
                setHasUserEdited((prev) => ({
                  ...prev,
                  permission_name: false,
                  description: false,
                }));
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
                setHasUserEdited((prev) => ({ ...prev, description: true }));
              }}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : editingPermission
                ? "Update"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Separate component for role permissions modal
const RolePermissionsModal = ({
  role,
  permissions,
  onClose,
  onAssign,
  onRemove,
}) => {
  const [assignedPermissions, setAssignedPermissions] = useState([]);
  const { data: rolePermissionsResponse, isLoading: loadingPermissions } =
    useGetRolePermissionsQuery(role.ccn_role);

  useEffect(() => {
    if (rolePermissionsResponse?.permissions) {
      setAssignedPermissions(
        rolePermissionsResponse.permissions.map((p) => p.ccn_permission)
      );
    }
  }, [rolePermissionsResponse]);

  const togglePermission = async (permissionId) => {
    if (assignedPermissions.includes(permissionId)) {
      await onRemove(role.ccn_role, permissionId);
      setAssignedPermissions(
        assignedPermissions.filter((id) => id !== permissionId)
      );
    } else {
      await onAssign(role.ccn_role, permissionId);
      setAssignedPermissions([...assignedPermissions, permissionId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Manage Permissions for {role.role_name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Assign or remove permissions for this role
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {loadingPermissions ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading permissions...
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permissions.map((permission) => {
                const isAssigned = assignedPermissions.includes(
                  permission.ccn_permission
                );
                return (
                  <div
                    key={permission.ccn_permission}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isAssigned
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => togglePermission(permission.ccn_permission)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={() =>
                          togglePermission(permission.ccn_permission)
                        }
                        className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {permission.permission_name}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                            {permission.resource}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs">
                            {permission.action}
                          </span>
                        </div>
                        {permission.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const RolesManagement = () => {
  const { canRead } = usePermissions();
  const [activeTab, setActiveTab] = useState("roles");

  // Predefined resources
  const availableResources = [
    { value: "posts", label: "Posts" },
    { value: "users", label: "Users" },
    { value: "pumps", label: "Pumps" },
    { value: "categories", label: "Categories" },
    { value: "comments", label: "Comments" },
    { value: "roles", label: "Roles" },
  ];

  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [showRolePermissionsModal, setShowRolePermissionsModal] =
    useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
    useState(null);

  // Filter states
  const [roleFilter, setRoleFilter] = useState("");
  const [permissionFilter, setPermissionFilter] = useState("");
  const [permissionResourceFilter, setPermissionResourceFilter] = useState("");

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
  const [createPermission, { isLoading: creatingPermission }] =
    useCreatePermissionMutation();
  const [updatePermission, { isLoading: updatingPermission }] =
    useUpdatePermissionMutation();
  const [deletePermission] = useDeletePermissionMutation();
  const [assignPermissionToRole] = useAssignPermissionToRoleMutation();
  const [removePermissionFromRole] = useRemovePermissionFromRoleMutation();

  // Extract data correctly from response
  const allRoles = rolesResponse?.roles || [];
  const allPermissions = permissionsResponse?.permissions || [];

  // Extract unique resources from existing permissions
  const existingResources = [...new Set(allPermissions.map((p) => p.resource))];

  // Combine predefined and existing resources
  const availableResourcesWithExisting = [
    ...availableResources,
    ...existingResources
      .filter(
        (resource) => !availableResources.find((r) => r.value === resource)
      )
      .map((resource) => ({
        value: resource,
        label: resource.charAt(0).toUpperCase() + resource.slice(1),
      })),
  ];

  // Filter roles by name
  const filteredRoles = allRoles.filter((role) =>
    role.role_name.toLowerCase().includes(roleFilter.toLowerCase())
  );

  // Filter permissions by name, resource, and action
  const filteredPermissions = allPermissions.filter((permission) => {
    const matchesName = permission.permission_name
      .toLowerCase()
      .includes(permissionFilter.toLowerCase());
    const matchesResource = permissionResourceFilter
      ? permission.resource === permissionResourceFilter
      : true;
    return matchesName && matchesResource;
  });

  // Handle role creation
  const handleCreateRole = async (roleData) => {
    try {
      await createRole(roleData).unwrap();
      toast.success("Role created successfully!");
      setShowRoleModal(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create role");
    }
  };

  // Handle role update
  const handleUpdateRole = async (roleData) => {
    try {
      await updateRole({
        roleId: roleData.ccn_role,
        roleData: {
          role_name: roleData.role_name,
        },
      }).unwrap();
      toast.success("Role updated successfully!");
      setShowRoleModal(false);
      setEditingRole(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update role");
    }
  };

  // Handle role deletion
  const handleDeleteRole = async (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRole(roleId).unwrap();
        toast.success("Role deleted successfully!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete role");
      }
    }
  };

  // Handle permission creation
  const handleCreatePermission = async (permissionData) => {
    try {
      await createPermission(permissionData).unwrap();
      toast.success("Permission created successfully!");
      setShowPermissionModal(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create permission");
    }
  };

  // Handle permission update
  const handleUpdatePermission = async (permissionData) => {
    try {
      await updatePermission({
        permissionId: permissionData.ccn_permission,
        permissionData: {
          resource: permissionData.resource,
          action: permissionData.action,
          description: permissionData.description,
        },
      }).unwrap();
      toast.success("Permission updated successfully!");
      setShowPermissionModal(false);
      setEditingPermission(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update permission");
    }
  };

  // Handle permission deletion
  const handleDeletePermission = async (permissionId) => {
    if (window.confirm("Are you sure you want to delete this permission?")) {
      try {
        await deletePermission(permissionId).unwrap();
        toast.success("Permission deleted successfully!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete permission");
      }
    }
  };

  // Handle assign permission to role
  const handleAssignPermission = async (roleId, permissionId) => {
    try {
      await assignPermissionToRole({ roleId, permissionId }).unwrap();
      toast.success("Permission assigned successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign permission");
    }
  };

  // Handle remove permission from role
  const handleRemovePermission = async (roleId, permissionId) => {
    try {
      await removePermissionFromRole({ roleId, permissionId }).unwrap();
      toast.success("Permission removed successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to remove permission");
    }
  };

  if (!canRead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don&apos;t have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Roles Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage user roles and permissions
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("roles")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "roles"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Roles
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "permissions"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Permissions
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === "roles" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Roles ({filteredRoles.length})
            </h2>
            <button
              onClick={() => setShowRoleModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Role
            </button>
          </div>

          {/* Filter for roles */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search roles by name..."
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {rolesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading roles...
              </p>
            </div>
          ) : rolesError ? (
            <div className="text-center py-8">
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                <p className="font-bold">Error loading roles:</p>
                <p>{rolesError?.message || "Unknown error"}</p>
                <button
                  onClick={() => refetchRoles()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRoles.map((role) => (
                      <tr
                        key={role.ccn_role}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {role.role_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {role.users_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRoleForPermissions(role);
                                setShowRolePermissionsModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Manage permissions"
                            >
                              <ShieldCheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingRole(role);
                                setShowRoleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit role"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.ccn_role)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete role"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredRoles.map((role) => (
                  <div
                    key={role.ccn_role}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {role.role_name}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRoleForPermissions(role);
                            setShowRolePermissionsModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Manage permissions"
                        >
                          <ShieldCheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRole(role);
                            setShowRoleModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit role"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.ccn_role)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete role"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Users:</span>
                      <span>{role.users_count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "permissions" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Permissions ({filteredPermissions.length})
            </h2>
            <button
              onClick={() => setShowPermissionModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Permission
            </button>
          </div>

          {/* Filters for permissions */}
          <div className="mb-6 space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search permissions by name..."
                value={permissionFilter}
                onChange={(e) => setPermissionFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <select
                value={permissionResourceFilter}
                onChange={(e) => setPermissionResourceFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Resources</option>
                {availableResourcesWithExisting.map((resource) => (
                  <option key={resource.value} value={resource.value}>
                    {resource.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {permissionsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading permissions...
              </p>
            </div>
          ) : permissionsError ? (
            <div className="text-center py-8">
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                <p className="font-bold">Error loading permissions:</p>
                <p>{permissionsError?.message || "Unknown error"}</p>
                <button
                  onClick={() => refetchPermissions()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Permission Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPermissions.map((permission) => (
                      <tr
                        key={permission.ccn_permission}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {permission.permission_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {permission.resource}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {permission.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {permission.description || "No description"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingPermission(permission);
                                setShowPermissionModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit permission"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeletePermission(
                                  permission.ccn_permission
                                )
                              }
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete permission"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredPermissions.map((permission) => (
                  <div
                    key={permission.ccn_permission}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {permission.permission_name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                            {permission.resource}
                          </span>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                            {permission.action}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingPermission(permission);
                            setShowPermissionModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit permission"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeletePermission(permission.ccn_permission)
                          }
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete permission"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {permission.description || "No description"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingRole ? "Edit Role" : "Create Role"}
              </h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const roleData = {
                  role_name: formData.get("role_name"),
                };

                if (editingRole) {
                  roleData.ccn_role = editingRole.ccn_role;
                  handleUpdateRole(roleData);
                } else {
                  handleCreateRole(roleData);
                }
              }}
            >
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  name="role_name"
                  defaultValue={editingRole?.role_name || ""}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {creating || updating
                    ? "Saving..."
                    : editingRole
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <PermissionModal
          editingPermission={editingPermission}
          availableResources={availableResourcesWithExisting}
          onClose={() => {
            setShowPermissionModal(false);
            setEditingPermission(null);
          }}
          onSubmit={(permissionData) => {
            if (editingPermission) {
              handleUpdatePermission(permissionData);
            } else {
              handleCreatePermission(permissionData);
            }
          }}
          isSubmitting={creatingPermission || updatingPermission}
        />
      )}

      {/* Role Permissions Modal */}
      {showRolePermissionsModal && selectedRoleForPermissions && (
        <RolePermissionsModal
          role={selectedRoleForPermissions}
          permissions={allPermissions}
          onClose={() => {
            setShowRolePermissionsModal(false);
            setSelectedRoleForPermissions(null);
          }}
          onAssign={handleAssignPermission}
          onRemove={handleRemovePermission}
        />
      )}
    </div>
  );
};

export default RolesManagement;
