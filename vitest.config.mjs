import { configDefaults, defineConfig } from "vitest/config";

const nodeMajor = +process.versions.node.split(".")[0];

console.log(nodeMajor);

export default defineConfig({
  test: {
    clearMocks: true,
    restoreMocks: true,
    environment: "jsdom",
    execArgv: nodeMajor >= 25 ? ["--no-experimental-webstorage"] : [],
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
