import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["react-server"],
    alias: {
      "server-only": path.resolve(import.meta.dirname, "packages/database/node_modules/server-only/empty.js"),
      "@": path.resolve(import.meta.dirname, "apps/web"),
      "@we-arrange/auth": path.resolve(import.meta.dirname, "packages/auth/src/index.ts"),
      "@we-arrange/database/clients": path.resolve(import.meta.dirname, "packages/database/src/clients.ts"),
      "@we-arrange/database/errors": path.resolve(import.meta.dirname, "packages/database/src/errors.ts"),
      "@we-arrange/database/repository": path.resolve(import.meta.dirname, "packages/database/src/repository.ts"),
      "@we-arrange/database/types": path.resolve(import.meta.dirname, "packages/database/src/database.types.ts"),
      "@we-arrange/database": path.resolve(import.meta.dirname, "packages/database/src/index.ts"),
      "@we-arrange/service-venue": path.resolve(import.meta.dirname, "services/venue/src/index.ts"),
      "@we-arrange/service-vendor": path.resolve(import.meta.dirname, "services/vendor/src/index.ts"),
      "@we-arrange/service-customer": path.resolve(import.meta.dirname, "services/customer/src/index.ts"),
      "@we-arrange/service-booking": path.resolve(import.meta.dirname, "services/booking/src/index.ts"),
      "@we-arrange/types": path.resolve(import.meta.dirname, "packages/types/src/index.ts"),
      "@we-arrange/validation": path.resolve(import.meta.dirname, "packages/validation/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    server: {
      deps: {
        inline: ["server-only"],
      },
    },
    include: [
      "packages/**/__tests__/**/*.test.ts",
      "services/**/__tests__/**/*.test.ts",
      "apps/web/**/__tests__/**/*.test.ts",
    ],
    exclude: ["**/node_modules/**", "**/.next/**", "apps/web/app/api/health/supabase/route.test.ts"],
  },
});
