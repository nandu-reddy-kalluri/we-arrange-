import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

// To avoid the known 'circular structure to JSON' ESLint 9 bug in Next.js 15
export default [
  ...eslintConfig,
  {
    ignores: [".next/**"]
  }
];
