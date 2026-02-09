import js from "@eslint/js";
import eslintConfigNext from "eslint-config-next";
import turboConfig from "eslint-config-turbo/flat";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nextJsConfig = [
    ...eslintConfigNext,
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...turboConfig,
    {
        plugins: {
            onlyWarn,
        },
    },
    {
        ignores: ["dist/**"],
    },
];
