import type { Config } from "tailwindcss";
import { sharedTailwindConfig } from "./packages/config/tailwind.config";

const config: Config = {
  ...sharedTailwindConfig,
  content: [
    "./apps/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
