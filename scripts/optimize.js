import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const files = [
  'public/logos/logo_madelina-1.png',
  'public/logos/logo_madelina-4.png',
  'public/hero_bakery.png',
  'public/story_pastry.png'
];

async function optimize() {
  for (const file of files) {
    if (fs.existsSync(file)) {
      const ext = path.extname(file);
      const optimizedPath = file.replace(ext, `_opt${ext}`);
      
      await sharp(file)
        .resize({ width: 1200, withoutEnlargement: true }) // resize large images
        .png({ quality: 80, compressionLevel: 9 }) // optimize png
        .toFile(optimizedPath);
        
      // Replace original with optimized
      fs.renameSync(optimizedPath, file);
      console.log(`Optimized: ${file}`);
    } else {
      console.log(`Not found: ${file}`);
    }
  }
}

optimize().catch(console.error);
