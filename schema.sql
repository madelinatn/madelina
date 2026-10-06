CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  fr TEXT NOT NULL,
  en TEXT,
  is_list INTEGER DEFAULT 0,
  order_idx INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  price REAL DEFAULT 0,
  image_url TEXT,
  order_idx INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  allowed_categories TEXT DEFAULT '*',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recipe_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  order_idx INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  description TEXT DEFAULT '',
  base_description TEXT DEFAULT '',
  base_type TEXT DEFAULT 'dimension',
  base_dim1 REAL DEFAULT 20,
  base_dim2 REAL DEFAULT 20,
  base_portions REAL DEFAULT 6,
  base_unit TEXT DEFAULT 'cm',
  parts TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES recipe_categories(id)
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  order_idx INTEGER DEFAULT 0,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stock_ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',
  stock_qty REAL DEFAULT 0,
  price_per_unit REAL DEFAULT 0,
  category TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stock_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  order_idx INTEGER DEFAULT 0
);
