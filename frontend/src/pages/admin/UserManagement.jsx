import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useAssignRoleToUserMutation,
  useRemoveRoleFromUserMutation,
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
import { getInitial } from "../../components/Header";

const UserManagement = () => {
  const { canRead } = usePermissions();

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter states
  const [userFilter, setUserFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");

  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetUsersQuery();

  const { data: rolesResponse, isLoading: rolesLoading } = useGetRolesQuery();

  // CRUD mutations
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [assignRoleToUser] = useAssignRoleToUserMutation();
  const [removeRoleFromUser] = useRemoveRoleFromUserMutation();

  // Extract data correctly from response
  const allUsers = usersResponse?.users || [];
  const roles = rolesResponse?.roles || [];

  // Filter users by name, email, and role
  const filteredUsers = allUsers.filter((user) => {
    const matchesName = `${user.first_name} ${user.middle_name || ""} ${
      user.last_name
    }`
      .toLowerCase()
      .includes(userFilter.toLowerCase());
    const matchesEmail = user.email
      .toLowerCase()
      .includes(userFilter.toLowerCase());
    const matchesRole = userRoleFilter
      ? user.roles?.some((role) => role.role_name === userRoleFilter)
      : true;
    return (matchesName || matchesEmail) && matchesRole;
  });

  // Helper: derive business area from role names (based on cargos/roles we created)
  const getUserArea = (user) => {
    const roleNames = (user.roles || []).map((r) => r.role_name || "").join(" ");
    const lower = roleNames.toLowerCase();

    if (
      lower.includes("dir_general") ||
      lower.includes("gerente") ||
      lower.includes("director")
    ) {
      return "Dirección General";
    }

    if (
      lower.includes("contador") ||
      lower.includes("contabilidad") ||
      lower.includes("analista_cxp") ||
      lower.includes("analista_cxc")
    ) {
      return "Finanzas y Contabilidad";
    }

    if (
      lower.includes("compras") ||
      lower.includes("jefe_compras") ||
      lower.includes("analista_compras") ||
      lower.includes("aux_compras")
    ) {
      return "Compras y Proveedores";
    }

    if (
      lower.includes("produccion") ||
      lower.includes("planta") ||
      lower.includes("operaria") ||
      lower.includes("almacen")
    ) {
      return "Operaciones y Producción";
    }

    if (
      lower.includes("it") ||
      lower.includes("sistemas") ||
      lower.includes("soporte") ||
      lower.includes("dev_")
    ) {
      return "Tecnología (IT)";
    }

    if (lower.includes("calidad") || lower.includes("auditor")) {
      return "Calidad y Auditoría";
    }

    return "Otros";
  };

  // Group users by area for table view (desktop)
  const groupedUsersByArea = useMemo(() => {
    const groups = {};
    filteredUsers.forEach((user) => {
      const area = getUserArea(user);
      if (!groups[area]) groups[area] = [];
      groups[area].push(user);
    });
    // Keep areas in a stable, meaningful order
    const order = [
      "Dirección General",
      "Finanzas y Contabilidad",
      "Compras y Proveedores",
      "Operaciones y Producción",
      "Tecnología (IT)",
      "Calidad y Auditoría",
      "Otros",
    ];
    return order
      .filter((area) => groups[area]?.length)
      .map((area) => ({ area, users: groups[area] }));
  }, [filteredUsers]);

  // Handle user creation
  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData).unwrap();
      toast.success("User created successfully!");
      setShowUserModal(false);
      refetchUsers();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  // Handle user update
  const handleUpdateUser = async (userData) => {
    try {
      // Backend expects email_user and password_user for PUT
      // Include all user fields
      const backendData = {
        email_user: userData.email,
        password_user: userData.password || "no_change",
        first_name: userData.first_name,
        middle_name: userData.middle_name,
        last_name: userData.last_name,
      };
      await updateUser({
        userId: editingUser.ccn_user,
        userData: backendData,
      }).unwrap();
      toast.success("User updated successfully!");
      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId).unwrap();
        toast.success("User deleted successfully!");
        refetchUsers();
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete user");
      }
    }
  };

  // Handle role assignment
  const handleAssignRole = async (userId, roleName) => {
    try {
      await assignRoleToUser({ userId, roleName }).unwrap();
      toast.success("Role assigned successfully!");
      refetchUsers();
      setShowRoleModal(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign role");
    }
  };

  // Handle role removal
  const handleRemoveRole = async (userId, roleName) => {
    try {
      await removeRoleFromUser({ userId, roleName }).unwrap();
      toast.success("Role removed successfully!");
      refetchUsers();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to remove role");
    }
  };

  if (!canRead("users")) {
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
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage users, roles, and permissions
        </p>
      </div>

      {/* Users Table */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Users ({filteredUsers.length})
          </h2>
          <button
            onClick={() => setShowUserModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Filters for users */}
        <div className="mb-6 space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.ccn_role} value={role.role_name}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {usersLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading users...
            </p>
          </div>
        ) : usersError ? (
          <div className="text-center py-8">
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              <p className="font-bold">Error loading users:</p>
              <p>{usersError?.message || "Unknown error"}</p>
              <button
                onClick={() => refetchUsers()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View grouped by area */}
            <div className="hidden md:block space-y-6">
              {groupedUsersByArea.map(({ area, users }) => (
                <div
                  key={area}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {area}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {users.length} usuarios
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Roles
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Created At
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                          <tr
                            key={user.ccn_user}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border border-gray-200 dark:border-gray-700 shadow-sm bg-gradient-to-br from-gray-700 to-gray-500">
                                {getInitial(user.email)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {user.first_name} {user.middle_name || ""}{" "}
                              {user.last_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex flex-wrap gap-1">
                                {user.roles && user.roles.length > 0 ? (
                                  user.roles.map((role, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-1"
                                    >
                                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                                        {role.role_name}
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleRemoveRole(
                                            user.ccn_user,
                                            role.role_name
                                          )
                                        }
                                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                                        title="Remove role"
                                      >
                                        <XMarkIcon className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-gray-400 italic">
                                    No roles
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingUser(user);
                                    setShowUserModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Edit user"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowRoleModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Assign role"
                                >
                                  <ShieldCheckIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteUser(user.ccn_user)
                                  }
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete user"
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
                </div>
              ))}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.ccn_user}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.first_name} {user.middle_name || ""}{" "}
                        {user.last_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit user"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Assign role"
                      >
                        <ShieldCheckIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.ccn_user)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete user"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="font-medium mr-2">Created:</span>
                    <span>
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium mr-2">Roles:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                              {role.role_name}
                            </span>
                            <button
                              onClick={() =>
                                handleRemoveRole(user.ccn_user, role.role_name)
                              }
                              className="text-red-600 hover:text-red-900 dark:text-red-400"
                              title="Remove role"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 italic text-xs">
                          No roles
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingUser ? "Edit User" : "Create User"}
              </h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
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
                const userData = {
                  first_name: formData.get("first_name"),
                  middle_name: formData.get("middle_name"),
                  last_name: formData.get("last_name"),
                  email: formData.get("email"),
                  password: formData.get("password"),
                };

                // Backend requires password for both create and update
                if (editingUser) {
                  handleUpdateUser(userData);
                } else {
                  handleCreateUser(userData);
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  defaultValue={editingUser?.first_name || ""}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middle_name"
                  defaultValue={editingUser?.middle_name || ""}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  defaultValue={editingUser?.last_name || ""}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingUser?.email || ""}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password {editingUser ? "(leave empty to keep current)" : "*"}
                </label>
                <input
                  type="password"
                  name="password"
                  required={!editingUser}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
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
                    : editingUser
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assign Role to {selectedUser.first_name}{" "}
                {selectedUser.last_name}
              </h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Role
              </label>
              {rolesLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {roles.map((role) => (
                    <button
                      key={role.ccn_role}
                      onClick={() =>
                        handleAssignRole(selectedUser.ccn_user, role.role_name)
                      }
                      disabled={selectedUser.roles?.some(
                        (r) => r.role_name === role.role_name
                      )}
                      className={`w-full text-left px-4 py-2 rounded-md border transition-colors ${
                        selectedUser.roles?.some(
                          (r) => r.role_name === role.role_name
                        )
                          ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {role.role_name}
                        </span>
                        {selectedUser.roles?.some(
                          (r) => r.role_name === role.role_name
                        ) && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            Already assigned
                          </span>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {role.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
