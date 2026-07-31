/**
 * AI Governance Dashboard Router
 * Routes to appropriate dashboard based on user type
 */

import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  selectRoles,
  selectPermissions,
} from "../../RTK_Query_app/state_slices/authSlice";
import { checkPermission, checkRole } from "../../RTK_Query_app/state_slices/authSlice";
import CompanyDashboard from "./CompanyDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

const AIGovernanceDashboard = () => {
  const location = useLocation();
  const roles = useSelector(selectRoles) || [];
  const permissions = useSelector(selectPermissions) || [];

  const queryParams = new URLSearchParams(location.search);
  const accessType =
    queryParams.get("type") ||
    localStorage.getItem("ai_governance_access_type") ||
    "";

  let isCompany = false;

  if (accessType === "company") {
    isCompany = true;
  } else if (accessType === "employee") {
    isCompany = false;
  } else {
    const hasCompanyPermissions =
      checkPermission(permissions, "ai_agents", "create") ||
      checkPermission(permissions, "policies", "create") ||
      checkPermission(permissions, "policies", "update") ||
      checkRole(roles, "Administrator") ||
      checkRole(roles, "admin") ||
      checkRole(roles, "Company Admin") ||
      checkRole(roles, "dir_general") ||
      checkRole(roles, "dir_it");
    isCompany = hasCompanyPermissions;
  }

  return isCompany ? <CompanyDashboard /> : <EmployeeDashboard />;
};

export default AIGovernanceDashboard;
