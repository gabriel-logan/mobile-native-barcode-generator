import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/typescript/**/*.test.ts"],
    exclude: ["example/**", "dist/**", "types/**", "build/**"],
    clearMocks: true,
  },
});
