const stock = [
  {id:'stk_oeuf',name:'Œuf',unit:'g',price_per_unit:0.007},
  {id:'stk_beurre_doux',name:'Beurre doux',unit:'g',price_per_unit:0.024},
  {id:'stk_beurre',name:'Beurre',unit:'g',price_per_unit:0.022},
  {id:'stk_sucre_glace',name:'Sucre glace',unit:'g',price_per_unit:0.004},
  {id:'stk_sucre',name:'Sucre',unit:'g',price_per_unit:0.0018},
  {id:'stk_poudre_amande',name:'Poudre d\'amande',unit:'g',price_per_unit:0.035},
  {id:'stk_oeufs_pcs',name:'Œufs',unit:'pcs',price_per_unit:0.35},
  {id:'stk_farine_t55',name:'Farine T55',unit:'g',price_per_unit:0.002},
  {id:'stk_farine',name:'Farine',unit:'g',price_per_unit:0.0018},
  {id:'stk_sel',name:'Sel',unit:'g',price_per_unit:0.001},
  {id:'stk_fleur_de_sel',name:'Fleur de sel',unit:'g',price_per_unit:0.015},
  {id:'stk_pistaches_emondees',name:'Pistaches émondées',unit:'g',price_per_unit:0.065},
  {id:'stk_pate_pistache',name:'Pâte de pistache',unit:'g',price_per_unit:0.08},
  {id:'stk_pate_pistache_100',name:'Pâte de pistache 100 %',unit:'g',price_per_unit:0.085},
  {id:'stk_huile_pepins_raisin',name:'Huile de pépins de raisin',unit:'g',price_per_unit:0.02},
  {id:'stk_chocolat_blanc',name:'Chocolat blanc',unit:'g',price_per_unit:0.032},
  {id:'stk_chocolat_noir',name:'Chocolat noir',unit:'g',price_per_unit:0.028},
  {id:'stk_creme_liquide',name:'Crème liquide',unit:'ml',price_per_unit:0.012},
  {id:'stk_creme_35',name:'Crème liquide 35%',unit:'ml',price_per_unit:0.015},
  {id:'stk_creme_35_sp',name:'Crème liquide 35 %',unit:'g',price_per_unit:0.015},
  {id:'stk_creme_chaude',name:'Crème liquide chaude',unit:'g',price_per_unit:0.012},
  {id:'stk_mascarpone',name:'Mascarpone',unit:'g',price_per_unit:0.028},
  {id:'stk_gelatine',name:'Gélatine',unit:'g',price_per_unit:0.075},
  {id:'stk_feuilles_gelatine',name:'Feuilles de gélatine',unit:'g',price_per_unit:0.075},
  {id:'stk_fleur_oranger',name:'Eau de fleur d\'oranger',unit:'ml',price_per_unit:0.018},
  {id:'stk_eau_hydratation',name:'Eau pour hydratation',unit:'g',price_per_unit:0.0001},
  {id:'stk_vanille',name:'Vanille',unit:'g',price_per_unit:0.4},
  {id:'stk_lait_entier',name:'Lait entier',unit:'ml',price_per_unit:0.0018}
];

const recipeIngs = [
  'Beurre doux', 'Sucre glace', 'Poudre d’amande', 'Œuf', 'Farine T55', 'Sel',
  'Pistaches émondées', 'Sucre', 'Fleur de sel', 'Huile de pépins de raisin',
  'Chocolat blanc', 'Crème liquide 35 %', 'Pâte de pistache 100 %', 'Beurre', 'Fleur de sel',
  'Crème liquide 35 %', 'Mascarpone', 'Chocolat blanc', 'Crème liquide chaude', 'Gélatine',
  'Eau pour hydratation', 'Eau de fleur d’oranger', 'Sucre glace',
  'Farine', 'Chocolat noir', 'Œufs'
];

function normalizeIngLookup(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findStockItemForIngredient(ingName, list = stock) {
  if (!ingName || !list || list.length === 0) return null;
  const target = normalizeIngLookup(ingName);
  if (!target) return null;

  // 1. Exact match
  let found = list.find(s => normalizeIngLookup(s.name) === target);
  if (found) return found;

  // 2. Starts with / prefix match
  found = list.find(s => {
    const sNorm = normalizeIngLookup(s.name);
    return sNorm.startsWith(target + ' ') || target.startsWith(sNorm + ' ');
  });
  if (found) return found;

  // 3. Substring match
  found = list.find(s => {
    const sNorm = normalizeIngLookup(s.name);
    return sNorm.includes(target) || target.includes(sNorm);
  });
  return found || null;
}

recipeIngs.forEach(ingName => {
  const match = findStockItemForIngredient(ingName, stock);
  console.log(ingName.padEnd(26), '=>', match ? `${match.name} (${match.price_per_unit} TND)` : '❌ MISSING');
});
