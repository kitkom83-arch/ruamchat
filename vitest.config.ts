import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "scripts/**/*.test.mjs"],
    // @prisma/client auto-loads the developer's local .env into process.env on
    // import. Scrub the outbound/AI/channel gating vars before every test so the
    // suite runs against the same clean defaults as CI, regardless of any local
    // .env used for real/sandbox go-live.
    setupFiles: [resolve(root, "vitest.setup.ts")]
  },
  resolve: {
    alias: {
      "@ai-omni/shared": resolve(root, "packages/shared/src/index.ts")
    }
  }
});
