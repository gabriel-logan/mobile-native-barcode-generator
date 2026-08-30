import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  globalIgnores(["dist/**", "types/**", "example/**", "examples/**"]),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  // Must come after `recommended`, which turns these rules back on: the
  // automatic JSX runtime makes the React import unnecessary.
  pluginReact.configs.flat["jsx-runtime"],
  eslintPluginPrettierRecommended,
  {
    settings: {
      react: {
        // Pinned instead of "detect": eslint-plugin-react 7.37 crashes on
        // ESLint 10 while detecting (it calls the removed context.getFilename).
        version: "19.2",
      },
    },
  },
  {
    // CommonJS files run by Node: react-native.config.js, scripts/*.js.
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
        module: "writable",
        process: "readonly",
        require: "readonly",
      },
    },
    rules: {
      // `require` is the point of a CommonJS file.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
