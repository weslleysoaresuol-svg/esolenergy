const fs = require('fs');
const path = require('path');

try {
  // Read kits-fallback.ts
  const content = fs.readFileSync(path.join(__dirname, '../src/lib/kits-fallback.ts'), 'utf8');

  // Clean TypeScript syntax to make it evaluatable in Node
  let jsContent = content
    .replace(/import\s+[\s\S]*?;/g, '')
    .replace(/export\s+interface\s+KitSolar\s*\{[\s\S]*?\}/g, '')
    .replace(/export\s+function\s+obterComponentesKit[\s\S]*?\n\}/g, '')
    .replace(/export\s+const\s+KITS_FALLBACK:\s+KitSolar\[\]\s*=/g, 'const KITS_FALLBACK =');

  jsContent += '\nmodule.exports = KITS_FALLBACK;';

  // Evaluate the JavaScript to load KITS_FALLBACK array
  const KITS_FALLBACK = eval(jsContent);

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
