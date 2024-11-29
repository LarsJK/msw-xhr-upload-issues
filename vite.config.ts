import { type UserConfig, defineConfig } from "vitest/config";

export default defineConfig((): UserConfig => {
  return {
    test: {
      globals: true,
      environment: "happy-dom",
      clearMocks: true,
      exclude: ["**/node_modules/**"],
    },
  };
});
