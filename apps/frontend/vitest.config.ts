import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.tsx"],
    include: ["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"],
    css: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "@/lib": resolve(__dirname, "./lib"),
      "@/hooks": resolve(__dirname, "./hooks"),
      "@/components": resolve(__dirname, "./components"),
      "@/providers": resolve(__dirname, "./providers"),
      "@/types": resolve(__dirname, "./types"),
    },
  },
});
