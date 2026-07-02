import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  initializeAuth,
  logout,
} from "../../RTK_Query_app/state_slices/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();
  const hasAttemptedGuestLogin = useRef(false);

  // Función para hacer login automático como guest
  const performGuestLogin = async () => {
    if (hasAttemptedGuestLogin.current) {
      // console.log("🔄 Guest login already attempted, skipping...");
      return;
    }

    hasAttemptedGuestLogin.current = true;
    // console.log("🔄 Performing automatic guest login...");

    try {
      const response = await fetch("/api/v1/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "guest@outlook.com",
          password: "guest123",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // console.log("✅ Guest login successful");

        // Guardar tokens y datos en localStorage
        localStorage.setItem("jwt_token", data.current_user.token);
        localStorage.setItem("refresh_token", data.current_user.refresh_token);
        localStorage.setItem(
          "user_data",
          JSON.stringify({
            ccn_user: data.current_user.user_info.ccn_user,
            first_name: data.current_user.user_info.first_name,
            middle_name: data.current_user.user_info.middle_name,
            last_name: data.current_user.user_info.last_name,
            email: data.current_user.user_info.email,
            created_at: data.current_user.user_info.created_at,
          })
        );
        localStorage.setItem(
          "user_roles",
          JSON.stringify(
            (data.current_user.roles || []).map((role) => ({
              role_name: role.role_name,
            }))
          )
        );
        localStorage.setItem(
          "user_permissions",
          JSON.stringify(
            (data.current_user.permissions || []).map((permission) => ({
              resource: permission.resource,
              action: permission.action,
              description: permission.description,
            }))
          )
        );
        localStorage.setItem("auth_sync", Date.now().toString());

        // Inicializar autenticación
        dispatch(initializeAuth());
      } else {
        // console.error("❌ Guest login failed:", response.status);
      }
    } catch (error) {
      // console.error("❌ Error during guest login:", error);
    }
  };

  // Función para verificar y sincronizar autenticación
  const checkAndSyncAuth = () => {
    // console.log("🔧 AuthInitializer - Checking authentication state...");

    try {
      // Verificar si el token existe y no ha expirado
      const token = localStorage.getItem("jwt_token");
      const refreshToken = localStorage.getItem("refresh_token");

      // console.log("🔧 AuthInitializer - Token exists:", !!token);
      // console.log("🔧 AuthInitializer - Refresh token exists:", !!refreshToken);

      if (token && refreshToken) {
        // Verificar si el token ha expirado
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000; // Convertir a segundos

          // console.log(
          //   "🔧 AuthInitializer - Token expiration:",
          //   new Date(payload.exp * 1000)
          // );
          // console.log(
          //   "🔧 AuthInitializer - Current time:",
          //   new Date(currentTime * 1000)
          // );
          // console.log(
          //   "🔧 AuthInitializer - Token valid:",
          //   payload.exp > currentTime
          // );

          if (payload.exp > currentTime) {
            // Token válido, inicializar autenticación
            // console.log("✅ Token válido, inicializando autenticación");
            dispatch(initializeAuth());
          } else {
            // Token expirado, limpiar estado completamente
            // console.log("🔄 Token expirado, limpiando estado de autenticación");
            // console.log(
            //   `⏰ Token expiró: ${new Date(
            //     payload.exp * 1000
            //   ).toLocaleTimeString()}`
            // );
            // console.log(
            //   `⏰ Hora actual: ${new Date(
            //     currentTime * 1000
            //   ).toLocaleTimeString()}`
            // );

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
          // console.error("❌ Error al verificar token:", error);
          dispatch(logout());
        }
      } else {
        // No hay tokens, hacer login automático como guest
        // console.log(
        //   "ℹ️ No hay tokens en localStorage, iniciando login automático como guest"
        // );
        performGuestLogin();
      }
    } catch (error) {
      // Error al acceder al localStorage (modo incógnito, etc.)
      // console.error("❌ Error al acceder al localStorage:", error);
      dispatch(logout());
    }
  };

  useEffect(() => {
    // console.log(
    //   "🔧 AuthInitializer - Starting authentication initialization..."
    // );

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
        // console.log("🔄 AuthInitializer - Storage change detected:", event.key);
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
