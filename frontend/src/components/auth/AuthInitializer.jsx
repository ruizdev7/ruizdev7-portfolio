import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  initializeAuth,
  logout,
} from "../../RTK_Query_app/state_slices/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  // Función para verificar y sincronizar autenticación
  const checkAndSyncAuth = () => {
    console.log("🔧 AuthInitializer - Checking authentication state...");

    try {
      // Verificar si el token existe y no ha expirado
      const token = localStorage.getItem("jwt_token");
      const refreshToken = localStorage.getItem("refresh_token");

      console.log("🔧 AuthInitializer - Token exists:", !!token);
      console.log("🔧 AuthInitializer - Refresh token exists:", !!refreshToken);

      if (token && refreshToken) {
        // Verificar si el token ha expirado
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000; // Convertir a segundos

          console.log(
            "🔧 AuthInitializer - Token expiration:",
            new Date(payload.exp * 1000)
          );
          console.log(
            "🔧 AuthInitializer - Current time:",
            new Date(currentTime * 1000)
          );
          console.log(
            "🔧 AuthInitializer - Token valid:",
            payload.exp > currentTime
          );

          if (payload.exp > currentTime) {
            // Token válido, inicializar autenticación
            console.log("✅ Token válido, inicializando autenticación");
            dispatch(initializeAuth());
          } else {
            // Token expirado, limpiar estado completamente
            console.log("🔄 Token expirado, limpiando estado de autenticación");
            console.log(
              `⏰ Token expiró: ${new Date(
                payload.exp * 1000
              ).toLocaleTimeString()}`
            );
            console.log(
              `⏰ Hora actual: ${new Date(
                currentTime * 1000
              ).toLocaleTimeString()}`
            );

            // Limpiar localStorage completamente
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_data");
            localStorage.removeItem("user_roles");
            localStorage.removeItem("user_permissions");
            localStorage.removeItem("auth_state");

            dispatch(logout());
          }
        } catch (error) {
          // Error al parsear el token, limpiar estado
          console.error("❌ Error al verificar token:", error);
          dispatch(logout());
        }
      } else {
        // No hay tokens, limpiar estado
        console.log("ℹ️ No hay tokens en localStorage");
        dispatch(logout());
      }
    } catch (error) {
      // Error al acceder al localStorage (modo incógnito, etc.)
      console.error("❌ Error al acceder al localStorage:", error);
      dispatch(logout());
    }
  };

  useEffect(() => {
    console.log(
      "🔧 AuthInitializer - Starting authentication initialization..."
    );

    // Verificación inicial
    checkAndSyncAuth();

    // Polling cada 2 segundos para verificar cambios (más confiable que eventos)
    const intervalId = setInterval(checkAndSyncAuth, 2000);

    // Listener para cambios en localStorage (sincronización entre pestañas)
    const handleStorageChange = (event) => {
      if (
        event.key === "jwt_token" ||
        event.key === "refresh_token" ||
        event.key === "auth_sync"
      ) {
        console.log("🔄 AuthInitializer - Storage change detected:", event.key);
        // Verificación inmediata
        checkAndSyncAuth();
      }
    };

    // Listener para eventos de storage (cambios entre pestañas)
    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  // Este componente no renderiza nada, solo inicializa la autenticación
  return null;
};

export default AuthInitializer;
