import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  const sourceLogo = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/media__1783188730454.png";
  const destLogo = path.join(__dirname, "src", "assets", "esol-logo.png");
  if (fs.existsSync(sourceLogo)) {
    fs.copyFileSync(sourceLogo, destLogo);
  }

  const sourceFav = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/media__1783190599008.png";
  const destFav = path.join(__dirname, "public", "favicon.png");
  if (fs.existsSync(sourceFav)) {
    fs.copyFileSync(sourceFav, destFav);
  }

  const sourceInstaller = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/installer_solar_premium_1783309508885.png";
  const destInstaller = path.join(__dirname, "src", "assets", "installer-solar-premium.png");
  if (fs.existsSync(sourceInstaller)) {
    fs.copyFileSync(sourceInstaller, destInstaller);
  }

  const sourceHeroSolar = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/hero_solar_premium_1783308641338.png";
  const destHeroSolar = path.join(__dirname, "src", "assets", "hero-solar-premium.png");
  if (fs.existsSync(sourceHeroSolar)) {
    fs.copyFileSync(sourceHeroSolar, destHeroSolar);
  }

  const sourceTrustSeals = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/trust_seals_solar_1783309747519.png";
  const destTrustSeals = path.join(__dirname, "src", "assets", "trust-seals-solar.png");
  if (fs.existsSync(sourceTrustSeals)) {
    fs.copyFileSync(sourceTrustSeals, destTrustSeals);
  }
} catch (e) {
  // Silent fallback
}


export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  eslintPluginPrettier,
);
