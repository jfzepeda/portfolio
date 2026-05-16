import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,
  // Project rules
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      // Disable base rule for TS to avoid duplicate reports
      "no-unused-vars": "off",
      // Use the TypeScript-aware rule
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: false,
          argsIgnorePattern: "^_|^e$",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-undef": "error",
    },
  },
];

export default eslintConfig;
