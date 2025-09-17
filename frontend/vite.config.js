// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/saldo": "http://localhost:8000",
      "/movimentar": "http://localhost:8000",
      "/token": "http://localhost:8000",
    },
  },
});
