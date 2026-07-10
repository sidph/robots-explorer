import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // In local dev, the frontend runs on :5173 and the backend on :3001.
      // This proxy lets the frontend call "/api/..." exactly like it would
      // in production, where one server serves both.
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
