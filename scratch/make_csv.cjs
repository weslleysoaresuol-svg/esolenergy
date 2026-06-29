const fs = require('fs');
const path = require('path');

try {
  // Read kits-fallback.ts
  const content = fs.readFileSync(path.join(__dirname, '../src/lib/kits-fallback.ts'), 'utf8');

  // Locate the KITS_FALLBACK array
  const arrayStart = content.indexOf('export const KITS_FALLBACK');
  if (arrayStart === -1) {
    throw new Error("Não foi possível localizar KITS_FALLBACK no arquivo.");
  }
  
  const startBracket = content.indexOf('[', arrayStart);
  const endBracket = content.indexOf('];', startBracket) + 1;
  const arrayText = content.substring(startBracket, endBracket);

  // Clean the text to make it valid JSON
  let cleaned = arrayText
    .replace(/\/\/.*/g, '')                           // Remove single line comments
    .replace(/\r?\n\s*([a-zA-Z0-9_]+)\s*:/g, '\n"$1":') // Wrap keys safely at start of lines (avoids matching colons inside URL strings)
    .replace(/,\s*([}\]])/g, '$1');                   // Remove trailing commas before closing braces/brackets

  // Parse as JSON array
  const KITS_FALLBACK = JSON.parse(cleaned);

  // Generate CSV content
  const headers = [
    "Codigo", "Faixa", "Nome", "Potencia_kWp", "Qtd_Modulos", 
    "Fabricante_Modulos", "Potencia_Modulo_W", "Tecnologia_Modulo", 
    "Eficiencia_Modulo", "Inversor", "Tipo_Inversor", "Garantia_Modulos_Anos", 
    "Garantia_Inversor_Anos", "Preco", "Consumo_Min_kWh", "Consumo_Max_kWh", 
    "Fornecedor", "Link_B2B"
  ];

  let csvContent = headers.join(";") + "\n";

  KITS_FALLBACK.forEach(kit => {
    const row = [
      kit.id || "",
      kit.faixa || "",
      `"${(kit.nome || "").replace(/"/g, '""')}"`,
      kit.potencia_kwp || "",
      kit.quantidade_modulos || "",
      kit.fabricante_modulos || "",
      kit.potencia_modulo_w || "",
      kit.tecnologia_modulo || "",
      kit.eficiencia_modulo || "",
      `"${(kit.inversor || "").replace(/"/g, '""')}"`,
      kit.tipo_inversor || "",
      kit.garantia_modulos_anos || "",
      kit.garantia_inversor_anos || "",
      kit.preco || "",
      kit.consumo_kwh_min || "",
      kit.consumo_kwh_max || "",
      kit.fornecedor || "",
      kit.url_fornecedor || ""
    ];
    csvContent += row.join(";") + "\n";
  });

  // Write CSV with UTF-8 BOM so Excel opens it with accents correctly in Brazil
  const outputPath = path.join(__dirname, '../public/tabela-referencia-kits.csv');
  fs.writeFileSync(outputPath, '\ufeff' + csvContent, 'utf8');
  console.log("Planilha de kits gerada com sucesso em: public/tabela-referencia-kits.csv");
} catch (error) {
  console.error("Erro ao gerar planilha:", error);
}
