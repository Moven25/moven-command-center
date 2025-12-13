import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",        // 👈 force correct base for Netlify
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
