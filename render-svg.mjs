import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const svgFile = 'architecture-diagram.svg';
const outputFile = 'architecture-diagram.png';

async function renderSVG() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Lire le SVG
  const svgContent = fs.readFileSync(svgFile, 'utf-8');
  
  // Créer une page HTML avec le SVG
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background: white; }
    svg { max-width: 100%; height: auto; display: block; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;
  
  await page.setContent(html);
  await page.screenshot({ path: outputFile, fullPage: true });
  
  console.log(`✅ Screenshot créé : ${outputFile}`);
  await browser.close();
}

renderSVG().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
