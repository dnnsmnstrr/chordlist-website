import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  // `**/.next/**` rather than `.next/**`: a git worktree under .claude/worktrees carries its own
  // build output, and linting bundled chunks buries the real findings under thousands of warnings.
  globalIgnores(["**/.next/**", "out/**", "build/**", "next-env.d.ts", ".claude/**"]),
])

