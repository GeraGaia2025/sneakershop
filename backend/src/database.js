const { Database } = require("bun:sqlite");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "sneakershop.db");

function initDatabase() {
  const db = new Database(DB_PATH, { create: true });
  db.exec("PRAGMA foreign_keys = ON");

  // cria as tabelas
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category_id INTEGER NOT NULL,
      brand TEXT NOT NULL,
      sizes TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total REAL NOT NULL,
      shipping_address TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // seed - insere dados se o banco estiver vazio
  const resultado = db.prepare("SELECT COUNT(*) as total FROM categories").get();

  if (resultado.total === 0) {
    console.log("Inserindo dados iniciais...");

    const inserirCategoria = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
    inserirCategoria.run("Corrida", "corrida");
    inserirCategoria.run("Basquete", "basquete");
    inserirCategoria.run("Casual", "casual");
    inserirCategoria.run("Futebol", "futebol");

    const inserirProduto = db.prepare(
      "INSERT INTO products (name, description, price, image_url, category_id, brand, sizes, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );

    inserirProduto.run("Air Max Runner Pro", "Tênis de corrida com amortecimento a ar para máximo conforto.", 599.9, "https://placehold.co/400x400/111/fff?text=Air+Max+Runner", 1, "Nike", "38,39,40,41,42,43", 25);
    inserirProduto.run("UltraBoost 24", "Tecnologia Boost para retorno de energia em cada passada.", 899.9, "https://placehold.co/400x400/111/fff?text=UltraBoost+24", 1, "Adidas", "39,40,41,42,43,44", 18);
    inserirProduto.run("Slam Dunk Elite", "Tênis de basquete com suporte de tornozelo e tração superior.", 749.9, "https://placehold.co/400x400/111/fff?text=Slam+Dunk+Elite", 2, "Nike", "40,41,42,43,44,45", 12);
    inserirProduto.run("Court Vision Mid", "Estilo retrô com conforto moderno para o dia a dia.", 399.9, "https://placehold.co/400x400/111/fff?text=Court+Vision+Mid", 3, "Nike", "38,39,40,41,42,43", 30);
    inserirProduto.run("Gel Resolution 9", "Performance e estabilidade para todos os tipos de pisada.", 649.9, "https://placehold.co/400x400/111/fff?text=Gel+Resolution+9", 1, "Asics", "39,40,41,42,43", 15);
    inserirProduto.run("Predator Edge", "Chuteira society com controle máximo da bola.", 549.9, "https://placehold.co/400x400/111/fff?text=Predator+Edge", 4, "Adidas", "38,39,40,41,42,43,44", 20);
    inserirProduto.run("Classic Leather", "O clássico que nunca sai de moda. Couro premium.", 349.9, "https://placehold.co/400x400/111/fff?text=Classic+Leather", 3, "Reebok", "38,39,40,41,42,43", 22);
    inserirProduto.run("Mercurial Vapor", "Velocidade máxima nos gramados. Chuteira de campo.", 799.9, "https://placehold.co/400x400/111/fff?text=Mercurial+Vapor", 4, "Nike", "39,40,41,42,43,44", 10);

    console.log("Dados iniciais inseridos!");
  }

  return db;
}

module.exports = { initDatabase };
