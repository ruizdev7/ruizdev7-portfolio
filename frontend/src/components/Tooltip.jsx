import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const Tooltip = ({
  children,
  content,
  position = "top",
  className = "",
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
      // Ajustar posición después de que el tooltip se muestre
      setTimeout(() => {
        adjustPosition();
      }, 50);
    }, delay);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    setShowTooltip(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const adjustPosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = position;
    let newStyle = {};

    // Para debuggers en las esquinas, siempre usar "top"
    if (rect.bottom > viewportHeight * 0.9) {
      newPosition = "top";

      // Ajustar la posición horizontal para que no se salga
      const tooltipWidth = tooltipRect.width;
      const tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;

      // Si se sale por la izquierda
      if (tooltipLeft < 10) {
        newStyle = { left: "10px", transform: "none" };
      }
      // Si se sale por la derecha
      else if (tooltipLeft + tooltipWidth > viewportWidth - 10) {
        newStyle = { right: "10px", left: "auto", transform: "none" };
      }
    }
    // Para elementos en la parte superior, usar "bottom"
    else if (rect.top < viewportHeight * 0.1) {
      newPosition = "bottom";
    }
    // Para elementos en el lado derecho, usar "left"
    else if (rect.right > viewportWidth * 0.9) {
      newPosition = "left";
    }
    // Para elementos en el lado izquierdo, usar "right"
    else if (rect.left < viewportWidth * 0.1) {
      newPosition = "right";
    }

    setAdjustedPosition(newPosition);
    setTooltipStyle(newStyle);
  };

  // Cerrar tooltip al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsVisible(false);
        setShowTooltip(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  // Posiciones del tooltip
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-1",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-1",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-1",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-1",
    "top-left": "bottom-full right-2 mb-1",
    "top-right": "bottom-full left-2 mb-1",
    "bottom-left": "top-full right-0 mt-1",
    "bottom-right": "top-full left-0 mt-1",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 dark:border-t-gray-700",
    bottom:
      "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 dark:border-b-gray-700",
    left: "left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 dark:border-l-gray-700",
    right:
      "right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 dark:border-r-gray-700",
    "top-left": "top-full right-2 border-t-gray-800 dark:border-t-gray-700",
    "top-right": "top-full left-2 border-t-gray-800 dark:border-t-gray-700",
    "bottom-left":
      "bottom-full right-2 border-b-gray-800 dark:border-b-gray-700",
    "bottom-right":
      "bottom-full left-2 border-b-gray-800 dark:border-b-gray-700",
  };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${
            positionClasses[adjustedPosition]
          } transition-all duration-300 ease-out ${
            showTooltip
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2"
          }`}
          style={tooltipStyle}
        >
          {/* Contenido del tooltip */}
          <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-600 dark:border-gray-600 max-w-xs backdrop-blur-sm">
            {content}
          </div>

          {/* Flecha del tooltip */}
          <div
            className={`absolute w-0 h-0 border-4 border-transparent transition-all duration-300 ${
              showTooltip ? "opacity-100" : "opacity-0"
            } ${arrowClasses[adjustedPosition]}`}
          />
        </div>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf([
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ]),
  className: PropTypes.string,
  delay: PropTypes.number,
};

export default Tooltip;
