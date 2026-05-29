import sharp from 'sharp';
import fs from 'fs';

const svgFile = 'architecture-diagram.svg';
const pngFile = 'architecture-diagram.png';

const svgContent = fs.readFileSync(svgFile, 'utf-8');

sharp(Buffer.from(svgContent))
  .png()
  .resize(1000, 750, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
  .toFile(pngFile, (err, info) => {
    if (err) {
      console.error('❌ Conversion échouée:', err);
      process.exit(1);
    }
    console.log(`✅ SVG converti en PNG : ${pngFile}`);
  });
