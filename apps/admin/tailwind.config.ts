import type { Config } from "tailwindcss";
import { sharedTailwindConfig } from "@we-arrange/config";

const config: Config = {
  ...sharedTailwindConfig,
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
