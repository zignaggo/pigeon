import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,
  singleQuote: false,
  tabWidth: 2,
  sortImports: true,
  trailingComma: "all",
  ignorePatterns: ["src-tauri/**", "dist/**", "docs/**"],
});
