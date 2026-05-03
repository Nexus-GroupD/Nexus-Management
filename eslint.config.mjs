import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  // Ignore generated/build directories
  {
    ignores: [".next/**", "node_modules/**", "prisma/**"],
  },

  // JS baseline
  js.configs.recommended,

  // TypeScript files
  ...tseslint.configs.recommended,

  // CommonJS config files (jest.config.js, etc.) need Node globals
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Project-wide rule overrides
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-unused-vars": "off",
    },
  }
);
