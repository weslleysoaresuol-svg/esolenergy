// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "fs";
import path from "path";

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
} catch (e) {
  console.error("❌ [ESOL Copy] Erro ao copiar mídias:", e);
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
