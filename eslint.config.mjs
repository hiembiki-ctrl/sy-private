import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 데이터 수집용 Bun 스크립트라 앱의 린트 대상이 아니다.
    "scripts/**",
    // Agent skills are vendored copies managed by skills-lock.json, and
    // .claude/worktrees holds duplicate checkouts of this app.
    ".claude/**",
    ".agents/**",
  ]),
]);

export default eslintConfig;
