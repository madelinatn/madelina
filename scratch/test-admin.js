import fs from 'fs';
const content = fs.readFileSync('public/admin/index.html', 'utf8');

console.log('App header exists:', content.includes('<header>'));
console.log('Main tag exists:', content.includes('<main>'));
console.log('Table wrap exists:', content.includes('table-wrap'));
console.log('Modal overlay exists:', content.includes('id="modal-overlay"'));
console.log('Category overlay exists:', content.includes('id="category-overlay"'));
console.log('Toast exists:', content.includes('id="toast"'));
