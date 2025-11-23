import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import PropTypes from "prop-types";
import { logout } from "../RTK_Query_app/state_slices/authSlice";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import { usePermissions } from "../hooks/usePermissions";
import {
  HomeIcon,
  DocumentTextIcon,
  CogIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// Componentes de iconos SVG reales
const LinkedInIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
LinkedInIcon.propTypes = {
  className: PropTypes.string.isRequired,
};

const GitHubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);
GitHubIcon.propTypes = {
  className: PropTypes.string.isRequired,
};

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);
TwitterIcon.propTypes = {
  className: PropTypes.string.isRequired,
};

const Header = () => {
  const [lastLoginTime, setLastLoginTime] = useState(null);

  // Obtener el usuario del estado de autenticación
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Cargar información del último login desde localStorage al montar
  useEffect(() => {
    const storedLastLogin = localStorage.getItem("lastLoginTime");
    if (storedLastLogin) {
      setLastLoginTime(new Date(storedLastLogin));
    }
  }, []);

  // Escuchar cambios en localStorage para sincronización entre pestañas
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "lastLoginTime") {
        if (event.newValue) {
          setLastLoginTime(new Date(event.newValue));
        } else {
          setLastLoginTime(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Sincronizar lastLoginTime con el estado de autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      // Si no está autenticado, limpiar lastLoginTime
      setLastLoginTime(null);
    } else {
      // Si está autenticado, cargar el lastLoginTime desde localStorage
      const storedLastLogin = localStorage.getItem("lastLoginTime");
      if (storedLastLogin) {
        setLastLoginTime(new Date(storedLastLogin));
      }
    }
  }, [isAuthenticated]);

  // Función para formatear la fecha del último login
  const formatLastLogin = (date) => {
    if (!date) return "Nunca";

    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Justo ahora";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="relative z-50 mx-auto max-w-screen-2xl w-full bg-do_bg_light dark:bg-do_bg_dark h-14 md:h-16 flex items-center justify-center border-b border-do_border_light dark:border-none">
      <div className="mx-auto max-w-screen-2xl w-full flex items-center justify-evenly px-2 md:px-4 lg:px-10">
        {/* Logo a la izquierda */}
        <div className="flex flex-1 items-center justify-start min-w-0">
          <div className="group flex items-center hover:scale-110 transition-transform">
            <Link
              to={"/"}
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#0272AD] to-[#0272AD] bg-clip-text text-transparent"
            >
              ruizdev7
            </Link>
          </div>
        </div>
        {/* Centro: Social icons, theme selector y language selector */}
        <div className="flex flex-1 items-center justify-center gap-3 min-w-0">
          <LanguageSelector />
          <ThemeSelector showLabel={false} />
          {/* Iconos sociales - ocultos en mobile */}
          <div className="hidden md:flex items-center gap-3">
            <SocialIconLink
              url="https://www.linkedin.com/in/ruizdev7/"
              icon={
                <LinkedInIcon className="h-6 w-6 transition-colors hover:text-[#0272AD]" />
              }
            />
            <SocialIconLink
              url="https://github.com/ruizdev7"
              icon={
                <GitHubIcon className="h-6 w-6 transition-colors hover:text-[#0272AD]" />
              }
            />
          </div>
          <Link
            to="https://docs.ruizdev7.com/blog"
            className="p-2 text-do_text_gray_light dark:text-[#0272AD] hover:text-[#0272AD] dark:hover:text-[#0272AD] rounded-md transition-all duration-200 hover:scale-150 font-black text-xl"
          >
            Blog
          </Link>
        </div>
        {/* Usuario a la derecha */}
        <div className="flex flex-1 items-center justify-end gap-4 min-w-0 relative z-50">
          {/* Información del usuario y último login */}
          <div className="hidden md:flex flex-col items-end text-right">
            <p className="text-do_text_light dark:text-do_text_dark truncate max-w-[120px] md:max-w-[200px] lg:max-w-[300px] font-extrabold">
              {isAuthenticated && user ? user.email : "Guest"}
            </p>
            <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark truncate max-w-[120px] md:max-w-[200px] lg:max-w-[300px]">
              Último login: {formatLastLogin(lastLoginTime)}
            </p>
          </div>
          <div className="relative z-50">
            <UserMenu
              lastLoginTime={lastLoginTime}
              formatLastLogin={formatLastLogin}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

const SocialIconLink = ({ url, icon }) => (
  <Link
    to={url}
    target="_blank"
    className="p-2 text-do_text_gray_light dark:text-do_text_dark"
  >
    {icon}
  </Link>
);

SocialIconLink.propTypes = {
  url: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
};

// Helper function to generate color from email (like Google)
const getColorFromEmail = (email) => {
  if (!email) return "#0272AD"; // Default color

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
  if (!email) return "G";
  return email.charAt(0).toUpperCase();
};

// Avatar component
const UserAvatar = ({ user, className = "h-9 w-9" }) => {
  const userEmail = user?.email || "";
  // Check for photo in multiple possible locations
  const userPhoto =
    user?.avatarUrl || user?.photo || user?.profile_picture || null;

  // Show initial with colored background (like Google)
  const initial = getInitial(userEmail);
  const bgColor = getColorFromEmail(userEmail);

  // If user has photo, show it with a fallback to initial
  if (userPhoto) {
    return (
      <div className="relative">
        <img
          className={`${className} rounded-full object-cover border-2 border-white dark:border-gray-700`}
          src={userPhoto}
          alt="User avatar"
          onError={(e) => {
            // If image fails to load, hide it and show initial instead
            e.target.style.display = "none";
            // Show fallback initial
            const fallback =
              e.target.parentElement.querySelector(".avatar-fallback");
            if (fallback) fallback.classList.remove("hidden");
          }}
        />
        {/* Fallback initial (hidden by default, shown if image fails) */}
        <div
          className={`avatar-fallback ${className} rounded-full hidden items-center justify-center text-white font-semibold text-sm border-2 border-white dark:border-gray-700 absolute inset-0`}
          style={{ backgroundColor: bgColor }}
        >
          {initial}
        </div>
      </div>
    );
  }

  // Show initial with colored background (default)
  return (
    <div
      className={`${className} rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-white dark:border-gray-700 shadow-sm`}
      style={{ backgroundColor: bgColor }}
    >
      {initial}
    </div>
  );
};

UserAvatar.propTypes = {
  user: PropTypes.object,
  className: PropTypes.string,
};

const UserMenu = ({ lastLoginTime, formatLastLogin }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { canRead, isAdmin } = usePermissions();

  const handleLogout = () => {
    // Si es guest, solo limpiar tokens para que se re-autentique automáticamente
    // Si es usuario real, redirigir a /auth
    const isGuest = user && user.email === "guest@example.com";

    dispatch(logout());
    // Limpiar localStorage (el authSlice ya limpia tokens y user_data)
    localStorage.removeItem("lastLoginTime");

    // Disparar evento de storage para sincronizar otras pestañas
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "lastLoginTime",
        newValue: null,
      })
    );

    // Solo redirigir a /auth si NO es guest
    if (!isGuest) {
      navigate("/auth");
    }
    // Si es guest, AuthInitializer se encargará de re-autenticar automáticamente
  };

  return (
    <div className="relative z-50">
      <Menu>
        <MenuButton className="flex items-center rounded-full focus:outline-none ring-2 ring-transparent hover:ring-do_blue transition-all">
          <UserAvatar user={user} />
        </MenuButton>

        <MenuItems
          anchor="bottom end"
          className="w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-xl border dark:border-gray-700 mt-2 p-1 focus:outline-none z-50"
        >
          {/* User information in menu */}
          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            <div className="flex flex-col">
              <span>
                User: {isAuthenticated && user ? user.email : "Guest"}
              </span>
              <span>Last login: {formatLastLogin(lastLoginTime)}</span>
            </div>
          </div>

          {isAuthenticated && user && (
            <>
              <MenuItem>
                {({ active }) => (
                  <Link
                    to="/"
                    className={`${
                      active
                        ? "bg-gray-100 dark:bg-[#17181C] text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-200"
                    } flex items-center gap-3 py-2 px-4 rounded-lg transition-colors w-full`}
                  >
                    <HomeIcon className="w-4 h-4" />
                    Home
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <Link
                    to="/home-blog"
                    className={`${
                      active
                        ? "bg-gray-100 dark:bg-[#17181C] text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-200"
                    } flex items-center gap-3 py-2 px-4 rounded-lg transition-colors w-full`}
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Blog
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <Link
                    to="/projects"
                    className={`${
                      active
                        ? "bg-gray-100 dark:bg-[#17181C] text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-200"
                    } flex items-center gap-3 py-2 px-4 rounded-lg transition-colors w-full`}
                  >
                    <CogIcon className="w-4 h-4" />
                    Projects
                  </Link>
                )}
              </MenuItem>

              {/* Visual separator for administration options */}
              {(canRead("roles") || isAdmin()) && (
                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              )}

              {/* Contact Messages - Only for administrators */}
              {isAdmin() && (
                <MenuItem>
                  {({ active }) => (
                    <Link
                      to="/admin/contact-messages"
                      className={`${
                        active
                          ? "bg-gray-100 dark:bg-[#17181C] text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-200"
                      } flex items-center gap-3 py-2 px-4 rounded-lg transition-colors w-full`}
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      Contact Messages
                    </Link>
                  )}
                </MenuItem>
              )}

              {/* Roles Management - Only for users with permissions */}
              {canRead("roles") && (
                <MenuItem>
                  {({ active }) => (
                    <Link
                      to="/admin/roles"
                      className={`${
                        active
                          ? "bg-gray-100 dark:bg-[#17181C] text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-200"
                      } flex items-center gap-3 py-2 px-4 rounded-lg transition-colors w-full`}
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                      Roles Management
                    </Link>
                  )}
                </MenuItem>
              )}

              {/* User Management - Only for users with permissions */}
              {canRead("users") && (
                <MenuItem>
                  {({ active }) => (
                    <Link
                      to="/admin/users"
                      className={`${
                        active
                          ? "bg-gray-100 dark:bg-[#17181C] text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-200"
                      } flex items-center gap-3 py-2 px-4 rounded-lg transition-colors w-full`}
                    >
                      <UserGroupIcon className="w-4 h-4" />
                      User Management
                    </Link>
                  )}
                </MenuItem>
              )}

              {/* Visual separator for user options */}
              <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

              {/* Settings - For all authenticated users */}
              <MenuItem>
                {({ active }) => (
                  <Link
                    to="/user-management/users/view"
                    className={`${
                      active
                        ? "bg-gray-100 dark:bg-[#17181C] text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-200"
                    } flex items-center gap-3 py-2 px-4 rounded-lg transition-colors w-full`}
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Settings
                  </Link>
                )}
              </MenuItem>
            </>
          )}
          <MenuItem>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={`${
                  active
                    ? "bg-gray-100 dark:bg-[#17181C] text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-200"
                } flex items-center gap-3 py-2 px-4 rounded-lg transition-colors w-full`}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                {isAuthenticated ? "Log Out" : "Login"}
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
};

UserMenu.propTypes = {
  lastLoginTime: PropTypes.instanceOf(Date),
  formatLastLogin: PropTypes.func.isRequired,
};

export default Header;
