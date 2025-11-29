/**
 * AI Governance Dashboard Router
 * Routes to appropriate dashboard based on user type
 */

import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { selectRoles, selectPermissions } from "../../RTK_Query_app/state_slices/authSlice";
import { checkPermission, checkRole } from "../../RTK_Query_app/state_slices/authSlice";
import CompanyDashboard from "./CompanyDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

const AIGovernanceDashboard = () => {
  const location = useLocation();
  const roles = useSelector(selectRoles) || [];
  const permissions = useSelector(selectPermissions) || [];

  // Check URL parameter for access type (from landing page)
  const queryParams = new URLSearchParams(location.search);
  const accessType = queryParams.get("type"); // 'company' or 'employee'

  // Determine user type based on URL parameter first, then fallback to permissions
  // If URL has type parameter, use it (user selected access type from landing page)
  // Otherwise, check permissions
  let isCompany = false;

  if (accessType === "company") {
    isCompany = true;
  } else if (accessType === "employee") {
    isCompany = false;
  } else {
    // No URL parameter - determine based on permissions
    const hasCompanyPermissions = 
      checkPermission(permissions, "ai_agents", "create") ||
      checkPermission(permissions, "policies", "create") ||
      checkPermission(permissions, "policies", "update") ||
      checkPermission(permissions, "approval_settings", "update") ||
      checkRole(roles, "Administrator") ||
      checkRole(roles, "Company Admin");
    isCompany = hasCompanyPermissions;
  }

  // Debug logging
  console.log("Dashboard Router - Access Type from URL:", accessType);
  console.log("Dashboard Router - Roles:", roles);
  console.log("Dashboard Router - Permissions:", permissions);
  console.log("Dashboard Router - isCompany:", isCompany);

  // Route to appropriate dashboard
  if (isCompany) {
    console.log("Routing to CompanyDashboard");
    return <CompanyDashboard />;
  } else {
    console.log("Routing to EmployeeDashboard (read-only access)");
    return <EmployeeDashboard />;
  }
};

export default AIGovernanceDashboard;
