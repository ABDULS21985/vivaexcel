import { config } from "@ktblog/eslint-config/base";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ["eslint.config.mjs"],
  },
];
