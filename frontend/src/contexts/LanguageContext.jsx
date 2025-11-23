import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

// Crear el contexto
const LanguageContext = createContext();

// Hook personalizado para usar el contexto
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Durante desarrollo/hot reload, proporcionar valores por defecto en lugar de lanzar error
    if (import.meta.env.DEV) {
      console.warn(
        "useLanguage called outside LanguageProvider, using default values"
      );
      return {
        language: LANGUAGES.ES,
        changeLanguage: () => {},
        t: (key) => key,
        LANGUAGES,
      };
    }
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Idiomas disponibles
export const LANGUAGES = {
  ES: "es",
  EN: "en",
};

// Traducciones
const translations = {
  es: {
    // AI Governance - General
    "ai.governance": "AI Governance Platform",
    "ai.governance.subtitle":
      "Automated AI with Human Oversight + MPC Privacy + Blockchain Audit",
    "common.back": "Volver al Dashboard",
    "common.create": "Crear",
    "common.edit": "Editar",
    "common.update": "Actualizar",
    "common.delete": "Eliminar",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.saving": "Guardando...",
    "common.name": "Nombre",
    "common.description": "Descripción",
    "common.status": "Estado",
    "common.actions": "Acciones",
    "common.required": "requerido",
    "common.select": "Selecciona",

    // Agents
    "agents.title": "AI Agents Management",
    "agents.subtitle": "Gestiona tus agentes de IA",
    "agents.create": "Crear Agent",
    "agents.edit": "Editar Agent",
    "agents.createNew": "Crear Nuevo Agent",
    "agents.type": "Tipo de Agent",
    "agents.model": "Modelo",
    "agents.threshold": "Confidence Threshold",
    "agents.created": "Agent creado exitosamente",
    "agents.updated": "Agent actualizado exitosamente",
    "agents.deleted": "Agent eliminado exitosamente",
    "agents.error": "Error al guardar el agent",
    "agents.deleteError": "Error al eliminar el agent",
    "agents.deleteConfirm": "Confirmar Eliminación",
    "agents.deleteMessage":
      "¿Estás seguro de que deseas eliminar este agent? Esta acción no se puede deshacer.",

    // Tasks
    "tasks.title": "AI Tasks Management",
    "tasks.subtitle": "Ejecuta y gestiona tareas de IA",
    "tasks.execute": "Ejecutar Nueva Tarea",
    "tasks.executeButton": "Ejecutar Tarea",
    "tasks.executing": "Ejecutando...",
    "tasks.executed": "Tarea ejecutada exitosamente",
    "tasks.error": "Error al ejecutar la tarea",
    "tasks.inputData": "Input Data (JSON)",
    "tasks.inputDataPlaceholder": '{"revenue": 1000000, "expenses": 750000}',
    "tasks.inputDataExample":
      'Ejemplo simple: {"revenue": 1000000, "expenses": 750000} | Para análisis personalizado, incluye un campo "prompt" con tus instrucciones específicas.',
    "tasks.inputDataHelp":
      "Ingresa datos en formato JSON válido. Puedes incluir un campo 'prompt' para instrucciones personalizadas a la IA.",

    // Approvals
    "approvals.title": "Human-in-the-Loop Approvals",
    "approvals.subtitle": "Revisa y aprueba o rechaza las decisiones de IA",
    "approvals.approve": "Aprobar",
    "approvals.reject": "Rechazar",
    "approvals.view": "Ver",
    "approvals.justification": "Justificación",
    "approvals.modifiedOutput": "Output Modificado (JSON, opcional)",
    "approvals.approved": "Tarea aprobada exitosamente",
    "approvals.rejected": "Tarea rechazada exitosamente",

    // Policies
    "policies.title": "Governance Policies",
    "policies.subtitle":
      "Define y gestiona políticas de gobernanza para tus agentes de IA",
    "policies.create": "Crear Política",
    "policies.edit": "Editar Política",
    "policies.createNew": "Crear Nueva Política",
    "policies.enforcementLevel": "Nivel de Aplicación",
    "policies.appliesTo": "Aplica a (opcional)",
    "policies.ruleJson": "Regla JSON",
    "policies.active": "Política activa",
    "policies.created": "Política creada exitosamente",
    "policies.updated": "Política actualizada exitosamente",
    "policies.deleted": "Política eliminada exitosamente",
    "policies.error": "Error al guardar la política",
    "policies.deleteError": "Error al eliminar la política",

    // Blockchain
    "blockchain.title": "Blockchain Audit Trail",
    "blockchain.subtitle":
      "Registro inmutable de todas las decisiones y acciones del sistema",
    "blockchain.refresh": "Actualizar",
    "blockchain.totalRecords": "Total de Registros",
    "blockchain.showing": "Mostrando",
    "blockchain.uniqueTypes": "Tipos Únicos",

    // Form validations
    "validation.required": "es requerido",
    "validation.min": "Mínimo",
    "validation.max": "Máximo",
    "validation.invalidJson": "Debe ser un JSON válido",
    "validation.minLength": "Mínimo {min} caracteres",
    "validation.maxLength": "Máximo {max} caracteres",
  },
  en: {
    // AI Governance - General
    "ai.governance": "AI Governance Platform",
    "ai.governance.subtitle":
      "Automated AI with Human Oversight + MPC Privacy + Blockchain Audit",
    "common.back": "Back to Dashboard",
    "common.create": "Create",
    "common.edit": "Edit",
    "common.update": "Update",
    "common.delete": "Delete",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.saving": "Saving...",
    "common.name": "Name",
    "common.description": "Description",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.required": "required",
    "common.select": "Select",

    // Agents
    "agents.title": "AI Agents Management",
    "agents.subtitle": "Manage your AI agents",
    "agents.create": "Create Agent",
    "agents.edit": "Edit Agent",
    "agents.createNew": "Create New Agent",
    "agents.type": "Agent Type",
    "agents.model": "Model",
    "agents.threshold": "Confidence Threshold",
    "agents.created": "Agent created successfully",
    "agents.updated": "Agent updated successfully",
    "agents.deleted": "Agent deleted successfully",
    "agents.error": "Error saving agent",
    "agents.deleteError": "Error deleting agent",
    "agents.deleteConfirm": "Confirm Deletion",
    "agents.deleteMessage":
      "Are you sure you want to delete this agent? This action cannot be undone.",

    // Tasks
    "tasks.title": "AI Tasks Management",
    "tasks.subtitle": "Execute and manage AI tasks",
    "tasks.execute": "Execute New Task",
    "tasks.executeButton": "Execute Task",
    "tasks.executing": "Executing...",
    "tasks.executed": "Task executed successfully",
    "tasks.error": "Error executing task",
    "tasks.inputData": "Input Data (JSON)",
    "tasks.inputDataPlaceholder": '{"revenue": 1000000, "expenses": 750000}',
    "tasks.inputDataExample":
      'Simple example: {"revenue": 1000000, "expenses": 750000} | For custom analysis, include a "prompt" field with your specific instructions.',
    "tasks.inputDataHelp":
      "Enter data in valid JSON format. You can include a 'prompt' field for custom instructions to the AI.",

    // Approvals
    "approvals.title": "Human-in-the-Loop Approvals",
    "approvals.subtitle": "Review and approve or reject AI decisions",
    "approvals.approve": "Approve",
    "approvals.reject": "Reject",
    "approvals.view": "View",
    "approvals.justification": "Justification",
    "approvals.modifiedOutput": "Modified Output (JSON, optional)",
    "approvals.approved": "Task approved successfully",
    "approvals.rejected": "Task rejected successfully",

    // Policies
    "policies.title": "Governance Policies",
    "policies.subtitle":
      "Define and manage governance policies for your AI agents",
    "policies.create": "Create Policy",
    "policies.edit": "Edit Policy",
    "policies.createNew": "Create New Policy",
    "policies.enforcementLevel": "Enforcement Level",
    "policies.appliesTo": "Applies To (optional)",
    "policies.ruleJson": "Rule JSON",
    "policies.active": "Active policy",
    "policies.created": "Policy created successfully",
    "policies.updated": "Policy updated successfully",
    "policies.deleted": "Policy deleted successfully",
    "policies.error": "Error saving policy",
    "policies.deleteError": "Error deleting policy",

    // Blockchain
    "blockchain.title": "Blockchain Audit Trail",
    "blockchain.subtitle":
      "Immutable record of all system decisions and actions",
    "blockchain.refresh": "Refresh",
    "blockchain.totalRecords": "Total Records",
    "blockchain.showing": "Showing",
    "blockchain.uniqueTypes": "Unique Types",

    // Form validations
    "validation.required": "is required",
    "validation.min": "Minimum",
    "validation.max": "Maximum",
    "validation.invalidJson": "Must be valid JSON",
    "validation.minLength": "Minimum {min} characters",
    "validation.maxLength": "Maximum {max} characters",
  },
};

