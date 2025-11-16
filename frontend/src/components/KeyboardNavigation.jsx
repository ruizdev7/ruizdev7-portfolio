import { useState } from "react";
import PropTypes from "prop-types";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const KeyboardNavigation = ({
  onUp,
  onDown,
  onTop,
  showTop = false,
  className = "",
}) => {
  const [pressedKey, setPressedKey] = useState(null);

  const handleKeyPress = (direction, action) => {
    setPressedKey(direction);

    // Ejecutar la acción
    if (action) {
      action();
    }

    // Resetear el estado después de la animación
    setTimeout(() => {
      setPressedKey(null);
    }, 150);
  };

  // Componente interno KeyButton - minimalista y transparente
  // eslint-disable-next-line react/prop-types
  const KeyButton = ({ direction, icon: Icon, action, label }) => {
    const isPressed = pressedKey === direction;

    return (
      <button
        onClick={() => handleKeyPress(direction, action)}
        className={`
          relative group
          w-8 h-8
          bg-white/10 dark:bg-gray-900/20
          backdrop-blur-sm
          border border-gray-300/30 dark:border-gray-600/30
          rounded
          shadow-sm
          flex items-center justify-center
          transition-all duration-75 ease-out
          hover:bg-white/20 dark:hover:bg-gray-900/30
          hover:border-gray-400/40 dark:hover:border-gray-500/40
          ${
            isPressed
              ? "transform translate-y-[1px] scale-[0.97] bg-white/15 dark:bg-gray-900/25"
              : ""
          }
        `}
        aria-label={label}
        title={label}
      >
        {/* Icono */}
        <Icon
          className={`w-3.5 h-3.5 text-gray-700/80 dark:text-gray-200/80 transition-all duration-75 relative z-10 ${
            isPressed ? "scale-95" : "group-hover:scale-110"
          }`}
        />
      </button>
    );
  };

  return (
    <div
      className={`keyboard-navigation flex flex-col items-center gap-2 ${className}`}
    >
      {/* Layout de teclas de dirección - minimalista y transparente */}
      <div className="flex flex-col gap-1 p-1.5 bg-white/5 dark:bg-gray-900/10 backdrop-blur-md rounded-lg border border-gray-300/20 dark:border-gray-600/20 shadow-sm">
        {/* Botón de volver arriba (Home/Top) - solo se muestra si showTop es true */}
        {showTop && onTop && (
          <button
            onClick={() => handleKeyPress("top", onTop)}
            className={`
              relative group
              w-8 h-8
              bg-[#0272AD]/40 dark:bg-[#0272AD]/30
              backdrop-blur-sm
              border border-[#0272AD]/50 dark:border-[#0272AD]/40
              rounded
              shadow-sm
              flex items-center justify-center
              transition-all duration-75 ease-out
              hover:bg-[#0272AD]/50 dark:hover:bg-[#0272AD]/40
              mb-0.5
              ${
                pressedKey === "top"
                  ? "transform translate-y-[1px] scale-[0.97]"
                  : ""
              }
            `}
            aria-label="Volver arriba / Ir al inicio"
            title="Volver arriba / Ir al inicio"
          >
            {/* Icono */}
            <ArrowPathIcon
              className={`w-3.5 h-3.5 text-[#0272AD] dark:text-[#0272AD]/90 transition-all duration-75 relative z-10 ${
                pressedKey === "top"
                  ? "scale-95 rotate-180"
                  : "group-hover:scale-110 group-hover:rotate-180"
              }`}
            />
          </button>
        )}

        {/* Fila superior - flecha arriba */}
        <KeyButton
          direction="up"
          icon={ArrowUpIcon}
          action={onUp}
          label="Scroll Up / Previous Section"
        />

        {/* Fila inferior - flecha abajo */}
        <KeyButton
          direction="down"
          icon={ArrowDownIcon}
          action={onDown}
          label="Scroll Down / Next Section"
        />
      </div>
    </div>
  );
};

KeyboardNavigation.propTypes = {
  onUp: PropTypes.func,
  onDown: PropTypes.func,
  onTop: PropTypes.func,
  showTop: PropTypes.bool,
  className: PropTypes.string,
};

export default KeyboardNavigation;
