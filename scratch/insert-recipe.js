import { execSync } from 'child_process';
import fs from 'fs';

const recipeId = 'rec_tartelettes_pistache_fleur_oranger';
const recipeName = 'Tartelettes Pistache Fleur d’oranger';
const categoryId = 'cat_patisserie';
const baseDesc = '12 tartelettes — Ø8 cm';
const baseType = 'portion';
const baseDim1 = 8;
const baseDim2 = 0;
const basePortions = 12;
const baseUnit = 'portion';

const parts = [
  {
    name: 'Pâte sucrée',
    ingredients: [
      { name: 'Beurre doux', quantity: 150, unit: 'g' },
      { name: 'Sucre glace', quantity: 90, unit: 'g' },
      { name: 'Poudre d’amande', quantity: 35, unit: 'g' },
      { name: 'Œuf', quantity: 55, unit: 'g' },
      { name: 'Farine T55', quantity: 250, unit: 'g' },
      { name: 'Sel', quantity: 2, unit: 'g' }
    ],
    method: '1. Crémer beurre + sucre glace sans incorporer trop d’air.\n2. Ajouter poudre d’amande puis œuf.\n3. Ajouter farine + sel juste jusqu’à homogénéisation.\n4. Filmer et laisser reposer au froid au moins 2 h.\n5. Abaisser à 2,5–3 mm.\n6. Foncer les 12 cercles de 8 cm.\n7. Cuire à blanc à 160–165°C, environ 18–22 min.\n8. Décercler et laisser refroidir.'
  },
  {
    name: 'Praliné pistache',
    ingredients: [
      { name: 'Pistaches émondées', quantity: 150, unit: 'g' },
      { name: 'Sucre', quantity: 90, unit: 'g' },
      { name: 'Fleur de sel', quantity: 1, unit: 'g' },
      { name: 'Huile de pépins de raisin', quantity: 12, unit: 'g' }
    ],
    method: '1. Torréfier les pistaches à 150°C pendant 10–12 min.\n2. Faire un caramel à sec avec le sucre, verser sur les pistaches, laisser complètement refroidir puis mixer très finement avec la fleur de sel.\n3. Ajouter éventuellement un peu d’huile pour obtenir un praliné souple mais pas liquide.'
  },
  {
    name: 'Ganache pistache',
    ingredients: [
      { name: 'Chocolat blanc', quantity: 180, unit: 'g' },
      { name: 'Crème liquide 35 %', quantity: 100, unit: 'g' },
      { name: 'Pâte de pistache 100 %', quantity: 100, unit: 'g' },
      { name: 'Beurre', quantity: 15, unit: 'g' },
      { name: 'Fleur de sel', quantity: 1, unit: 'g' }
    ],
    method: '1. Chauffer la crème.\n2. Verser sur le chocolat blanc.\n3. Émulsionner au mixeur plongeant.\n4. Ajouter pâte de pistache + beurre + sel.\n5. Mixer sans incorporer d’air.\n6. Filmer au contact.\n7. Réserver au froid.'
  },
  {
    name: 'Mousse légère fleur d’oranger',
    ingredients: [
      { name: 'Crème liquide 35 %', quantity: 300, unit: 'g' },
      { name: 'Mascarpone', quantity: 100, unit: 'g' },
      { name: 'Chocolat blanc', quantity: 100, unit: 'g' },
      { name: 'Crème liquide chaude', quantity: 80, unit: 'g' },
      { name: 'Gélatine', quantity: 4, unit: 'g' },
      { name: 'Eau pour hydratation', quantity: 20, unit: 'g' },
      { name: 'Eau de fleur d’oranger', quantity: 18, unit: 'g' },
      { name: 'Sucre glace', quantity: 15, unit: 'g' }
    ],
    method: '1. Hydrater la gélatine dans 20 g d\'eau froide.\n2. Chauffer 80 g de crème.\n3. Ajouter la gélatine essorée.\n4. Verser sur le chocolat blanc et émulsionner.\n5. Ajouter l\'eau de fleur d’oranger.\n6. Ajouter le mascarpone.\n7. Ajouter les 220 g de crème liquide froide restants.\n8. Mixer au mixeur plongeant sans incorporer d\'air.\n9. Filmer au contact et laisser au réfrigérateur minimum 6 h (idéalement une nuit).\n10. Monter au batteur comme une chantilly souple.'
  }
];

const combinedDescription = parts.map((p, idx) => `Partie ${idx + 1} : ${p.name}\n${p.method}`).join('\n\n');
const partsJson = JSON.stringify(parts);

// Flatten ingredients for recipe_ingredients table
const allIngredients = parts.flatMap((p, pIdx) =>
  p.ingredients.map((ing, iIdx) => ({
    id: `ing_tartelette_${pIdx}_${iIdx}`,
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
    order_idx: pIdx * 1000 + iIdx + 1
  }))
);

// Escape SQL strings
function esc(str) {
  return (str || '').replace(/'/g, "''");
}

let sql = `
DELETE FROM recipe_ingredients WHERE recipe_id = '${recipeId}';
DELETE FROM recipes WHERE id = '${recipeId}';

INSERT INTO recipes (id, name, category_id, description, base_description, base_type, base_dim1, base_dim2, base_portions, base_unit, parts)
VALUES (
  '${recipeId}',
  '${esc(recipeName)}',
  '${categoryId}',
  '${esc(combinedDescription)}',
  '${esc(baseDesc)}',
  '${baseType}',
  ${baseDim1},
  ${baseDim2},
  ${basePortions},
  '${baseUnit}',
  '${esc(partsJson)}'
);
`;

allIngredients.forEach(ing => {
  sql += `INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('${ing.id}', '${recipeId}', '${esc(ing.name)}', ${ing.quantity}, '${ing.unit}', ${ing.order_idx});\n`;
});

fs.writeFileSync('scratch/seed_tartelettes.sql', sql, 'utf8');
console.log('Generated SQL file with size:', sql.length);

const out = execSync('npx.cmd wrangler d1 execute madelina-db --remote --file=scratch/seed_tartelettes.sql', { encoding: 'utf8', shell: true });
console.log('Wrangler execution result:', out);
