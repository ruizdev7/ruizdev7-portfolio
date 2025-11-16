import { useState } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { Link } from "react-router-dom";
import Overview from "../../components/auth/Overview";
import Security from "../../components/auth/Security";
import EventsLogs from "../../components/auth/EventsLogs";
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { RiPencilLine } from "react-icons/ri";

// Memoized selectors using createSelector
const selectUser = (state) => state.auth?.user;

const selectUserInfo = createSelector([selectUser], (user) => user || {});

const selectAccountId = createSelector([selectUser], (user) => user?.ccn_user);

const selectHasUserData = createSelector(
  [selectUser],
  (user) => user && Object.keys(user).length > 0
);

const selectIsAuthenticated = createSelector(
  [(state) => state.auth?.isAuthenticated],
  (isAuthenticated) => isAuthenticated
);

import google_icon from "../../assets/icons/google-icon.svg";
import github_icon from "../../assets/icons/github.svg";
import slack_icon from "../../assets/icons/slack-icon.svg";

// Helper function to generate color from email (like Google)
const getColorFromEmail = (email) => {
  if (!email) return "#0272AD";

  const colors = [
    "#0272AD", // Primary blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Amber
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#F97316", // Orange
  ];

  const hash = email.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

// Helper function to get initial from email
const getInitial = (email) => {
  if (!email) return "U";
  return email.charAt(0).toUpperCase();
};

const UserView = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  // Use memoized Redux Toolkit selectors
  const userInfo = useSelector(selectUserInfo);
  const account_id = useSelector(selectAccountId);
  const hasUserData = useSelector(selectHasUserData);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const roles = useSelector((state) => state.auth?.roles || []);

  const renderComponent = () => {
    switch (activeTab) {
      case "Security":
        return <Security />;
      case "EventsLogs":
        return <EventsLogs />;
      default:
        return <Overview />;
    }
  };

  const userEmail = userInfo?.email || "";
  const userPhoto =
    userInfo?.avatarUrl || userInfo?.photo || userInfo?.profile_picture || null;
  const initial = getInitial(userEmail);
  const bgColor = getColorFromEmail(userEmail);

  const tabs = [
    { id: "Overview", name: "Overview", icon: ChartBarIcon },
    { id: "Security", name: "Security", icon: ShieldCheckIcon },
    { id: "EventsLogs", name: "Events & Logs", icon: ClockIcon },
  ];

  // Show loading message if not authenticated or no user data
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-do_blue mx-auto mb-4"></div>
              <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
                Loading user information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if authenticated but no complete data
  if (!hasUserData) {
    return (
      <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
                No user data available. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
  const getRoleBadge = () => {
    if (roles.length === 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
          No Role
        </span>
      );
    }

    return (
      <div className="flex flex-wrap justify-center gap-2">
        {roles.map((role, index) => (
          <span
            key={role.ccn_role || `role-${index}-${role.role_name}`}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              role.role_name === "admin"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                : role.role_name === "guest"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            }`}
          >
            {role.role_name === "admin" ? "Administrator" : role.role_name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark px-4 py-8 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-do_text_light dark:text-do_text_dark mb-2">
            Settings
          </h1>
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-sm p-6 border border-do_border_light dark:border-do_border_dark">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                {userPhoto ? (
                  <div className="relative">
                    <img
                      src={userPhoto}
                      alt="User avatar"
                      className="w-24 h-24 rounded-full object-cover border-2 border-white dark:border-gray-700"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const fallback =
                          e.target.parentElement.querySelector(
                            ".avatar-fallback"
                          );
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                    <div
                      className="avatar-fallback w-24 h-24 rounded-full hidden items-center justify-center text-white font-bold text-2xl border-2 border-white dark:border-gray-700 absolute inset-0"
                      style={{ backgroundColor: bgColor }}
                    >
                      {initial}
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-white dark:border-gray-700"
                    style={{ backgroundColor: bgColor }}
                  >
                    {initial}
                  </div>
                )}

                {/* User Name */}
                <h2 className="mt-4 text-xl font-bold text-do_text_light dark:text-do_text_dark text-center">
                  {userInfo.first_name && userInfo.last_name
                    ? `${userInfo.first_name} ${userInfo.last_name}`
                    : userInfo.email?.split("@")[0] || "User"}
                </h2>

                {/* Role Badge */}
                <div className="mt-2">{getRoleBadge()}</div>
              </div>

              {/* User Info */}
              <div className="space-y-4 border-t border-do_border_light dark:border-do_border_dark pt-6">
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide">
                      User ID
                    </p>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark mt-1 break-all">
                      {userInfo.ccn_user || account_id || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark mt-1 break-all">
                      {userInfo.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wide">
                      Member Since
                    </p>
                    <p className="text-sm text-do_text_light dark:text-do_text_dark mt-1">
                      {formatDate(userInfo.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Connected Accounts Card */}
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-sm p-6 border border-do_border_light dark:border-do_border_dark">
              <h2 className="text-xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
                Connected Accounts
              </h2>

              {/* Development Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-sm p-4 mb-6 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <span className="text-base">🚧</span>
                  <span>
                    Third-party integrations (Google, GitHub, Slack) are
                    currently under development.
                  </span>
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-sm p-4 mb-6 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  By connecting an account, you hereby agree to our{" "}
                  <Link
                    to="/auth/terms-and-conditions"
                    className="text-do_blue dark:text-blue-400 hover:underline font-medium"
                  >
                    Terms and Conditions
                  </Link>
                </p>
              </div>

              <div className="space-y-4">
                {/* Google */}
                <div className="flex items-center gap-4 p-4 rounded-sm opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900/30 border border-do_border_light dark:border-do_border_dark">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-sm flex items-center justify-center border border-do_border_light dark:border-do_border_dark opacity-60">
                    <img src={google_icon} alt="Google" className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-do_text_light dark:text-do_text_dark">
                      Google
                    </h3>
                    <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                      Plan properly your workflow
                    </p>
                  </div>
                  <button
                    disabled
                    className="flex-shrink-0 p-2 rounded-sm transition-colors cursor-not-allowed opacity-50"
                    title="Coming soon"
                  >
                    <RiPencilLine className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
                  </button>
                </div>

                {/* GitHub */}
                <div className="flex items-center gap-4 p-4 rounded-sm opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900/30 border border-do_border_light dark:border-do_border_dark">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-sm flex items-center justify-center border border-do_border_light dark:border-do_border_dark opacity-60">
                    <img src={github_icon} alt="GitHub" className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-do_text_light dark:text-do_text_dark">
                      GitHub
                    </h3>
                    <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                      Keep eye on your repositories
                    </p>
                  </div>
                  <button
                    disabled
                    className="flex-shrink-0 p-2 rounded-sm transition-colors cursor-not-allowed opacity-50"
                    title="Coming soon"
                  >
                    <RiPencilLine className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
                  </button>
                </div>

                {/* Slack */}
                <div className="flex items-center gap-4 p-4 rounded-sm opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900/30 border border-do_border_light dark:border-do_border_dark">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-sm flex items-center justify-center border border-do_border_light dark:border-do_border_dark opacity-60">
                    <img src={slack_icon} alt="Slack" className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-do_text_light dark:text-do_text_dark">
                      Slack
                    </h3>
                    <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                      Integrate projects discussions
                    </p>
                  </div>
                  <button
                    disabled
                    className="flex-shrink-0 p-2 rounded-sm transition-colors cursor-not-allowed opacity-50"
                    title="Coming soon"
                  >
                    <RiPencilLine className="w-5 h-5 text-do_text_gray_light dark:text-do_text_gray_dark" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-sm border border-do_border_light dark:border-do_border_dark overflow-hidden">
              <div className="border-b border-do_border_light dark:border-do_border_dark">
                <nav className="flex -mb-px px-6" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors
                          ${
                            activeTab === tab.id
                              ? "border-do_blue text-do_blue dark:text-blue-400"
                              : "border-transparent text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark hover:border-gray-300 dark:hover:border-gray-600"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">{renderComponent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
