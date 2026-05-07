import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/history": "http://localhost:5003",
      "/settings": "http://localhost:5003",
      "/analyze": "http://localhost:5003",
    },
  },
});
