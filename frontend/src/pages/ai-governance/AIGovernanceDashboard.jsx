/**
 * AI Governance Dashboard Router
 * Routes to appropriate dashboard based on user type
 */

import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  selectRoles,
  selectPermissions,
} from "../../RTK_Query_app/state_slices/authSlice";
import { checkPermission, checkRole } from "../../RTK_Query_app/state_slices/authSlice";
import { useLanguage } from "../../contexts/LanguageContext";
import CompanyDashboard from "./CompanyDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

const AIGovernanceDashboard = () => {
  const location = useLocation();
  const roles = useSelector(selectRoles) || [];
  const permissions = useSelector(selectPermissions) || [];
  const { t } = useLanguage();

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

  return (
    <div className="min-h-full bg-do_bg_light dark:bg-do_bg_dark">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <Link
          to="/ai-governance"
          className="inline-flex items-center gap-2 rounded-lg border border-do_border_light px-3 py-2 text-sm font-medium text-do_text_light transition-colors hover:bg-do_card_light dark:border-gray-700 dark:text-do_text_dark dark:hover:bg-do_card_dark"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("ai.backToLanding")}
        </Link>
      </div>
      {isCompany ? <CompanyDashboard /> : <EmployeeDashboard />}
    </div>
  );
};

export default AIGovernanceDashboard;
