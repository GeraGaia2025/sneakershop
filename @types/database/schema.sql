-- SneakerShop - Modelo Fisico (PostgreSQL)
-- Projeto Integrador - SENAC 2026

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    brand VARCHAR(100) NOT NULL,
    sizes VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    size VARCHAR(5) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- indices
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- dados iniciais
INSERT INTO categories (name, slug) VALUES
    ('Corrida', 'corrida'),
    ('Basquete', 'basquete'),
    ('Casual', 'casual'),
    ('Futebol', 'futebol');

INSERT INTO products (name, description, price, image_url, category_id, brand, sizes, stock) VALUES
    ('Air Max Runner Pro', 'Tênis de corrida com amortecimento a ar para máximo conforto.', 599.90, 'https://placehold.co/400x400/111/fff?text=Air+Max+Runner', 1, 'Nike', '38,39,40,41,42,43', 25),
    ('UltraBoost 24', 'Tecnologia Boost para retorno de energia em cada passada.', 899.90, 'https://placehold.co/400x400/111/fff?text=UltraBoost+24', 1, 'Adidas', '39,40,41,42,43,44', 18),
    ('Slam Dunk Elite', 'Tênis de basquete com suporte de tornozelo e tração superior.', 749.90, 'https://placehold.co/400x400/111/fff?text=Slam+Dunk+Elite', 2, 'Nike', '40,41,42,43,44,45', 12),
    ('Court Vision Mid', 'Estilo retrô com conforto moderno para o dia a dia.', 399.90, 'https://placehold.co/400x400/111/fff?text=Court+Vision+Mid', 3, 'Nike', '38,39,40,41,42,43', 30),
    ('Gel Resolution 9', 'Performance e estabilidade para todos os tipos de pisada.', 649.90, 'https://placehold.co/400x400/111/fff?text=Gel+Resolution+9', 1, 'Asics', '39,40,41,42,43', 15),
    ('Predator Edge', 'Chuteira society com controle máximo da bola.', 549.90, 'https://placehold.co/400x400/111/fff?text=Predator+Edge', 4, 'Adidas', '38,39,40,41,42,43,44', 20),
    ('Classic Leather', 'O clássico que nunca sai de moda. Couro premium.', 349.90, 'https://placehold.co/400x400/111/fff?text=Classic+Leather', 3, 'Reebok', '38,39,40,41,42,43', 22),
    ('Mercurial Vapor', 'Velocidade máxima nos gramados. Chuteira de campo.', 799.90, 'https://placehold.co/400x400/111/fff?text=Mercurial+Vapor', 4, 'Nike', '39,40,41,42,43,44', 10);
