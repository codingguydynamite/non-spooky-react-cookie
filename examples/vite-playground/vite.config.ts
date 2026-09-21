import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const librarySource = (file: string) =>
  fileURLToPath(new URL(`../../src/${file}`, import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    // `vite` (dev server): point the package at the library source for
    // instant HMR while editing src/. `vite build` (CI): resolve the real
    // workspace package, i.e. dist/, so the build also validates the
    // published shape (exports map, "use client", styles.css).
    alias:
      command === "serve"
        ? [
            {
              find: "non-spooky-react-cookie/styles.css",
              replacement: librarySource("styles.css"),
            },
            {
              find: "non-spooky-react-cookie/server",
              replacement: librarySource("server.ts"),
            },
            { find: /^non-spooky-react-cookie$/, replacement: librarySource("index.ts") },
          ]
        : [],
  },
}));
