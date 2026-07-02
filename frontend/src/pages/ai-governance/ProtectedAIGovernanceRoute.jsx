import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectPermissions,
  checkPermission,
} from "../../RTK_Query_app/state_slices/authSlice";

const ProtectedAIGovernanceRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const permissions = useSelector(selectPermissions) || [];

  if (!isAuthenticated) {
    return <Navigate to="/auth/login?type=company" replace />;
  }

  const hasAiAccess =
    checkPermission(permissions, "ai_agents", "read") ||
    checkPermission(permissions, "ai_tasks", "read") ||
    checkPermission(permissions, "approvals", "read");

  if (!hasAiAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-8">
          <h2 className="text-xl font-medium text-do_text_light dark:text-do_text_dark mb-3">
            Acceso no autorizado
          </h2>
          <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            Tu cuenta no tiene permisos para AI Governance.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedAIGovernanceRoute;
