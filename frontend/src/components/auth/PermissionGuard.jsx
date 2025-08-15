import { useSelector } from "react-redux";
import {
  selectPermissions,
  checkPermission,
} from "../../RTK_Query_app/state_slices/authSlice";

const PermissionGuard = ({
  children,
  resource,
  action,
  fallback = null,
  requireAll = false,
  permissions = [],
}) => {
  const userPermissions = useSelector(selectPermissions);

  const hasAccess = () => {
    // Si se especifica un permiso específico
    if (resource && action) {
      return checkPermission(userPermissions, resource, action);
    }

    // Si se especifica una lista de permisos
    if (permissions.length > 0) {
      return requireAll
        ? permissions.every(({ resource: res, action: act }) =>
            checkPermission(userPermissions, res, act)
          )
        : permissions.some(({ resource: res, action: act }) =>
            checkPermission(userPermissions, res, act)
          );
    }

    // Si no se especifica nada, mostrar el contenido
    return true;
  };

  return hasAccess() ? children : fallback;
};

export default PermissionGuard;
