import { execSync } from 'child_process';

const out = execSync('npx.cmd wrangler d1 execute madelina-db --remote --json --command "SELECT id, name, category_id, parts FROM recipes WHERE id=\'rec_tartelettes_pistache_fleur_oranger\';"', { encoding: 'utf8', shell: true });
const parsed = JSON.parse(out);
const rec = parsed[0].results[0];
console.log('Recipe in DB:', rec.name);
const parts = JSON.parse(rec.parts);
console.log('Parts count:', parts.length);
parts.forEach((p, i) => console.log('Part ' + (i+1) + ':', p.name, 'with', p.ingredients.length, 'ingredients'));
