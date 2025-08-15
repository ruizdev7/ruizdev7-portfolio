import React from "react";
import { useSelector } from "react-redux";
import {
  selectRoles,
  checkRole,
  checkAnyRole,
  checkAllRoles,
} from "../../RTK_Query_app/state_slices/authSlice";

const RoleGuard = ({
  role,
  roles = [],
  requireAll = false,
  fallback = null,
  children,
}) => {
  const userRoles = useSelector(selectRoles);

  const hasAccess = () => {
    if (role) {
      return checkRole(userRoles, role);
    }

    if (roles.length > 0) {
      return requireAll
        ? checkAllRoles(userRoles, roles)
        : checkAnyRole(userRoles, roles);
    }

    return false;
  };

  return hasAccess() ? children : fallback;
};

export default RoleGuard;
