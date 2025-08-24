import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeDebugger = () => {
  const { theme, systemTheme, currentTheme, getThemeName } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-50 text-xs text-gray-700 dark:text-gray-200 transition-all duration-300 ease-out cursor-pointer ${
        isExpanded ? "rounded-lg p-4 w-64" : "rounded-full px-3 py-2"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {!isExpanded ? (
        // Estado compacto
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="font-semibold">Theme</span>
        </div>
      ) : (
        // Estado expandido
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="font-semibold">🎨 Theme Debug</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Selected:
              </span>
              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {theme}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">System:</span>
              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {systemTheme}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Current:</span>
              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {currentTheme}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {getThemeName()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeDebugger;
