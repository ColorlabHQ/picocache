import { defineConfig } from "rolldown";
import { copyFiles } from "rolldown-plugin-copy-files";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  input: "src/index.js",
  platform: "browser",
  transform: {
    target: "es2022",
  },
  output: [
    {
      file: "dist/index.js",
      format: "es",
    },
    {
      file: `dist/picocache.${isProd ? "min." : ""}js`,
      format: "iife",
      name: "picocache",
      minify: isProd,
    },
  ],
  plugins: [
    copyFiles({
      targets: [
        {
          src: "src/*.d.ts",
          dest: "dist",
          options: { up: 1 },
        },
      ],
    }),
  ],
});
