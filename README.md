# SneakerShop - E-commerce de Tênis Esportivos

Projeto Integrador do 5º semestre TADS/TSI - SENAC 2026.

MVP de um e-commerce de tênis esportivos com catálogo de produtos, carrinho de compras, finalização de pedidos e controle de estoque.

## Sobre o Projeto

O SneakerShop é um e-commerce simplificado focado em tênis esportivos. O usuário pode navegar pelo catálogo, filtrar por categoria ou marca, selecionar o tamanho, adicionar ao carrinho e finalizar o pedido com seus dados. O estoque é atualizado automaticamente a cada compra.

O projeto foi dividido em 4 artefatos conforme requisitos do Projeto Integrador:

| Artefato | Tecnologia | Pasta |
|----------|-----------|-------|
| Modelo Físico do Banco | PostgreSQL (DDL) / SQLite (runtime) | `database/` |
| Servidor Backend | Express.js (Node/Bun) | `backend/` |
| Servidor Frontend | React + Vite | `frontend/` |
| Landing Page | HTML/CSS (GitHub Pages) | `landing-page/` |

## Pré-requisitos

- [Bun](https://bun.sh/) 1.0+ (runtime JavaScript, substitui o Node.js)

Para instalar o Bun:
```
curl -fsSL https://bun.sh/install | bash
```

## Como Rodar o Projeto

### 1. Backend (API)

```bash
cd backend
bun install
bun start
```

O servidor da API inicia em **http://localhost:3001**.

Para rodar em modo de desenvolvimento (reinicia ao salvar):
```bash
bun dev
```

### 2. Frontend (React)

Em outro terminal:

```bash
cd frontend
bun install
bun dev
```

O frontend inicia em **http://localhost:5173**.

As chamadas para `/api` são redirecionadas automaticamente para o backend (porta 3001) pelo Vite.

### 3. Testando a integração

Com o backend rodando, execute os testes automatizados:

```bash
cd backend
bun test-integration.js
```

Os testes verificam todos os endpoints da API: listar categorias, listar/filtrar/buscar produtos, criar pedido, consultar pedido, validação de erros e controle de estoque.

### 4. Landing Page

A landing page é um arquivo HTML estático em `landing-page/index.html`. Pode ser aberto direto no navegador ou publicado no GitHub Pages (veja abaixo).

## Publicando a Landing Page no GitHub Pages

1. Crie um repositório no GitHub (ex: `sneakershop`)

2. Suba o projeto todo para o repositório:
```bash
git init
git add .
git commit -m "projeto integrador sneakershop"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/sneakershop.git
git push -u origin main
```

3. No GitHub, vá em **Settings > Pages**

4. Em **Source**, selecione **Deploy from a branch**

5. Selecione a branch `main` e a pasta `/ (root)`

6. Clique em **Save**

7. A landing page vai ficar disponível em:
```
https://SEU-USUARIO.github.io/sneakershop/landing-page/
```

> **Dica:** se quiser que a landing page fique na raiz (sem `/landing-page/`), mova o `index.html` e as imagens para a raiz do repositório, ou altere a pasta no GitHub Pages para `/landing-page`.

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Verifica se a API está no ar |
| GET | `/api/categories` | Lista as 4 categorias |
| GET | `/api/products` | Lista todos os produtos |
| GET | `/api/products/:id` | Busca um produto pelo ID |
| POST | `/api/orders` | Cria um novo pedido |
| GET | `/api/orders/:id` | Busca um pedido pelo ID |

### Filtros de produtos

- Por categoria: `/api/products?category=corrida`
- Por marca: `/api/products?brand=Nike`
- Por texto: `/api/products?search=ultraboost`

### Exemplo de criação de pedido

```json
POST /api/orders

{
  "customer_name": "João Silva",
  "customer_email": "joao@email.com",
  "shipping_address": "Rua das Flores, 123 - São Paulo/SP",
  "items": [
    { "product_id": 1, "size": "42", "quantity": 1 },
    { "product_id": 4, "size": "40", "quantity": 2 }
  ]
}
```

## Banco de Dados

O modelo físico (DDL) está em `database/schema.sql` e foi feito para PostgreSQL. No backend, usamos SQLite para facilitar a execução local (não precisa instalar banco separado).

### Tabelas

- **categories** - Categorias: Corrida, Basquete, Casual, Futebol
- **products** - Catálogo de tênis com preço, marca, tamanhos e estoque
- **customers** - Clientes (criados automaticamente no checkout)
- **orders** - Pedidos com status e total
- **order_items** - Itens de cada pedido (produto, tamanho, quantidade, preço)

### Relacionamentos

```
categories  1 ──── N  products
customers   1 ──── N  orders
orders      1 ──── N  order_items
products    1 ──── N  order_items
```

O banco é criado automaticamente na primeira execução do backend, já com 4 categorias e 8 produtos de exemplo.

## Estrutura de Pastas

```
senac/
├── README.md
├── database/
│   └── schema.sql              # modelo físico (PostgreSQL)
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── database.js         # conexão e seed do SQLite
│   │   └── server.js           # rotas da API REST
│   └── test-integration.js     # testes automatizados
├── frontend/
│   ├── package.json
│   ├── vite.config.js          # config do Vite (proxy para API)
│   ├── index.html
│   └── src/
│       ├── main.jsx            # ponto de entrada do React
│       ├── App.jsx             # componente principal (toda a loja)
│       └── style.css           # estilos da aplicação
└── landing-page/
    ├── index.html              # página de apresentação
    ├── tela-catalogo.png       # screenshot do catálogo
    ├── tela-carrinho.png       # screenshot do carrinho
    └── tela-checkout.png       # screenshot do checkout
```

## Gravando o Vídeo de Demonstração

Para o vídeo de 1 minuto:

1. Abra o backend (`bun start`) e o frontend (`bun dev`)
2. Grave a tela mostrando:
   - O catálogo de produtos com os filtros funcionando
   - Seleção de tamanho e adição ao carrinho
   - O carrinho lateral com os itens
   - O formulário de checkout preenchido
   - A confirmação do pedido
3. Pode usar o QuickTime (Mac), OBS Studio ou qualquer gravador de tela

## Equipe

| Nome | Função |
|------|--------|
| Aluno 1 | Frontend (React) |
| Aluno 2 | Backend (Express/API) |
| Aluno 3 | Banco de Dados (SQL) |

---

Projeto acadêmico - SENAC 2026