// Función para obtener traducción
const getTranslation = (key, language, params = {}) => {
  const lang = translations[language] || translations[LANGUAGES.ES];
  let translation = lang[key] || key;

  // Reemplazar parámetros
  Object.keys(params).forEach((param) => {
    translation = translation.replace(`{${param}}`, params[param]);
  });

  return translation;
};

// Provider del contexto
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(LANGUAGES.ES);

  // Cargar idioma desde localStorage al inicializar
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && Object.values(LANGUAGES).includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Detectar idioma del navegador
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "es" || browserLang === "en") {
        setLanguage(browserLang);
      }
    }
  }, []);

  // Escuchar cambios en localStorage para sincronización entre pestañas
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "language" && event.newValue) {
        const newLanguage = event.newValue;
        if (Object.values(LANGUAGES).includes(newLanguage)) {
          setLanguage(newLanguage);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Función para cambiar el idioma
  const changeLanguage = (newLanguage) => {
    if (!Object.values(LANGUAGES).includes(newLanguage)) {
      console.warn(`Invalid language: ${newLanguage}`);
      return;
    }

    setLanguage(newLanguage);

    // Guardar en localStorage
    localStorage.setItem("language", newLanguage);

    // Disparar evento para sincronizar otras pestañas
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "language",
        newValue: newLanguage,
      })
    );
  };

  // Función para obtener traducción
  const t = (key, params = {}) => {
    return getTranslation(key, language, params);
  };

  const value = {
    language,
    changeLanguage,
    t,
    LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LanguageContext;
