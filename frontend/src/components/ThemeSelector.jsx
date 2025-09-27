import { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

const ThemeSelector = ({ className = "", showLabel = true }) => {
  const { theme, currentTheme, changeTheme, getThemeName, THEME_TYPES } =
    useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar dropdown al presionar Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Obtener icono y color según el tema actual
  const getThemeIcon = (themeType) => {
    switch (themeType) {
      case THEME_TYPES.LIGHT:
        return <SunIcon className="w-4 h-4 text-yellow-500" />;
      case THEME_TYPES.DARK:
        return <MoonIcon className="w-4 h-4 text-blue-400" />;
      case THEME_TYPES.SYSTEM:
        return <ComputerDesktopIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <SunIcon className="w-4 h-4" />;
    }
  };

  // Obtener icono del tema efectivo actual
  const getCurrentThemeIcon = () => {
    return getThemeIcon(currentTheme);
  };

  // Opciones de tema
  const themeOptions = [
    {
      value: THEME_TYPES.SYSTEM,
      label: "System",
      description: "Follow system configuration",
      icon: getThemeIcon(THEME_TYPES.SYSTEM),
    },
    {
      value: THEME_TYPES.LIGHT,
      label: "Light",
      description: "Light theme",
      icon: getThemeIcon(THEME_TYPES.LIGHT),
    },
    {
      value: THEME_TYPES.DARK,
      label: "Dark",
      description: "Dark theme",
      icon: getThemeIcon(THEME_TYPES.DARK),
    },
  ];

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Seleccionar tema"
      >
        {getCurrentThemeIcon()}
        {showLabel && (
          <span className="hidden md:inline">{getThemeName()}</span>
        )}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform hidden md:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-12 md:w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  theme === option.value
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {option.icon}
                <div className="flex-1 hidden md:block">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
                {theme === option.value && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full hidden md:block"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ThemeSelector.propTypes = {
  className: PropTypes.string,
  showLabel: PropTypes.bool,
};

export default ThemeSelector;
