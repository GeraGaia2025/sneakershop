const express = require("express");
const cors = require("cors");
const { initDatabase } = require("./database");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = initDatabase();

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Categorias
app.get("/api/categories", (req, res) => {
  const categorias = db.prepare("SELECT * FROM categories ORDER BY name").all();
  res.json(categorias);
});

// Listar produtos com filtros
app.get("/api/products", (req, res) => {
  const { category, brand, search } = req.query;

  let sql = `
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
  `;
  const params = [];

  if (category) {
    sql += " AND c.slug = ?";
    params.push(category);
  }

  if (brand) {
    sql += " AND p.brand = ?";
    params.push(brand);
  }

  if (search) {
    sql += " AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
    const termo = "%" + search + "%";
    params.push(termo, termo, termo);
  }

  sql += " ORDER BY p.created_at DESC";

  const produtos = db.prepare(sql).all(...params);
  res.json(produtos);
});

// Buscar produto por ID
app.get("/api/products/:id", (req, res) => {
  const produto = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!produto) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  res.json(produto);
});

// Criar pedido
app.post("/api/orders", (req, res) => {
  const { customer_name, customer_email, shipping_address, items } = req.body;

  if (!customer_name || !customer_email || !shipping_address || !items || items.length === 0) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  try {
    // busca ou cria cliente
    let cliente = db.prepare("SELECT id FROM customers WHERE email = ?").get(customer_email);

    if (!cliente) {
      const resultado = db.prepare(
        "INSERT INTO customers (name, email, password_hash) VALUES (?, ?, ?)"
      ).run(customer_name, customer_email, "temp_hash");
      cliente = { id: resultado.lastInsertRowid };
    }

    let total = 0;
    const itensValidados = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const produto = db.prepare(
        "SELECT * FROM products WHERE id = ? AND is_active = 1"
      ).get(item.product_id);

      if (!produto) {
        return res.status(400).json({ error: "Produto " + item.product_id + " não encontrado" });
      }

      if (produto.stock < item.quantity) {
        return res.status(400).json({ error: "Estoque insuficiente para " + produto.name });
      }

      const subtotal = produto.price * item.quantity;
      total += subtotal;

      itensValidados.push({
        product_id: produto.id,
        size: item.size,
        quantity: item.quantity,
        unit_price: produto.price,
        subtotal: subtotal,
      });
    }

    // cria o pedido
    const pedido = db.prepare(
      "INSERT INTO orders (customer_id, total, shipping_address) VALUES (?, ?, ?)"
    ).run(cliente.id, total, shipping_address);

    const pedidoId = pedido.lastInsertRowid;

    // insere itens e atualiza estoque
    for (let i = 0; i < itensValidados.length; i++) {
      const item = itensValidados[i];

      db.prepare(
        "INSERT INTO order_items (order_id, product_id, size, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(pedidoId, item.product_id, item.size, item.quantity, item.unit_price, item.subtotal);

      db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(item.quantity, item.product_id);
    }

    res.status(201).json({
      id: pedidoId,
      total: total,
      status: "pending",
      items: itensValidados,
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(400).json({ error: error.message });
  }
});

// Buscar pedido por ID
app.get("/api/orders/:id", (req, res) => {
  const pedido = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);

  if (!pedido) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }

  const itens = db.prepare(`
    SELECT oi.*, p.name as product_name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).all(pedido.id);

  res.json({ ...pedido, items: itens });
});

app.listen(PORT, () => {
  console.log("SneakerShop API rodando em http://localhost:" + PORT);
});
