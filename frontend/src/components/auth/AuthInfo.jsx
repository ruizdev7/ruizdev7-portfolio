import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

const AuthInfo = () => {
  const [debugInfo, setDebugInfo] = useState({});
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

    const interval = setInterval(updateDebugInfo, 1000);
    updateDebugInfo();

    return () => clearInterval(interval);
  }, [auth]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🔐 Información de Autenticación
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Estado:</span>
          <span
            className={`font-semibold ${
              debugInfo.isAuthenticated
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {debugInfo.isAuthenticated ? "Autenticado" : "Invitado"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Usuario:</span>
          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {debugInfo.userName}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Email:</span>
          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {debugInfo.userEmail}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Token JWT:</span>
          <span
            className={`font-mono text-sm px-2 py-1 rounded ${
              debugInfo.hasToken
                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
            }`}
          >
            {debugInfo.hasToken ? "✅ Presente" : "❌ Ausente"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">
            Refresh Token:
          </span>
          <span
            className={`font-mono text-sm px-2 py-1 rounded ${
              debugInfo.hasRefreshToken
                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
            }`}
          >
            {debugInfo.hasRefreshToken ? "✅ Presente" : "❌ Ausente"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Expiración:</span>
          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {debugInfo.tokenExpiry}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">
            Última Actualización:
          </span>
          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {debugInfo.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthInfo;
