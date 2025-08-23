import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RiSunLine, RiMoonLine } from "react-icons/ri";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import PropTypes from "prop-types";
import { logout } from "../RTK_Query_app/state_slices/authSlice";

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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lastLoginTime, setLastLoginTime] = useState(null);

  // Obtener el usuario del estado de autenticación
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

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

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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
    <header className="mx-auto max-w-screen-2xl w-full bg-do_bg_light dark:bg-do_bg_dark h-14 md:h-16 flex items-center justify-center border-b border-do_border_light dark:border-none">
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
        {/* Centro: Social icons y dark mode toggle */}
        <div className="flex flex-1 items-center justify-center gap-3 min-w-0">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-do_text_gray_light dark:text-do_text_dark hover:text-do_blue dark:hover:text-do_blue rounded-md transition-all duration-200 hover:scale-110"
          >
            {isDarkMode ? (
              <RiSunLine className="h-6 w-6 transition-colors hover:text-[#0272AD]" />
            ) : (
              <RiMoonLine className="h-6 w-6 transition-colors hover:text-[#0272AD]" />
            )}
          </button>
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
          <Link
            to="https://docs.ruizdev7.com/blog"
            className="p-2 text-do_text_gray_light dark:text-[#0272AD] hover:text-[#0272AD] dark:hover:text-[#0272AD] rounded-md transition-all duration-200 hover:scale-150 font-black text-xl"
          >
            Blog
          </Link>
        </div>
        {/* Usuario a la derecha */}
        <div className="flex flex-1 items-center justify-end gap-4 min-w-0">
          {/* Información del usuario y último login */}
          <div className="hidden md:flex flex-col items-end text-right">
            <p className="text-do_text_light dark:text-do_text_dark truncate max-w-[120px] md:max-w-[200px] lg:max-w-[300px] font-extrabold">
              {isAuthenticated && user ? user.email : "Guest"}
            </p>
            <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark truncate max-w-[120px] md:max-w-[200px] lg:max-w-[300px]">
              Último login: {formatLastLogin(lastLoginTime)}
            </p>
          </div>
          <UserMenu
            lastLoginTime={lastLoginTime}
            formatLastLogin={formatLastLogin}
          />
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

const UserMenu = ({ lastLoginTime, formatLastLogin }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleLogout = () => {
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

    // Redirigir al login
    window.location.href = "/auth";
  };

  return (
    <Menu>
      <MenuButton className="flex items-center rounded-full focus:outline-none">
        <img
          className="h-9 w-9 rounded-full object-cover"
          src="https://avatars.githubusercontent.com/u/62305538?v=4"
          alt="User avatar"
        />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 mt-2 p-1 focus:outline-none"
      >
        {/* Información del último login en el menú */}
        <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-600">
          <div className="flex flex-col">
            <span>
              Usuario: {isAuthenticated && user ? user.email : "Guest"}
            </span>
            <span>Último login: {formatLastLogin(lastLoginTime)}</span>
          </div>
        </div>

        {isAuthenticated && user && (
          <>
            <MenuItem>
              {({ active }) => (
                <Link
                  to="/user-management/users/view"
                  className={`${
                    active
                      ? "hover:text-light_mode_text_hover hover:bg-[#17181C]"
                      : ""
                  } flex items-center gap-4 py-2 px-4 rounded-lg transition-colors text-white w-full`}
                >
                  Profile
                </Link>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  className={`${
                    active
                      ? "hover:text-light_mode_text_hover hover:bg-[#17181C]"
                      : ""
                  } flex items-center gap-4 py-2 px-4 rounded-lg transition-colors text-white w-full`}
                >
                  Settings
                </button>
              )}
            </MenuItem>
            <div className="" />
          </>
        )}
        <MenuItem>
          {({ active }) => (
            <button
              onClick={handleLogout}
              className={`${
                active
                  ? "hover:text-light_mode_text_hover hover:bg-[#17181C]"
                  : ""
              } flex items-center gap-4 py-2 px-4 rounded-lg transition-colors text-white w-full`}
            >
              {isAuthenticated ? "Log Out" : "Login"}
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
};

UserMenu.propTypes = {
  lastLoginTime: PropTypes.instanceOf(Date),
  formatLastLogin: PropTypes.func.isRequired,
};

export default Header;
