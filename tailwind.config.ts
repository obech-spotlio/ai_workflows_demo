import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 configuration
 *
 * Note: Tailwind CSS v4 is primarily CSS-first — most theme configuration
 * lives in `src/app/globals.css` using `@theme` blocks.
 *
 * This file is retained for JS-based customisation and future integration
 * of the Stitch design system preset.
 *
 * TODO: Replace the placeholder below with the actual Stitch preset once the
 * package name and version are confirmed:
 *
 *   import stitchPreset from "@spotlio/stitch-tailwind-preset";
 *   export default { presets: [stitchPreset], ... } satisfies Config;
 */
const config: Config = {
  // presets: [stitchPreset], // uncomment once the Stitch preset is available
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config satisfies Config;
