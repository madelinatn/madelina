import fs from 'fs';
const html = fs.readFileSync('public/admin/index.html', 'utf8');
const lines = html.split('\n');

function findLines(str) {
  const res = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(str)) res.push({ line: i + 1, content: lines[i].trim().substring(0, 120) });
  }
  return res;
}

console.log('=== deductCheckedFromStock ===');
console.log(findLines('deductCheckedFromStock'));

console.log('=== currentUser / loggedUser / isAdmin ===');
console.log(findLines('currentUser').slice(0,8));
console.log(findLines('isAdmin').slice(0,5));
console.log(findLines("'haifa'").slice(0,5));

console.log('=== cook-deduct-btn ===');
console.log(findLines('cook-deduct-btn').slice(0,5));

console.log('=== renderCurrentCookPart ===');
console.log(findLines('renderCurrentCookPart').slice(0,5));

console.log('=== cook-body / cook-footer CSS ===');
console.log(findLines('.cook-body').slice(0,5));
console.log(findLines('.cook-footer').slice(0,5));

console.log('=== stock API ===');
console.log(findLines('/api/admin/stock').slice(0,8));

console.log('=== recipe cost / price ===');
console.log(findLines('price_per_unit').slice(0,8));

console.log('=== openCookMode line ===');
console.log(findLines('function openCookMode'));
