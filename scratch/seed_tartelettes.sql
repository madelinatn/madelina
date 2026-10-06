
DELETE FROM recipe_ingredients WHERE recipe_id = 'rec_tartelettes_pistache_fleur_oranger';
DELETE FROM recipes WHERE id = 'rec_tartelettes_pistache_fleur_oranger';

INSERT INTO recipes (id, name, category_id, description, base_description, base_type, base_dim1, base_dim2, base_portions, base_unit, parts)
VALUES (
  'rec_tartelettes_pistache_fleur_oranger',
  'Tartelettes Pistache Fleur d’oranger',
  'cat_patisserie',
  'Partie 1 : Pâte sucrée
1. Crémer beurre + sucre glace sans incorporer trop d’air.
2. Ajouter poudre d’amande puis œuf.
3. Ajouter farine + sel juste jusqu’à homogénéisation.
4. Filmer et laisser reposer au froid au moins 2 h.
5. Abaisser à 2,5–3 mm.
6. Foncer les 12 cercles de 8 cm.
7. Cuire à blanc à 160–165°C, environ 18–22 min.
8. Décercler et laisser refroidir.

Partie 2 : Praliné pistache
1. Torréfier les pistaches à 150°C pendant 10–12 min.
2. Faire un caramel à sec avec le sucre, verser sur les pistaches, laisser complètement refroidir puis mixer très finement avec la fleur de sel.
3. Ajouter éventuellement un peu d’huile pour obtenir un praliné souple mais pas liquide.

Partie 3 : Ganache pistache
1. Chauffer la crème.
2. Verser sur le chocolat blanc.
3. Émulsionner au mixeur plongeant.
4. Ajouter pâte de pistache + beurre + sel.
5. Mixer sans incorporer d’air.
6. Filmer au contact.
7. Réserver au froid.

Partie 4 : Mousse légère fleur d’oranger
1. Hydrater la gélatine dans 20 g d''eau froide.
2. Chauffer 80 g de crème.
3. Ajouter la gélatine essorée.
4. Verser sur le chocolat blanc et émulsionner.
5. Ajouter l''eau de fleur d’oranger.
6. Ajouter le mascarpone.
7. Ajouter les 220 g de crème liquide froide restants.
8. Mixer au mixeur plongeant sans incorporer d''air.
9. Filmer au contact et laisser au réfrigérateur minimum 6 h (idéalement une nuit).
10. Monter au batteur comme une chantilly souple.',
  '12 tartelettes — Ø8 cm',
  'portion',
  8,
  0,
  12,
  'portion',
  '[{"name":"Pâte sucrée","ingredients":[{"name":"Beurre doux","quantity":150,"unit":"g"},{"name":"Sucre glace","quantity":90,"unit":"g"},{"name":"Poudre d’amande","quantity":35,"unit":"g"},{"name":"Œuf","quantity":55,"unit":"g"},{"name":"Farine T55","quantity":250,"unit":"g"},{"name":"Sel","quantity":2,"unit":"g"}],"method":"1. Crémer beurre + sucre glace sans incorporer trop d’air.\n2. Ajouter poudre d’amande puis œuf.\n3. Ajouter farine + sel juste jusqu’à homogénéisation.\n4. Filmer et laisser reposer au froid au moins 2 h.\n5. Abaisser à 2,5–3 mm.\n6. Foncer les 12 cercles de 8 cm.\n7. Cuire à blanc à 160–165°C, environ 18–22 min.\n8. Décercler et laisser refroidir."},{"name":"Praliné pistache","ingredients":[{"name":"Pistaches émondées","quantity":150,"unit":"g"},{"name":"Sucre","quantity":90,"unit":"g"},{"name":"Fleur de sel","quantity":1,"unit":"g"},{"name":"Huile de pépins de raisin","quantity":12,"unit":"g"}],"method":"1. Torréfier les pistaches à 150°C pendant 10–12 min.\n2. Faire un caramel à sec avec le sucre, verser sur les pistaches, laisser complètement refroidir puis mixer très finement avec la fleur de sel.\n3. Ajouter éventuellement un peu d’huile pour obtenir un praliné souple mais pas liquide."},{"name":"Ganache pistache","ingredients":[{"name":"Chocolat blanc","quantity":180,"unit":"g"},{"name":"Crème liquide 35 %","quantity":100,"unit":"g"},{"name":"Pâte de pistache 100 %","quantity":100,"unit":"g"},{"name":"Beurre","quantity":15,"unit":"g"},{"name":"Fleur de sel","quantity":1,"unit":"g"}],"method":"1. Chauffer la crème.\n2. Verser sur le chocolat blanc.\n3. Émulsionner au mixeur plongeant.\n4. Ajouter pâte de pistache + beurre + sel.\n5. Mixer sans incorporer d’air.\n6. Filmer au contact.\n7. Réserver au froid."},{"name":"Mousse légère fleur d’oranger","ingredients":[{"name":"Crème liquide 35 %","quantity":300,"unit":"g"},{"name":"Mascarpone","quantity":100,"unit":"g"},{"name":"Chocolat blanc","quantity":100,"unit":"g"},{"name":"Crème liquide chaude","quantity":80,"unit":"g"},{"name":"Gélatine","quantity":4,"unit":"g"},{"name":"Eau pour hydratation","quantity":20,"unit":"g"},{"name":"Eau de fleur d’oranger","quantity":18,"unit":"g"},{"name":"Sucre glace","quantity":15,"unit":"g"}],"method":"1. Hydrater la gélatine dans 20 g d''eau froide.\n2. Chauffer 80 g de crème.\n3. Ajouter la gélatine essorée.\n4. Verser sur le chocolat blanc et émulsionner.\n5. Ajouter l''eau de fleur d’oranger.\n6. Ajouter le mascarpone.\n7. Ajouter les 220 g de crème liquide froide restants.\n8. Mixer au mixeur plongeant sans incorporer d''air.\n9. Filmer au contact et laisser au réfrigérateur minimum 6 h (idéalement une nuit).\n10. Monter au batteur comme une chantilly souple."}]'
);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_0_0', 'rec_tartelettes_pistache_fleur_oranger', 'Beurre doux', 150, 'g', 1);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_0_1', 'rec_tartelettes_pistache_fleur_oranger', 'Sucre glace', 90, 'g', 2);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_0_2', 'rec_tartelettes_pistache_fleur_oranger', 'Poudre d’amande', 35, 'g', 3);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_0_3', 'rec_tartelettes_pistache_fleur_oranger', 'Œuf', 55, 'g', 4);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_0_4', 'rec_tartelettes_pistache_fleur_oranger', 'Farine T55', 250, 'g', 5);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_0_5', 'rec_tartelettes_pistache_fleur_oranger', 'Sel', 2, 'g', 6);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_1_0', 'rec_tartelettes_pistache_fleur_oranger', 'Pistaches émondées', 150, 'g', 1001);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_1_1', 'rec_tartelettes_pistache_fleur_oranger', 'Sucre', 90, 'g', 1002);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_1_2', 'rec_tartelettes_pistache_fleur_oranger', 'Fleur de sel', 1, 'g', 1003);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_1_3', 'rec_tartelettes_pistache_fleur_oranger', 'Huile de pépins de raisin', 12, 'g', 1004);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_2_0', 'rec_tartelettes_pistache_fleur_oranger', 'Chocolat blanc', 180, 'g', 2001);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_2_1', 'rec_tartelettes_pistache_fleur_oranger', 'Crème liquide 35 %', 100, 'g', 2002);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_2_2', 'rec_tartelettes_pistache_fleur_oranger', 'Pâte de pistache 100 %', 100, 'g', 2003);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_2_3', 'rec_tartelettes_pistache_fleur_oranger', 'Beurre', 15, 'g', 2004);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_2_4', 'rec_tartelettes_pistache_fleur_oranger', 'Fleur de sel', 1, 'g', 2005);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_3_0', 'rec_tartelettes_pistache_fleur_oranger', 'Crème liquide 35 %', 300, 'g', 3001);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_3_1', 'rec_tartelettes_pistache_fleur_oranger', 'Mascarpone', 100, 'g', 3002);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_3_2', 'rec_tartelettes_pistache_fleur_oranger', 'Chocolat blanc', 100, 'g', 3003);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_3_3', 'rec_tartelettes_pistache_fleur_oranger', 'Crème liquide chaude', 80, 'g', 3004);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_3_4', 'rec_tartelettes_pistache_fleur_oranger', 'Gélatine', 4, 'g', 3005);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_3_5', 'rec_tartelettes_pistache_fleur_oranger', 'Eau pour hydratation', 20, 'g', 3006);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_3_6', 'rec_tartelettes_pistache_fleur_oranger', 'Eau de fleur d’oranger', 18, 'g', 3007);
INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES ('ing_tartelette_3_7', 'rec_tartelettes_pistache_fleur_oranger', 'Sucre glace', 15, 'g', 3008);
