import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxying /api to the FastAPI backend during dev means the browser only
// ever talks to one origin (localhost:5173), so you never have to fight
// CORS while iterating. In production you'll instead set VITE_API_BASE_URL
// to your deployed backend's real origin (see src/lib/api.ts).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
