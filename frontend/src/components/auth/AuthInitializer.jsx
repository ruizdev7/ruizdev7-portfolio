import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  initializeAuth,
  logout,
} from "../../RTK_Query_app/state_slices/authSlice";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(
      "🔧 AuthInitializer - Starting authentication initialization..."
    );

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
            // Token expirado, limpiar estado
            console.log("🔄 Token expirado, limpiando estado de autenticación");
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
  }, [dispatch]);

  // Este componente no renderiza nada, solo inicializa la autenticación
  return null;
};

export default AuthInitializer;
