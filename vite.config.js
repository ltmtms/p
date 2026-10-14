import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages project site: https://ltmtms.github.io/p/
  base: "/p/",
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
