import React from 'react'
import { useSelector } from 'react-redux'
import { selectUser, selectRoles, selectPermissions } from '../../RTK_Query_app/state_slices/authSlice'
import { useGetMyPermissionsQuery } from '../../RTK_Query_app/services/roles/rolesApi'
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline'

const UserProfile = () => {
  const user = useSelector(selectUser)
  const roles = useSelector(selectRoles)
  const permissions = useSelector(selectPermissions)
  const { data: myPermissions, isLoading } = useGetMyPermissionsQuery()

  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">
          No hay información de usuario disponible
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header del perfil */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <UserCircleIcon className="h-12 w-12 text-gray-400" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Información del usuario */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <p className="mt-1 text-sm text-gray-900">{user.first_name} {user.middle_name} {user.last_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID de Usuario</label>
              <p className="mt-1 text-sm text-gray-900">{user.ccn_user}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID de Cuenta</label>
              <p className="mt-1 text-sm text-gray-900">{user.account_id}</p>
            </div>
          </div>
        </div>

        {/* Roles del usuario */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Roles Asignados
          </h3>
          {roles.length > 0 ? (
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
          ) : (
            <p className="text-sm text-gray-500">No hay roles asignados</p>
          )}
        </div>

        {/* Permisos del usuario */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <KeyIcon className="h-5 w-5 mr-2" />
            Permisos ({permissions.length})
          </h3>
          {permissions.length > 0 ? (
            <div className="space-y-3">
              {/* Agrupar permisos por recurso */}
              {Object.entries(
                permissions.reduce((acc, permission) => {
                  if (!acc[permission.resource]) {
                    acc[permission.resource] = []
                  }
                  acc[permission.resource].push(permission)
                  return acc
                }, {})
              ).map(([resource, resourcePermissions]) => (
                <div key={resource} className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 capitalize">
                    {resource}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {resourcePermissions.map((permission) => (
                      <span
                        key={permission.ccn_permission}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                      >
                        {permission.action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay permisos asignados</p>
          )}
        </div>

        {/* Resumen de capacidades */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Resumen de Capacidades</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{permissions.length}</div>
              <div className="text-xs text-blue-600">Permisos</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{roles.length}</div>
              <div className="text-xs text-green-600">Roles</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(permissions.map(p => p.resource)).size}
              </div>
              <div className="text-xs text-purple-600">Recursos</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {new Set(permissions.map(p => p.action)).size}
              </div>
              <div className="text-xs text-yellow-600">Acciones</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
