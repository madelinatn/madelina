-- Add curly apostrophe aliases
INSERT OR REPLACE INTO stock_ingredients (id, name, unit, stock_qty, price_per_unit, category) VALUES
('stk_poudre_amande_alt', 'Poudre d’amande', 'g', 1500, 0.035, 'Fruits secs & Graines'),
('stk_fleur_oranger_alt', 'Eau de fleur d’oranger', 'ml', 1000, 0.018, 'Arômes & Extraits'),
-- Essential pastry stock items with realistic prices
('stk_cacao_poudre', 'Cacao en poudre', 'g', 1000, 0.028, 'Chocolats & Cacaos'),
('stk_extrait_vanille', 'Extrait de vanille', 'ml', 250, 0.150, 'Arômes & Extraits'),
('stk_maizena', 'Maïzena (Amidon de maïs)', 'g', 2000, 0.004, 'Farines & Fécules'),
('stk_pectine_nh', 'Pectine NH', 'g', 250, 0.090, 'Gélifiants & Additifs'),
('stk_sirop_glucose', 'Sirop de glucose', 'g', 1500, 0.012, 'Épicerie sucrée'),
('stk_noisettes', 'Noisettes entières', 'g', 1000, 0.045, 'Fruits secs & Graines'),
('stk_poudre_noisette', 'Poudre de noisette', 'g', 1000, 0.038, 'Fruits secs & Graines'),
('stk_cafe_soluble', 'Café soluble', 'g', 500, 0.040, 'Épicerie de base'),
('stk_puree_framboise', 'Purée de framboise', 'g', 1000, 0.026, 'Fruits & Purées'),
('stk_puree_mangue', 'Purée de mangue', 'g', 1000, 0.022, 'Fruits & Purées'),
('stk_puree_passion', 'Purée de fruits de la passion', 'g', 1000, 0.028, 'Fruits & Purées'),
('stk_levure_chimique', 'Levure chimique', 'g', 500, 0.012, 'Épicerie de base'),
('stk_jus_citron', 'Jus de citron', 'ml', 1000, 0.005, 'Fruits & Purées'),
('stk_zeste_citron', 'Zeste de citron', 'g', 200, 0.015, 'Fruits & Purées');
