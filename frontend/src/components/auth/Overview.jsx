import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { usePermissions } from "../../hooks/usePermissions";

const Overview = () => {
  const userInfo = useSelector((state) => state.auth?.user || {});
  const roles = useSelector((state) => state.auth?.roles || []);
  const permissions = useSelector((state) => state.auth?.permissions || []);
  const { isAdmin } = usePermissions();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Get role badges for multiple roles
  const getRoleBadges = () => {
    if (roles.length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
          No Role
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {roles.map((role, index) => (
          <span
            key={role.ccn_role || role.id || role.role_name || `role-${index}`}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              role.role_name === "admin"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                : role.role_name === "guest"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            }`}
          >
            {role.role_name}
          </span>
        ))}
      </div>
    );
  };

  // Quick stats removed - all information shown in Roles & Permissions section

  // Quick links (only external links, not tabs)
  const quickLinks = [
    ...(isAdmin()
      ? [
          {
            name: "Roles Management",
            description: "Manage roles and permissions",
            icon: ShieldCheckIcon,
            href: "/admin/roles",
            color: "text-do_text_light dark:text-do_text_dark",
            bgColor: "bg-gray-50 dark:bg-gray-900/20",
          },
          {
            name: "Users Management",
            description: "Manage users and accounts",
            icon: UserIcon,
            href: "/user-management/users/view",
            color: "text-do_text_light dark:text-do_text_dark",
            bgColor: "bg-gray-50 dark:bg-gray-900/20",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-2">
          Account Overview
        </h2>
        <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
          Welcome back! Here&apos;s a summary of your account information and
          activity.
        </p>
      </div>

      {/* Account Information */}
      <div className="bg-do_card_light dark:bg-do_card_dark rounded-sm p-6 border border-do_border_light dark:border-do_border_dark">
        <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4">
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-sm">
              <EnvelopeIcon className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                Email Address
              </p>
              <p className="text-sm text-do_text_light dark:text-do_text_dark break-all">
                {userInfo.email || "Not set"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-sm">
              <IdentificationIcon className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                User ID
              </p>
              <p className="text-sm text-do_text_light dark:text-do_text_dark">
                {userInfo.ccn_user || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-sm">
              <CalendarIcon className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                Member Since
              </p>
              <p className="text-sm text-do_text_light dark:text-do_text_dark">
                {formatDate(userInfo.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-sm">
              <ShieldCheckIcon className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                Account {roles.length > 1 ? "Roles" : "Role"}
              </p>
              {getRoleBadges()}
            </div>
          </div>
        </div>
      </div>

      {/* Roles & Permissions Section */}
      {roles.length > 0 && (
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-sm p-6 border border-do_border_light dark:border-do_border_dark">
          <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-do_blue dark:text-blue-400" />
            Roles & Permissions
          </h3>

          {/* Roles */}
          <div className="mb-4">
            <p className="text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-2">
              Assigned Roles ({roles.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role, index) => (
                <span
                  key={role.ccn_role || role.id || `role-${index}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-sm text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
                >
                  {role.role_name || role.name}
                </span>
              ))}
            </div>
          </div>

          {/* Permissions Summary */}
          {permissions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark mb-2">
                Permissions Summary
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-sm border border-do_border_light dark:border-do_border_dark bg-gray-50 dark:bg-gray-900/20">
                  <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                    Total Permissions
                  </p>
                  <p className="text-xl font-bold text-do_text_light dark:text-do_text_dark">
                    {permissions.length}
                  </p>
                </div>
                <div className="p-3 rounded-sm border border-do_border_light dark:border-do_border_dark bg-gray-50 dark:bg-gray-900/20">
                  <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                    Resources
                  </p>
                  <p className="text-xl font-bold text-do_text_light dark:text-do_text_dark">
                    {new Set(permissions.map((p) => p.resource)).size}
                  </p>
                </div>
                <div className="p-3 rounded-sm border border-do_border_light dark:border-do_border_dark bg-gray-50 dark:bg-gray-900/20">
                  <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide mb-1">
                    Actions
                  </p>
                  <p className="text-xl font-bold text-do_text_light dark:text-do_text_dark">
                    {new Set(permissions.map((p) => p.action)).size}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      {quickLinks.length > 0 && (
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-sm p-6 border border-do_border_light dark:border-do_border_dark">
          <h3 className="text-lg font-semibold text-do_text_light dark:text-do_text_dark mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  to={link.href}
                  className={`${link.bgColor} rounded-sm p-4 border border-do_border_light dark:border-do_border_dark transition-all group`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 ${link.bgColor} rounded-sm`}>
                      <Icon className={`w-5 h-5 ${link.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-do_text_light dark:text-do_text_dark mb-1 group-hover:text-do_blue dark:group-hover:text-blue-400 transition-colors">
                        {link.name}
                      </h4>
                      <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
                        {link.description}
                      </p>
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark group-hover:text-do_blue dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
