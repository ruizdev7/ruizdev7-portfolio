import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AuthDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    const updateDebugInfo = () => {
      const token = localStorage.getItem("jwt_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const authSync = localStorage.getItem("auth_sync");

      setDebugInfo({
        timestamp: new Date().toLocaleTimeString(),
        isAuthenticated: auth.isAuthenticated,
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        authSync: authSync,
        userEmail: auth.user?.email || "No user",
        userName: auth.user
          ? `${auth.user.first_name} ${auth.user.last_name}`
          : "No user",
        userData: localStorage.getItem("user_data") ? "✅" : "❌",
        tokenExpiry: token
          ? (() => {
              try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const expTime = new Date(payload.exp * 1000);
                const now = new Date();
                const isExpired = expTime < now;
                return `${expTime.toLocaleTimeString()} ${
                  isExpired ? "❌ EXPIRED" : "✅ VALID"
                }`;
              } catch (e) {
                return "Invalid token";
              }
            })()
          : "No token",
      });
    };

    // Actualizar cada segundo
    const interval = setInterval(updateDebugInfo, 1000);
    updateDebugInfo();

    return () => clearInterval(interval);
  }, [auth]);

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) return null;

  const clearAuth = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_roles");
    localStorage.removeItem("user_permissions");
    localStorage.removeItem("auth_state");
    localStorage.removeItem("lastLoginTime");
    localStorage.setItem("auth_sync", Date.now().toString());
    window.location.reload();
  };

  return (
    <div
      className={`fixed hidden md:block bottom-4 left-4 bg-black/70 dark:bg-black/70 backdrop-blur-sm border border-white/10 shadow-lg z-50 text-xs text-white transition-all duration-300 ease-out cursor-pointer ${
        isExpanded ? "rounded-lg p-4 w-72" : "rounded-full px-3 py-2"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {!isExpanded ? (
        // Estado compacto
        <div className="flex items-center gap-2">
          {/* Indicador de estado principal */}
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                debugInfo.isAuthenticated
                  ? "bg-green-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
            <span className="font-bold text-xs">
              {debugInfo.isAuthenticated ? "AUTH" : "GUEST"}
            </span>
          </div>

          {/* Información compacta */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs opacity-80">
              {debugInfo.userEmail !== "No user"
                ? debugInfo.userEmail
                : "Guest"}
            </span>
            {debugInfo.hasToken && (
              <span className="text-xs opacity-60">
                {debugInfo.tokenExpiry.includes("❌") ? "EXP" : "OK"}
              </span>
            )}
          </div>

          {/* Botón de limpieza */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearAuth();
            }}
            className="px-1.5 py-0.5 text-xs bg-red-500 border-none rounded-full text-white cursor-pointer opacity-80 hover:opacity-100 transition-opacity duration-200"
            title="Limpiar autenticación"
          >
            ×
          </button>
        </div>
      ) : (
        // Estado expandido
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  debugInfo.isAuthenticated
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <span className="font-semibold">🔐 Auth Debug</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Estado:</span>
              <span
                className={`font-semibold ${
                  debugInfo.isAuthenticated ? "text-green-400" : "text-red-400"
                }`}
              >
                {debugInfo.isAuthenticated ? "AUTH" : "GUEST"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Usuario:</span>
              <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                {debugInfo.userName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Email:</span>
              <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                {debugInfo.userEmail}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">JWT Token:</span>
              <span
                className={`font-mono text-sm px-2 py-1 rounded ${
                  debugInfo.hasToken
                    ? "bg-green-900/50 text-green-400"
                    : "bg-red-900/50 text-red-400"
                }`}
              >
                {debugInfo.hasToken ? "✅ Presente" : "❌ Ausente"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Refresh:</span>
              <span
                className={`font-mono text-sm px-2 py-1 rounded ${
                  debugInfo.hasRefreshToken
                    ? "bg-green-900/50 text-green-400"
                    : "bg-red-900/50 text-red-400"
                }`}
              >
                {debugInfo.hasRefreshToken ? "✅ Presente" : "❌ Ausente"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Expiración:</span>
              <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                {debugInfo.tokenExpiry}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Actualizado:</span>
              <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                {debugInfo.timestamp}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;
