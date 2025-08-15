import { useSelector } from "react-redux";
import {
  selectPermissions,
  selectRoles,
  checkPermission,
  checkRole,
  checkAnyRole,
  checkAllRoles,
} from "../RTK_Query_app/state_slices/authSlice";

export const usePermissions = () => {
  const permissions = useSelector(selectPermissions);
  const roles = useSelector(selectRoles);

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (resource, action) => {
    return checkPermission(permissions, resource, action);
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (roleName) => {
    return checkRole(roles, roleName);
  };

  // Verificar si el usuario tiene cualquiera de los roles especificados
  const hasAnyRole = (roleNames) => {
    return checkAnyRole(roles, roleNames);
  };

  // Verificar si el usuario tiene todos los roles especificados
  const hasAllRoles = (roleNames) => {
    return checkAllRoles(roles, roleNames);
  };

  // Verificar si el usuario tiene cualquiera de los permisos especificados
  const hasAnyPermission = (permissionList) => {
    return permissionList.some(({ resource, action }) =>
      checkPermission(permissions, resource, action)
    );
  };

  // Verificar si el usuario tiene todos los permisos especificados
  const hasAllPermissions = (permissionList) => {
    return permissionList.every(({ resource, action }) =>
      checkPermission(permissions, resource, action)
    );
  };

  // Obtener permisos por recurso
  const getPermissionsByResource = (resource) => {
    return permissions.filter((permission) => permission.resource === resource);
  };

  // Obtener acciones disponibles para un recurso
  const getActionsForResource = (resource) => {
    return permissions
      .filter((permission) => permission.resource === resource)
      .map((permission) => permission.action);
  };

  // Verificar si el usuario puede crear en un recurso
  const canCreate = (resource) => {
    return hasPermission(resource, "create");
  };

  // Verificar si el usuario puede leer en un recurso
  const canRead = (resource) => {
    return hasPermission(resource, "read");
  };

  // Verificar si el usuario puede actualizar en un recurso
  const canUpdate = (resource) => {
    return hasPermission(resource, "update");
  };

  // Verificar si el usuario puede eliminar en un recurso
  const canDelete = (resource) => {
    return hasPermission(resource, "delete");
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return hasRole("admin");
  };

  // Verificar si el usuario es moderador
  const isModerator = () => {
    return hasRole("moderator");
  };

  // Verificar si el usuario es usuario básico
  const isUser = () => {
    return hasRole("user");
  };

  // Verificar si el usuario es invitado
  const isGuest = () => {
    return hasRole("guest");
  };

  return {
    permissions,
    roles,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionsByResource,
    getActionsForResource,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin,
    isModerator,
    isUser,
    isGuest,
  };
};
