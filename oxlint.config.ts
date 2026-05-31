import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "warn",
  },
  ignorePatterns: ["src-tauri/**", "dist/**", "docs/**"],
  rules: {
    "eslint/no-unused-vars": "error",
  },
});
