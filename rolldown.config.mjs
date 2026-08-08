import { defineConfig } from "rolldown";
import { cp } from "node:fs/promises";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  input: "src/index.js",
  transform: {
    target: "es2022",
  },
  output: [
    {
      file: "dist/index.js",
      format: "es",
    },
    {
      file: `dist/dataset-config.${isProd ? "min." : ""}js`,
      format: "iife",
      name: "datasetConfig",
      minify: isProd,
    },
  ],
  plugins: [
    {
      name: "copy-types",
      async closeBundle() {
        await cp("src/index.d.ts", "dist/index.d.ts");
      },
    },
  ],
});
