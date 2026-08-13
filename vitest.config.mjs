import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    environment: "jsdom",
    execArgv: ["--no-experimental-webstorage"],
    include: ["test/**/*.test.js"],
    coverage: {
      include: ["src/**/*.js"],
      exclude: [...configDefaults.exclude],
      provider: "v8",
      reporter: ["text", "html", "lcov"],

      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 80,
      },
    },
  },
});
