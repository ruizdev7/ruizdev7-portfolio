import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AuthDebugger = () => {
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
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "20px",
        fontSize: "11px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255,255,255,0.1)",
        minWidth: "auto",
        maxWidth: "none",
      }}
    >
      {/* Indicador de estado principal */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: debugInfo.isAuthenticated ? "#10B981" : "#EF4444",
            animation: debugInfo.isAuthenticated ? "pulse 2s infinite" : "none",
          }}
        />
        <span style={{ fontWeight: "bold" }}>
          {debugInfo.isAuthenticated ? "AUTH" : "GUEST"}
        </span>
      </div>

      {/* Información compacta */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "10px", opacity: "0.8" }}>
          {debugInfo.userEmail !== "No user" ? debugInfo.userEmail : "Guest"}
        </span>
        {debugInfo.hasToken && (
          <span style={{ fontSize: "10px", opacity: "0.6" }}>
            {debugInfo.tokenExpiry.includes("❌") ? "EXP" : "OK"}
          </span>
        )}
      </div>

      {/* Botón de limpieza */}
      <button
        onClick={clearAuth}
        style={{
          padding: "2px 6px",
          fontSize: "9px",
          background: "#EF4444",
          border: "none",
          borderRadius: "10px",
          color: "white",
          cursor: "pointer",
          opacity: "0.8",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = "1")}
        onMouseLeave={(e) => (e.target.style.opacity = "0.8")}
        title="Limpiar autenticación"
      >
        ×
      </button>

      {/* Estilos CSS para animación */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AuthDebugger;
