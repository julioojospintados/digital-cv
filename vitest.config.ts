import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Run test files matching these patterns
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],

    // Use Node environment (no DOM)
    environment: "node",

    // Coverage settings (npm run test:coverage)
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts", "src/index.ts", "src/http.ts"],
    },
  },
});
