import { defineConfig } from "vite";
import { loadEnv } from "vite";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const root = dirname(fileURLToPath(import.meta.url));
  const env = loadEnv(mode, root, "");
  const apiBaseUrl = env.VITE_API_BASE_URL || "https://localhost:7198/api/v1";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: new URL(apiBaseUrl).origin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
