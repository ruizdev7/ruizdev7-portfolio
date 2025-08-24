import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

// Crear el contexto
const ThemeContext = createContext();

// Hook personalizado para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Tipos de tema disponibles
export const THEME_TYPES = {
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
};

// Función para obtener el tema del sistema
const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Función para aplicar el tema al DOM
const applyTheme = (theme) => {
  const root = document.documentElement;

  // Remover clases existentes
  root.classList.remove("light", "dark");

  // Determinar qué tema aplicar
  let themeToApply = theme;
  if (theme === THEME_TYPES.SYSTEM) {
    themeToApply = getSystemTheme();
  }

  // Aplicar la clase correspondiente
  root.classList.add(themeToApply);

  // Actualizar el atributo data-theme para compatibilidad
  root.setAttribute("data-theme", themeToApply);
};

// Provider del contexto
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEME_TYPES.SYSTEM);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme());

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && Object.values(THEME_TYPES).includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Aplicar tema cuando cambie
  useEffect(() => {
    applyTheme(theme);
  }, [theme, systemTheme]);

  // Escuchar cambios en el tema del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? "dark" : "light";
      setSystemTheme(newSystemTheme);
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  // Escuchar cambios en localStorage para sincronización entre pestañas
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "theme" && event.newValue) {
        const newTheme = event.newValue;
        if (Object.values(THEME_TYPES).includes(newTheme)) {
          setTheme(newTheme);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Función para cambiar el tema
  const changeTheme = (newTheme) => {
    if (!Object.values(THEME_TYPES).includes(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}`);
      return;
    }

    setTheme(newTheme);

    // Guardar en localStorage
    localStorage.setItem("theme", newTheme);

    // Disparar evento para sincronizar otras pestañas
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "theme",
        newValue: newTheme,
      })
    );
  };

  // Función para alternar entre temas
  const toggleTheme = () => {
    const themes = Object.values(THEME_TYPES);
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    changeTheme(themes[nextIndex]);
  };

  // Función para obtener el tema actual efectivo
  const getCurrentTheme = () => {
    if (theme === THEME_TYPES.SYSTEM) {
      return systemTheme;
    }
    return theme;
  };

  // Función para obtener el tema siguiente en el ciclo
  const getNextTheme = () => {
    const themes = Object.values(THEME_TYPES);
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    return themes[nextIndex];
  };

  // Función para obtener el nombre legible del tema
  const getThemeName = (themeType = theme) => {
    const names = {
      [THEME_TYPES.SYSTEM]: "Sistema",
      [THEME_TYPES.LIGHT]: "Claro",
      [THEME_TYPES.DARK]: "Oscuro",
    };
    return names[themeType] || "Desconocido";
  };

  // Función para obtener el nombre del tema siguiente
  const getNextThemeName = () => {
    return getThemeName(getNextTheme());
  };

  const value = {
    theme,
    systemTheme,
    currentTheme: getCurrentTheme(),
    changeTheme,
    toggleTheme,
    getCurrentTheme,
    getNextTheme,
    getNextThemeName,
    getThemeName,
    THEME_TYPES,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeContext;
