-- Database Schema for Café Yucca

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  fr TEXT NOT NULL,
  en TEXT,
  is_list INTEGER DEFAULT 0,
  order_idx INTEGER
);

CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  price REAL,
  image_url TEXT,
  order_idx INTEGER,
  is_hidden INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS franchise_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  zone TEXT NOT NULL,
  has_local INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  submitted_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS orders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  customer   TEXT NOT NULL,
  table_num  INTEGER NOT NULL,
  items      TEXT NOT NULL,   -- JSON array: [{id, title, qty, price}]
  total      REAL NOT NULL,
  status     TEXT DEFAULT 'new',  -- new | preparing | served
  created_at TEXT DEFAULT (datetime('now'))
);
