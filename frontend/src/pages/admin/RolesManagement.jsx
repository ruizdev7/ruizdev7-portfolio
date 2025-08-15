import React, { useState } from "react";
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useInitializeRolesMutation,
} from "../../RTK_Query_app/services/roles/rolesApi";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionGuard from "../../components/auth/PermissionGuard";
import RoleGuard from "../../components/auth/RoleGuard";
import { toast } from "react-toastify";
import {
  PlusIcon,
  CogIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const RolesManagement = () => {
  const { canRead, canCreate, isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState("roles");

  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    error: rolesError,
  } = useGetRolesQuery();

  const {
    data: permissionsResponse,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useGetPermissionsQuery();

  const [initializeRoles, { isLoading: initializing }] =
    useInitializeRolesMutation();

  // Extraer los datos correctamente de la respuesta
  const roles = rolesResponse?.roles || [];
  const permissions = permissionsResponse?.permissions || [];

  // Debug logging
  console.log("Roles Response:", rolesResponse);
  console.log("Roles Array:", roles);
  console.log("Permissions Response:", permissionsResponse);
  console.log("Permissions Array:", permissions);

  const handleInitializeRoles = async () => {
    try {
      await initializeRoles().unwrap();
      toast.success("Roles y permisos inicializados correctamente");
    } catch (error) {
      toast.error("Error al inicializar roles y permisos");
      console.error("Error:", error);
    }
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Roles y Permisos
              </h1>
              <p className="mt-2 text-gray-600">
                Administra roles, permisos y asignaciones de usuarios
              </p>
            </div>

            <PermissionGuard resource="roles" action="create">
              <button
                onClick={handleInitializeRoles}
                disabled={initializing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <CogIcon className="h-4 w-4 mr-2" />
                {initializing ? "Inicializando..." : "Inicializar Roles"}
              </button>
            </PermissionGuard>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("roles")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "roles"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <UserGroupIcon className="h-5 w-5 inline mr-2" />
              Roles
            </button>

            <button
              onClick={() => setActiveTab("permissions")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "permissions"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
              Permisos
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <UserGroupIcon className="h-5 w-5 inline mr-2" />
              Usuarios
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === "roles" && (
            <RolesTab
              roles={roles}
              permissions={permissions}
              isLoading={rolesLoading}
              error={rolesError}
            />
          )}

          {activeTab === "permissions" && (
            <PermissionsTab
              permissions={permissions}
              isLoading={permissionsLoading}
              error={permissionsError}
            />
          )}

          {activeTab === "users" && <UsersTab />}
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de Roles
const RolesTab = ({ roles, permissions, isLoading, error }) => {
  const { canCreate, canUpdate, canDelete } = usePermissions();

  // Asegurar que roles sea un array
  const rolesArray = Array.isArray(roles) ? roles : [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error al cargar los roles: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Roles del Sistema ({rolesArray.length})
        </h2>

        <PermissionGuard resource="roles" action="create">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <PlusIcon className="h-4 w-4 mr-2" />
            Crear Rol
          </button>
        </PermissionGuard>
      </div>

      {rolesArray.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay roles disponibles</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permisos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rolesArray.map((role) => (
                <tr key={role.ccn_role} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {role.role_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {role.role_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {role.ccn_role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* Aquí se mostrarían los permisos del rol */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ver permisos
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* Aquí se mostraría el número de usuarios con este rol */}
                    <span className="text-gray-500">-</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <PermissionGuard resource="roles" action="update">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Editar
                        </button>
                      </PermissionGuard>

                      <PermissionGuard resource="roles" action="delete">
                        <button className="text-red-600 hover:text-red-900">
                          Eliminar
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Componente para la pestaña de Permisos
const PermissionsTab = ({ permissions, isLoading, error }) => {
  // Asegurar que permissions sea un array
  const permissionsArray = Array.isArray(permissions) ? permissions : [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error al cargar los permisos: {error.message}
        </div>
      </div>
    );
  }

  // Agrupar permisos por recurso
  const permissionsByResource = permissionsArray.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Permisos del Sistema ({permissionsArray.length})
      </h2>

      {permissionsArray.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay permisos disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(permissionsByResource).map(
            ([resource, resourcePermissions]) => (
              <div key={resource} className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                  {resource}
                </h3>
                <div className="space-y-2">
                  {resourcePermissions.map((permission) => (
                    <div
                      key={permission.ccn_permission}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 capitalize">
                        {permission.action}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {permission.permission_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

// Componente para la pestaña de Usuarios
const UsersTab = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Gestión de Usuarios
      </h2>
      <p className="text-gray-600">
        Aquí podrás gestionar los roles asignados a cada usuario.
      </p>
      {/* Implementar gestión de usuarios */}
    </div>
  );
};

export default RolesManagement;
