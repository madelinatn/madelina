import fs from 'fs';
import path from 'path';

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      files = files.concat(walk(p));
    } else if (p.endsWith('.ts')) {
      files.push(p);
    }
  }
  return files;
}

const files = walk('functions');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const imports = [...content.matchAll(/from\s+['"](.*?)['"]/g)].map(m => m[1]);
  console.log(f, ':', imports);
});
