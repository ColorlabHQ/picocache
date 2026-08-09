import { glob, cp, mkdir } from "node:fs/promises";
import { dirname, basename, resolve } from "node:path";

export default function copyFiles(options = {}) {
  const { targets = [] } = options;

  return {
    name: "rolldown-plugin-copy-files",

    async writeBundle() {
      for (const target of targets) {
        for await (const file of glob(target.src)) {
          const dest = resolve(target.dest, basename(file));

          await mkdir(dirname(dest), {
            recursive: true,
          });

          await cp(file, dest);
        }
      }
    },
  };
}
