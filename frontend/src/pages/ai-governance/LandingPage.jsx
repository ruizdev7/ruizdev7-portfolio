/**
 * AI Governance Landing Page
 * Minimalist design with differentiated access
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  LockClosedIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const accessTypes = [
    {
      id: "company",
      title: "Empresa",
      subtitle: "Gestión completa y configuraciones",
      icon: BuildingOfficeIcon,
      description:
        "Control total sobre agentes, políticas, aprobaciones y auditoría.",
      features: [
        "Agentes de IA privados",
        "Políticas personalizadas",
        "Aprobaciones humanas",
        "Auditoría blockchain",
        "Configuraciones sensibles",
      ],
      route: "/auth/login?type=company",
      requiresAuth: true,
    },
    {
      id: "employee",
      title: "Empleado/Auditor",
      subtitle: "Revisión y ejecución de tareas",
      icon: UserGroupIcon,
      description:
        "Acceso a aprobaciones, revisión de tareas y consulta de auditoría.",
      features: [
        "Revisar aprobaciones",
        "Consultar auditoría",
        "Ejecutar tareas asignadas",
        "Ver estadísticas",
      ],
      route: "/auth/login?type=employee",
      requiresAuth: true,
    },
    {
      id: "public",
      title: "Operaciones Públicas",
      subtitle: "Acceso sin autenticación",
      icon: GlobeAltIcon,
      description:
        "Ejecuta tareas de IA publicadas por empresas sin registro.",
      features: [
        "Tareas públicas de IA",
        "Sin registro requerido",
        "Resultados en tiempo real",
      ],
      route: "/ai-governance/public",
      requiresAuth: false,
    },
  ];

  const handleAccessClick = (accessType) => {
    navigate(accessType.route);
  };

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark">
      {/* Minimal Header */}
      <div className="border-b border-do_border_light dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CpuChipIcon className="h-6 w-6 text-do_text_light dark:text-do_text_dark" />
              <span className="text-lg font-medium text-do_text_light dark:text-do_text_dark">
                AI Governance
              </span>
            </div>
            <Link
              to="/"
              className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark transition-colors"
            >
              Inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-do_text_light dark:text-do_text_dark mb-4 tracking-tight">
            Elige tu acceso
          </h1>
          <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark max-w-xl mx-auto">
            Diferentes niveles para empresas, empleados y operaciones públicas
          </p>
        </div>

        {/* Access Cards - Minimalist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {accessTypes.map((access) => {
            const Icon = access.icon;
            const isHovered = hoveredCard === access.id;

            return (
              <div
                key={access.id}
                className={`bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-8 transition-all cursor-pointer ${
                  isHovered
                    ? "border-do_text_light dark:border-gray-500 shadow-md"
                    : "hover:border-do_text_gray_light dark:hover:border-gray-600"
                }`}
                onClick={() => handleAccessClick(access)}
                onMouseEnter={() => setHoveredCard(access.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Icon */}
                <div className="mb-6">
                  <Icon className="h-8 w-8 text-do_text_light dark:text-do_text_dark" />
                </div>

                {/* Title & Subtitle */}
                <div className="mb-4">
                  <h3 className="text-xl font-medium text-do_text_light dark:text-do_text_dark mb-1">
                    {access.title}
                  </h3>
                  <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                    {access.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-do_text_light dark:text-do_text_dark mb-6 leading-relaxed">
                  {access.description}
                </p>

                {/* Features - Minimal */}
                <ul className="space-y-2 mb-6">
                  {access.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark"
                    >
                      • {feature}
                    </li>
                  ))}
                </ul>

                {/* Action */}
                <div className="flex items-center justify-between pt-4 border-t border-do_border_light dark:border-gray-700">
                  <span className="text-sm text-do_text_light dark:text-do_text_dark">
                    {access.requiresAuth ? "Iniciar sesión" : "Acceder"}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-do_text_gray_light dark:text-do_text_gray_dark" />
                </div>

                {access.requiresAuth && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
                    <LockClosedIcon className="h-3 w-3" />
                    <span>Requiere autenticación</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Section - Minimal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-t border-do_border_light dark:border-gray-700 pt-6">
            <p className="text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
              Tareas Públicas
            </p>
            <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark leading-relaxed">
              Las empresas pueden publicar tareas ejecutables por cualquiera en la red.
            </p>
          </div>
          <div className="border-t border-do_border_light dark:border-gray-700 pt-6">
            <p className="text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
              Configuraciones Sensibles
            </p>
            <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark leading-relaxed">
              Solo empresas tienen acceso a configuraciones y políticas avanzadas.
            </p>
          </div>
          <div className="border-t border-do_border_light dark:border-gray-700 pt-6">
            <p className="text-sm font-medium text-do_text_light dark:text-do_text_dark mb-2">
              Escalabilidad
            </p>
            <p className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark leading-relaxed">
              Desde operaciones internas hasta servicios públicos masivos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
