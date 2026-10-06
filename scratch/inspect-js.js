import fs from 'fs';

const content = fs.readFileSync('public/admin/index.html', 'utf8');
const scriptStart = content.lastIndexOf('<script>');
const scriptContent = content.substring(scriptStart);

const fnMatches = [...scriptContent.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(/g)];
console.log('Functions defined in script:', fnMatches.map(m => m[1]));
