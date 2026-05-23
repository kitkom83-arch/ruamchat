import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "scripts/**/*.test.mjs"]
  },
  resolve: {
    alias: {
      "@ai-omni/shared": resolve(root, "packages/shared/src/index.ts")
    }
  }
});
