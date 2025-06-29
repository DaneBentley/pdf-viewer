#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildTailwind() {
  console.log('Building Tailwind CSS...');
  
  const inputFile = path.join(__dirname, 'web', 'tailwind-simple.css');
  const outputFile = path.join(__dirname, 'web', 'tailwind-built.css');
  
  try {
    // Read the Tailwind CSS file
    const css = fs.readFileSync(inputFile, 'utf8');
    
    // Process with PostCSS
    const result = await postcss([
      tailwindcss('./tailwind.config.js'),
      autoprefixer({
        overrideBrowserslist: [
          'last 2 versions',
          '> 1%',
          'Firefox ESR'
        ]
      })
    ]).process(css, { from: inputFile, to: outputFile });
    
    // Write the result
    fs.writeFileSync(outputFile, result.css);
    
    if (result.map) {
      fs.writeFileSync(outputFile + '.map', result.map.toString());
    }
    
    console.log('✅ Tailwind CSS built successfully!');
    console.log(`📁 Output: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Error building Tailwind CSS:', error);
    process.exit(1);
  }
}

buildTailwind(); 