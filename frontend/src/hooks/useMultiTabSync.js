import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateLastActivity,
  syncFromStorage,
} from "../RTK_Query_app/state_slices/auth/authSlice";

export const useMultiTabSync = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const lastActivityRef = useRef(Date.now());

  // Función para verificar si el token está próximo a expirar
  const isTokenExpiringSoon = (token) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // Considerar que expira pronto si faltan menos de 5 minutos
      return timeUntilExpiration < 5 * 60 * 1000;
    } catch (error) {
      console.error("Error parsing token:", error);
      return true;
    }
  };

  // Función para sincronizar estado desde localStorage
  const syncFromLocalStorage = () => {
    try {
      const storedAuth = localStorage.getItem("auth_state");
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);

        // Verificar si el estado almacenado es más reciente
        if (parsedAuth.lastActivity > lastActivityRef.current) {
          dispatch(syncFromStorage(parsedAuth));
          lastActivityRef.current = parsedAuth.lastActivity;
          console.log("🔄 Synced auth state from localStorage");
        }
      }
    } catch (error) {
      console.error("Error syncing from localStorage:", error);
    }
  };

  // Función para verificar actividad reciente
  const checkRecentActivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Si han pasado más de 30 segundos, actualizar actividad
    if (timeSinceLastActivity > 30000) {
      dispatch(updateLastActivity());
      lastActivityRef.current = now;
    }
  };

  useEffect(() => {
    // Sincronizar al montar el componente
    syncFromLocalStorage();

    // Configurar intervalos para sincronización
    const syncInterval = setInterval(syncFromLocalStorage, 5000); // Cada 5 segundos
    const activityInterval = setInterval(checkRecentActivity, 10000); // Cada 10 segundos

    // Escuchar eventos de storage para sincronización en tiempo real
    const handleStorageChange = (e) => {
      if (e.key === "auth_state") {
        syncFromLocalStorage();
      }
    };

    // Escuchar eventos de focus para sincronizar cuando la pestaña vuelve a estar activa
    const handleFocus = () => {
      syncFromLocalStorage();
      dispatch(updateLastActivity());
    };

    // Escuchar eventos de visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncFromLocalStorage();
        dispatch(updateLastActivity());
      }
    };

    // Agregar event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(syncInterval);
      clearInterval(activityInterval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);

  // Verificar si el token está próximo a expirar
  const isTokenExpiring = isTokenExpiringSoon(authState.current_user?.token);

  return {
    authState,
    isTokenExpiring,
    syncFromLocalStorage,
    updateActivity: () => {
      dispatch(updateLastActivity());
      lastActivityRef.current = Date.now();
    },
  };
};
