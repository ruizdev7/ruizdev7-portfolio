import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Limpia console.* y debugger del bundle en producción
    minify: "esbuild",
    esbuild: {
      drop: ["console", "debugger"],
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://backend:6000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          // Desactiva logs ruidosos en producción
          const isProd = process.env.NODE_ENV === "production";
          if (!isProd) {
            proxy.on("proxyReq", (proxyReq, req, res) => {
              console.log("🔄 Proxy request:", req.method, req.url);
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              console.log("📡 Proxy response:", proxyRes.statusCode, req.url);
            });
          }
        },
      },
    },
  },
});
