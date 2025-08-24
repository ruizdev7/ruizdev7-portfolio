import { useTheme, THEME_TYPES } from "../contexts/ThemeContext";

const ThemeInfo = () => {
  const {
    theme,
    systemTheme,
    currentTheme,
    getThemeName,
    getNextThemeName,
    THEME_TYPES,
  } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🎨 Información del Tema
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">
            Tema Seleccionado:
          </span>
          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {theme}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">
            Tema del Sistema:
          </span>
          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {systemTheme}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Tema Actual:</span>
          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {currentTheme}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">
            Nombre del Tema:
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {getThemeName()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">
            Siguiente Tema:
          </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {getNextThemeName()}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Tipos de Tema Disponibles:
        </h4>
        <div className="space-y-1">
          {Object.entries(THEME_TYPES).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-600 dark:text-gray-400">{key}:</span>
              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeInfo;
