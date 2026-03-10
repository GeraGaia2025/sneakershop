import { useState, useEffect } from "react";

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [checkoutAberto, setCheckoutAberto] = useState(false);
  const [pedidoSucesso, setPedidoSucesso] = useState(null);
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState({});
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [carregando, setCarregando] = useState(true);

  // busca produtos e categorias da API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProdutos(data);
        setCarregando(false);
      });

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategorias(data));
  }, []);

  // filtro local por busca e categoria
  const produtosFiltrados = produtos.filter((produto) => {
    const textoBusca = busca.toLowerCase();
    const passouBusca =
      busca === "" ||
      produto.name.toLowerCase().includes(textoBusca) ||
      produto.brand.toLowerCase().includes(textoBusca);

    const passouCategoria =
      filtroCategoria === "" || produto.category_name === filtroCategoria;

    return passouBusca && passouCategoria;
  });

  function selecionarTamanho(produtoId, tamanho) {
    setTamanhosSelecionados({ ...tamanhosSelecionados, [produtoId]: tamanho });
  }

  function adicionarAoCarrinho(produto) {
    const tamanho = tamanhosSelecionados[produto.id];
    if (!tamanho) return;

    const itemExistente = carrinho.find(
      (item) => item.produto.id === produto.id && item.tamanho === tamanho
    );

    if (itemExistente) {
      const novoCarrinho = carrinho.map((item) => {
        if (item === itemExistente) {
          return { ...item, quantidade: item.quantidade + 1 };
        }
        return item;
      });
      setCarrinho(novoCarrinho);
    } else {
      setCarrinho([...carrinho, { produto: produto, tamanho: tamanho, quantidade: 1 }]);
    }

    setTamanhosSelecionados({ ...tamanhosSelecionados, [produto.id]: null });
  }

  function removerDoCarrinho(index) {
    const novoCarrinho = carrinho.filter((item, i) => i !== index);
    setCarrinho(novoCarrinho);
  }

  // calcula totais
  let totalCarrinho = 0;
  let totalItens = 0;
  for (let i = 0; i < carrinho.length; i++) {
    totalCarrinho += carrinho[i].produto.price * carrinho[i].quantidade;
    totalItens += carrinho[i].quantidade;
  }

  function finalizarPedido(evento) {
    evento.preventDefault();
    const form = new FormData(evento.target);

    const itens = carrinho.map((item) => ({
      product_id: item.produto.id,
      size: item.tamanho,
      quantity: item.quantidade,
    }));

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: form.get("name"),
        customer_email: form.get("email"),
        shipping_address: form.get("address"),
        items: itens,
      }),
    })
      .then((res) => res.json())
      .then((pedido) => {
        setPedidoSucesso(pedido);
        setCarrinho([]);
        setCheckoutAberto(false);
      });
  }

  return (
    <>
      <header className="header">
        <h1>
          Sneaker<span>Shop</span>
        </h1>
        <button className="cart-btn" onClick={() => setCarrinhoAberto(true)}>
          Carrinho ({totalItens})
        </button>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar tênis..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button
          className={"filter-btn " + (filtroCategoria === "" ? "active" : "")}
          onClick={() => setFiltroCategoria("")}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            className={"filter-btn " + (filtroCategoria === cat.name ? "active" : "")}
            onClick={() => setFiltroCategoria(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="loading">Carregando produtos...</div>
      ) : (
        <div className="products-grid">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} className="product-card">
              <img src={produto.image_url} alt={produto.name} />
              <div className="product-info">
                <div className="product-brand">{produto.brand}</div>
                <div className="product-name">{produto.name}</div>
                <div className="product-desc">{produto.description}</div>
                <div className="product-price">{formatarPreco(produto.price)}</div>
                <div className="stock-badge">
                  {produto.stock > 0
                    ? produto.stock + " em estoque"
                    : "Esgotado"}
                </div>
                <div className="product-sizes">
                  {produto.sizes.split(",").map((tamanho) => (
                    <button
                      key={tamanho}
                      className={"size-btn " + (tamanhosSelecionados[produto.id] === tamanho ? "selected" : "")}
                      onClick={() => selecionarTamanho(produto.id, tamanho)}
                    >
                      {tamanho}
                    </button>
                  ))}
                </div>
                <button
                  className="add-to-cart-btn"
                  disabled={!tamanhosSelecionados[produto.id] || produto.stock === 0}
                  onClick={() => adicionarAoCarrinho(produto)}
                >
                  {tamanhosSelecionados[produto.id]
                    ? "Adicionar - Tam. " + tamanhosSelecionados[produto.id]
                    : "Selecione o tamanho"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* overlay do carrinho */}
      <div
        className={"cart-overlay " + (carrinhoAberto ? "open" : "")}
        onClick={() => setCarrinhoAberto(false)}
      />

      <div className={"cart-sidebar " + (carrinhoAberto ? "open" : "")}>
        <div className="cart-header">
          <h2>Seu Carrinho</h2>
          <button className="close-btn" onClick={() => setCarrinhoAberto(false)}>
            X
          </button>
        </div>

        <div className="cart-items">
          {carrinho.length === 0 ? (
            <div className="empty-cart">Seu carrinho está vazio</div>
          ) : (
            carrinho.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={item.produto.image_url} alt={item.produto.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.produto.name}</div>
                  <div className="cart-item-details">
                    Tam: {item.tamanho} | Qtd: {item.quantidade}
                  </div>
                  <div className="cart-item-price">
                    {formatarPreco(item.produto.price * item.quantidade)}
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removerDoCarrinho(index)}
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>

        {carrinho.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>{formatarPreco(totalCarrinho)}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={() => {
                setCarrinhoAberto(false);
                setCheckoutAberto(true);
              }}
            >
              Finalizar Compra
            </button>
          </div>
        )}
      </div>

      {checkoutAberto && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Finalizar Pedido</h2>
            <form onSubmit={finalizarPedido}>
              <div className="form-group">
                <label>Nome completo</label>
                <input name="name" required />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input name="email" type="email" required />
              </div>
              <div className="form-group">
                <label>Endereço de entrega</label>
                <textarea name="address" rows="3" required />
              </div>
              <div className="cart-total">
                <span>Total:</span>
                <span>{formatarPreco(totalCarrinho)}</span>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setCheckoutAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm">
                  Confirmar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pedidoSucesso && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="success-message">
              <h3>Pedido realizado com sucesso!</h3>
              <p>Número do pedido: #{pedidoSucesso.id}</p>
              <p>Total: {formatarPreco(pedidoSucesso.total)}</p>
              <br />
              <button
                className="btn-confirm"
                onClick={() => setPedidoSucesso(null)}
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
