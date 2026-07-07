import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const files = [
  'esol-logo-horizontal',
  'esol-logo-horizontal-negative',
  'esol-logo-stacked',
  'esol-logo-stacked-negative',
  'esol-logo-brandmark',
  'esol-logo-brandmark-white'
];

async function convert() {
  console.log('Iniciando conversão de SVGs para PNGs de alta resolução...');
  const outputDir = 'public/brand-kit/2. Imagens-PNG';
  const srcAssetsDir = 'src/assets';
  fs.mkdirSync(outputDir, { recursive: true });

  for (const file of files) {
    const svgPath = `public/brand-kit/1. Web-SVG/${file}.svg`;
    const destPngPath = path.join(outputDir, `${file}.png`);
    
    try {
      // Usar densidade alta (300 DPI) para renderizar o vetor com nitidez cristalina
      await sharp(svgPath, { density: 300 })
        .png()
        .toFile(destPngPath);
        
      console.log(`Sucesso: ${file}.png gerado em alta resolução.`);
      
      // Também copiar as imagens principais para src/assets
      if (file === 'esol-logo-horizontal') {
        await sharp(svgPath, { density: 300 })
          .png()
          .toFile(path.join(srcAssetsDir, 'esol-logo.png'));
        console.log(`Sucesso: esol-logo.png copiado para src/assets.`);
      }
      if (file === 'esol-logo-horizontal-negative') {
        await sharp(svgPath, { density: 300 })
          .png()
          .toFile(path.join(srcAssetsDir, 'esol-logo-white.png'));
        console.log(`Sucesso: esol-logo-white.png copiado para src/assets.`);
      }
      
    } catch (err) {
      console.error(`Erro ao converter ${file}:`, err);
    }
  }
  
  // Criar favicon.png a partir do brandmark
  try {
    const brandmarkSvg = 'public/brand-kit/1. Web-SVG/esol-logo-brandmark.svg';
    await sharp(brandmarkSvg, { density: 300 })
      .resize(512, 512)
      .png()
      .toFile('public/favicon.png');
    console.log('Sucesso: favicon.png gerado a partir do brandmark.');
  } catch (err) {
    console.error('Erro ao gerar favicon.png:', err);
  }
}

convert();
