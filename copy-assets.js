import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filesToCopy = [
  {
    src: "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/media__1783188730454.png",
    dest: path.join(__dirname, "src", "assets", "esol-logo.png"),
    name: "Logo ESOL"
  },
  {
    src: "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/media__1783190599008.png",
    dest: path.join(__dirname, "public", "favicon.png"),
    name: "Favicon"
  },
  {
    src: "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/installer_solar_branded_1783346973969.png",
    dest: path.join(__dirname, "src", "assets", "installer-solar-premium.png"),
    name: "Instalador Premium Solar (Branded)"
  },
  {
    src: "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/hero_solar_premium_1783308641338.png",
    dest: path.join(__dirname, "src", "assets", "hero-solar-premium.png"),
    name: "Hero Solar Premium"
  },
  {
    src: "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/trust_seals_solar_1783309747519.png",
    dest: path.join(__dirname, "src", "assets", "trust-seals-solar.png"),
    name: "Selos de Confiança (Trust Seals)"
  }
];

console.log("🚀 Iniciando a cópia dos assets ESOL Energy...");

let successCount = 0;

filesToCopy.forEach((file) => {
  try {
    if (fs.existsSync(file.src)) {
      // Garantir que a pasta de destino existe
      const destDir = path.dirname(file.dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.copyFileSync(file.src, file.dest);
      console.log(`✅ [${file.name}] copiado com sucesso para: ${file.dest}`);
      successCount++;
    } else {
      console.warn(`⚠️ [${file.name}] Arquivo de origem não encontrado em: ${file.src}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao copiar [${file.name}]:`, error.message);
  }
});

console.log(`\n🎉 Processo concluído! Copiados ${successCount} de ${filesToCopy.length} arquivos.`);
