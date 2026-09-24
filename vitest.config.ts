import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    environmentOptions: {
      // jsdom's default about:blank is an opaque origin, where localStorage
      // is unavailable; a real URL keeps storage working in component tests.
      jsdom: { url: "http://localhost/" },
    },
  },
});
