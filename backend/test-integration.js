// Teste de integracao - SneakerShop
// Testa todos os endpoints da API para verificar que tudo funciona
// Rodar: bun test-integration.js (com o backend rodando)

const BASE = "http://localhost:3001/api";
let passou = 0;
let falhou = 0;

function verificar(condicao, mensagem) {
  if (condicao) {
    console.log("  OK - " + mensagem);
    passou++;
  } else {
    console.log("  FALHOU - " + mensagem);
    falhou++;
  }
}

async function fazerRequisicao(url, opcoes) {
  const res = await fetch(url, opcoes);
  const dados = await res.json();
  return { status: res.status, dados: dados };
}

async function rodarTestes() {
  console.log("\nSneakerShop - Teste de Integracao\n");
  console.log("=".repeat(50));

  // 1. Health Check
  console.log("\n1. Health Check");
  const health = await fazerRequisicao(BASE + "/health");
  verificar(health.status === 200, "GET /api/health retorna 200");
  verificar(health.dados.status === "ok", "Status ok");

  // 2. Categorias
  console.log("\n2. Categorias");
  const cats = await fazerRequisicao(BASE + "/categories");
  verificar(cats.status === 200, "GET /api/categories retorna 200");
  verificar(cats.dados.length === 4, "4 categorias cadastradas");

  // 3. Produtos
  console.log("\n3. Produtos");
  const prods = await fazerRequisicao(BASE + "/products");
  verificar(prods.status === 200, "GET /api/products retorna 200");
  verificar(prods.dados.length === 8, "8 produtos cadastrados");

  // Verifica campos que o frontend usa
  const p = prods.dados[0];
  verificar(p.id !== undefined, "Produto tem campo id");
  verificar(typeof p.name === "string", "Produto tem campo name");
  verificar(typeof p.brand === "string", "Produto tem campo brand");
  verificar(typeof p.price === "number", "Produto tem campo price");
  verificar(typeof p.image_url === "string", "Produto tem campo image_url");
  verificar(typeof p.stock === "number", "Produto tem campo stock");
  verificar(typeof p.sizes === "string", "Produto tem campo sizes");
  verificar(typeof p.category_name === "string", "Produto tem campo category_name");

  // 4. Filtros
  console.log("\n4. Filtros de produtos");
  const porCategoria = await fazerRequisicao(BASE + "/products?category=corrida");
  verificar(porCategoria.dados.length > 0, "Filtro por categoria retorna resultados");

  const porMarca = await fazerRequisicao(BASE + "/products?brand=Nike");
  verificar(porMarca.dados.length > 0, "Filtro por marca retorna resultados");

  const porBusca = await fazerRequisicao(BASE + "/products?search=UltraBoost");
  verificar(porBusca.dados.length === 1, "Busca por texto retorna 1 resultado");

  // 5. Produto por ID
  console.log("\n5. Produto por ID");
  const prod1 = await fazerRequisicao(BASE + "/products/1");
  verificar(prod1.status === 200, "GET /api/products/1 retorna 200");

  const prod404 = await fazerRequisicao(BASE + "/products/9999");
  verificar(prod404.status === 404, "Produto inexistente retorna 404");

  // 6. Criar pedido
  console.log("\n6. Criar pedido");
  const estoqueAntes = (await fazerRequisicao(BASE + "/products/1")).dados.stock;

  const pedido = await fazerRequisicao(BASE + "/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: "Teste",
      customer_email: "teste@email.com",
      shipping_address: "Rua Teste, 123",
      items: [
        { product_id: 1, size: "42", quantity: 2 },
        { product_id: 4, size: "40", quantity: 1 },
      ],
    }),
  });

  verificar(pedido.status === 201, "POST /api/orders retorna 201");
  verificar(typeof pedido.dados.id === "number", "Pedido tem id");
  verificar(pedido.dados.status === "pending", "Status do pedido e pending");
  verificar(pedido.dados.items.length === 2, "Pedido tem 2 itens");

  // Verifica se o estoque diminuiu
  const estoqueDepois = (await fazerRequisicao(BASE + "/products/1")).dados.stock;
  verificar(estoqueDepois === estoqueAntes - 2, "Estoque diminuiu corretamente");

  // 7. Consultar pedido
  console.log("\n7. Consultar pedido");
  const detalhe = await fazerRequisicao(BASE + "/orders/" + pedido.dados.id);
  verificar(detalhe.status === 200, "GET /api/orders/:id retorna 200");
  verificar(detalhe.dados.items.length === 2, "Pedido retorna itens");

  // 8. Erros
  console.log("\n8. Validacoes de erro");
  const semDados = await fazerRequisicao(BASE + "/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  verificar(semDados.status === 400, "Pedido sem dados retorna 400");

  const semEstoque = await fazerRequisicao(BASE + "/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: "Teste",
      customer_email: "erro@email.com",
      shipping_address: "Rua X",
      items: [{ product_id: 1, size: "42", quantity: 99999 }],
    }),
  });
  verificar(semEstoque.status === 400, "Pedido sem estoque retorna 400");

  // Resultado
  console.log("\n" + "=".repeat(50));
  console.log("\nResultado: " + passou + " passaram, " + falhou + " falharam\n");

  if (falhou > 0) {
    console.log("Alguns testes falharam!\n");
    process.exit(1);
  } else {
    console.log("Todos os testes passaram!\n");
    process.exit(0);
  }
}

rodarTestes().catch(function (erro) {
  console.error("\nErro: " + erro.message);
  console.error("Verifique se o backend esta rodando em http://localhost:3001\n");
  process.exit(1);
});
