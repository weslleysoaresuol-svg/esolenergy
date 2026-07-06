// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copyEsolAssets() {
  try {
    const sourceLogo = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/media__1783188730454.png";
    const destLogo = path.join(__dirname, "src", "assets", "esol-logo.png");
    if (fs.existsSync(sourceLogo)) {
      fs.copyFileSync(sourceLogo, destLogo);
      console.log("⚡ [ESOL Logo] Cópia de logo efetuada com sucesso!");
    }

    const sourceFav = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/media__1783190599008.png";
    const destFav = path.join(__dirname, "public", "favicon.png");
    if (fs.existsSync(sourceFav)) {
      fs.copyFileSync(sourceFav, destFav);
      console.log("⚡ [ESOL Favicon] Cópia de favicon efetuada com sucesso!");
    }

    const sourceInstaller = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/installer_solar_premium_1783309508885.png";
    const destInstaller = path.join(__dirname, "src", "assets", "installer-solar-premium.png");
    if (fs.existsSync(sourceInstaller)) {
      fs.copyFileSync(sourceInstaller, destInstaller);
      console.log("⚡ [ESOL Installer] Cópia do instalador efetuada com sucesso!");
    }

    const sourceHeroSolar = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/hero_solar_premium_1783308641338.png";
    const destHeroSolar = path.join(__dirname, "src", "assets", "hero-solar-premium.png");
    if (fs.existsSync(sourceHeroSolar)) {
      fs.copyFileSync(sourceHeroSolar, destHeroSolar);
      console.log("⚡ [ESOL Hero Solar] Cópia do Hero Solar efetuada com sucesso!");
    }

    const sourceTrustSeals = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/trust_seals_solar_1783309747519.png";
    const destTrustSeals = path.join(__dirname, "src", "assets", "trust-seals-solar.png");
    if (fs.existsSync(sourceTrustSeals)) {
      fs.copyFileSync(sourceTrustSeals, destTrustSeals);
      console.log("⚡ [ESOL Trust Seals] Cópia dos selos de confiança efetuada com sucesso!");
    }
  } catch (e) {
    console.error("❌ [ESOL Copy] Erro ao copiar mídias:", e);
  }
}

// Executar no carregamento inicial do arquivo de configuração
copyEsolAssets();

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: "esol-assets-plugin",
        buildStart() {
          copyEsolAssets();
        },
        handleHotUpdate() {
          copyEsolAssets();
        },
      },
    ],
  },
});

