const fs = require('fs');
const c = fs.readFileSync('public/admin/index.html', 'utf8');
const lines = c.split('\n');

console.log('=== SITE AUDIT ===');
console.log('File size KB:', Math.round(c.length / 1024));
console.log('Total lines:', lines.length);

// 1. Check for duplicate IDs
const idMatches = [];
const idRe = /id="([^"]+)"/g;
let m;
while ((m = idRe.exec(c)) !== null) idMatches.push(m[1]);
const idCounts = {};
idMatches.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
const dupes = Object.entries(idCounts).filter(([k, n]) => n > 1 && !['u-cat-all'].includes(k));
if (dupes.length) {
  console.log('\nDUPLICATE IDs (' + dupes.length + '):');
  dupes.forEach(([id, n]) => console.log('  ' + id + ' x' + n));
} else {
  console.log('\nNo duplicate IDs.');
}

// 2. Check for undefined function references in onclick
const onclickFuncs = new Set();
const onclickRe = /onclick="([a-zA-Z_$][a-zA-Z0-9_$]*)\(/g;
while ((m = onclickRe.exec(c)) !== null) onclickFuncs.add(m[1]);
const definedFuncs = new Set();
const funcRe = /function ([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
while ((m = funcRe.exec(c)) !== null) definedFuncs.add(m[1]);
const missingFuncs = [...onclickFuncs].filter(f => !definedFuncs.has(f) && !['window','document','confirm'].includes(f));
if (missingFuncs.length) {
  console.log('\nMISSING onclick functions (' + missingFuncs.length + '):');
  missingFuncs.forEach(f => console.log('  ' + f));
} else {
  console.log('All onclick functions are defined.');
}

// 3. Check for unclosed script/style tags
const scriptOpens = (c.match(/<script/g) || []).length;
const scriptCloses = (c.match(/<\/script>/g) || []).length;
const styleOpens = (c.match(/<style/g) || []).length;
const styleCloses = (c.match(/<\/style>/g) || []).length;
console.log('\nScript tags: ' + scriptOpens + ' opens, ' + scriptCloses + ' closes ' + (scriptOpens === scriptCloses ? 'OK' : 'MISMATCH!'));
console.log('Style tags:  ' + styleOpens + ' opens, ' + styleCloses + ' closes ' + (styleOpens === styleCloses ? 'OK' : 'MISMATCH!'));

// 4. Check for fetch calls without try/catch (basic check)
let fetchWithoutCatch = 0;
lines.forEach((l, i) => {
  if (l.includes('await fetch(')) {
    // look nearby for catch
    const block = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 20)).join('\n');
    if (!block.includes('catch')) fetchWithoutCatch++;
  }
});
console.log('\nFetch calls without nearby catch: ' + fetchWithoutCatch + (fetchWithoutCatch > 0 ? ' (check these)' : ' OK'));

// 5. Check for important functions referenced in pagination
const paginationFuncs = ['setMenuPage', 'setMenuPageSize', 'setRecipesPage', 'setRecipesPageSize', 'setStockPage', 'setStockPageSize', 'setStockHistoryPage', 'setStockHistoryPageSize', 'renderPagination'];
paginationFuncs.forEach(f => {
  console.log('  ' + f + ': ' + (definedFuncs.has(f) ? 'OK' : 'MISSING!'));
});

// 6. Check stock-history loadStockHistory fetch URL
const histFetch = lines.find(l => l.includes('/api/admin/stock-history'));
if (histFetch) console.log('\nstock-history fetch URL: ' + histFetch.trim());

// 7. Check viewport meta 
const hasViewport = c.includes('viewport');
console.log('\nViewport meta: ' + (hasViewport ? 'OK' : 'MISSING!'));

// 8. Check for console.log leaks (not harmful, just info)
const consoleLogs = lines.filter(l => l.includes('console.log') && !l.includes('//'));
console.log('console.log statements: ' + consoleLogs.length + ' (consider removing before production)');

console.log('\n=== AUDIT COMPLETE ===');
