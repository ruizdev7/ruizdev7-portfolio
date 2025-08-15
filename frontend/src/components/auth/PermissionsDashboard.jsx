import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  selectPermissions,
  selectRoles,
} from "../../RTK_Query_app/state_slices/authSlice";
import { usePermissions } from "../../hooks/usePermissions";
import {
  ShieldCheckIcon,
  KeyIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const PermissionsDashboard = () => {
  const {
    permissions,
    roles,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin,
    isModerator,
    isUser,
    isGuest,
  } = usePermissions();

  const [showDetails, setShowDetails] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Agrupar permisos por recurso
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {});

  const resources = [
    "posts",
    "users",
    "pumps",
    "categories",
    "comments",
    "roles",
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Dashboard de Permisos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Resumen de tus capacidades en el sistema
            </p>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showDetails ? (
              <>
                <EyeSlashIcon className="h-4 w-4 mr-2" />
                Ocultar Detalles
              </>
            ) : (
              <>
                <EyeIcon className="h-4 w-4 mr-2" />
                Ver Detalles
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Resumen de roles */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Roles Activos
          </h3>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <span
                key={role.ccn_role}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                {role.role_name}
              </span>
            ))}
          </div>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {permissions.length}
            </div>
            <div className="text-sm text-blue-600">Permisos Totales</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {roles.length}
            </div>
            <div className="text-sm text-green-600">Roles Asignados</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(permissionsByResource).length}
            </div>
            <div className="text-sm text-purple-600">Recursos Accesibles</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {new Set(permissions.map((p) => p.action)).size}
            </div>
            <div className="text-sm text-yellow-600">Tipos de Acción</div>
          </div>
        </div>

        {/* Matriz de permisos por recurso */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <KeyIcon className="h-5 w-5 mr-2" />
            Permisos por Recurso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => {
              const resourcePermissions = permissionsByResource[resource] || [];
              const hasCreate = canCreate(resource);
              const hasRead = canRead(resource);
              const hasUpdate = canUpdate(resource);
              const hasDelete = canDelete(resource);

              return (
                <div
                  key={resource}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedResource === resource
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    setSelectedResource(
                      selectedResource === resource ? null : resource
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                      {resource}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {resourcePermissions.length} permisos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      {hasCreate ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className="text-xs text-gray-600">Crear</span>
                    </div>
                    <div className="flex items-center">
                      {hasRead ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className="text-xs text-gray-600">Leer</span>
                    </div>
                    <div className="flex items-center">
                      {hasUpdate ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className="text-xs text-gray-600">Actualizar</span>
                    </div>
                    <div className="flex items-center">
                      {hasDelete ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className="text-xs text-gray-600">Eliminar</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalles expandibles */}
        {showDetails && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">
              Detalles de Permisos
            </h3>

            {selectedResource && permissionsByResource[selectedResource] && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                  Permisos para: {selectedResource}
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {permissionsByResource[selectedResource].map(
                      (permission) => (
                        <div
                          key={permission.ccn_permission}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {permission.action}
                            </span>
                            <p className="text-xs text-gray-500">
                              {permission.description}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            {permission.permission_name}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lista completa de permisos */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Todos los Permisos
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission.ccn_permission}
                      className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {permission.resource}.{permission.action}
                        </span>
                        <p className="text-xs text-gray-500">
                          {permission.description}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {permission.permission_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsDashboard;
