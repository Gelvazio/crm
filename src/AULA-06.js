// Aula 06 — mini-loja usada para simular o fluxo E2E completo (login + checkout).

export const MSG_CREDENCIAIS_INVALIDAS = 'Credenciais inválidas';
export const EMAIL_VALIDO = 'aluno@senai.br';
export const SENHA_VALIDA = '123456';
export const MSG_SUCESSO_PEDIDO = 'Pedido confirmado';
export const PRODUTO = { id: 1, nome: 'Caderno', preco: 20 };

const NUMERO_INICIAL_PEDIDO = 1001;
const TAMANHO_CARTAO = 16;
const PAGINA_LOGIN = 'login';
const PAGINA_PAINEL = 'painel';
const PAGINA_CARRINHO = 'carrinho';
const PAGINA_CHECKOUT = 'checkout';
const PAGINA_CONFIRMACAO = 'confirmacao';

/**
 * Formata um valor em reais, sem casas decimais desnecessárias.
 * @param {number} valor - Valor numérico.
 * @returns {string} Texto no formato `R$ 20`.
 */
function formatarPreco(valor) {
  return `R$ ${valor}`;
}

/**
 * Cria um gerador determinístico de números de pedido.
 * @returns {function(): number} Função que devolve 1001, 1002, ...
 */
function criarGeradorPedido() {
  let proximo = NUMERO_INICIAL_PEDIDO;
  return () => proximo++;
}

/**
 * Monta o HTML da página de login.
 * @returns {string} HTML do formulário de login.
 */
function htmlLogin() {
  return `
    <form>
      <h1>Login</h1>
      <label>E-mail <input name="email" type="email"></label>
      <label>Senha <input name="senha" type="password"></label>
      <button type="submit">Entrar</button>
      <p role="alert"></p>
    </form>`;
}

/**
 * Monta o HTML do painel (vitrine).
 * @param {number} quantidadeNoCarrinho - Itens já adicionados.
 * @returns {string} HTML do painel.
 */
function htmlPainel(quantidadeNoCarrinho) {
  return `
    <h1>Painel</h1>
    <p>Bem-vindo, Aluno</p>
    <section>
      <h2>${PRODUTO.nome}</h2>
      <p>${formatarPreco(PRODUTO.preco)}</p>
      <button type="button" data-acao="adicionar">Adicionar ao carrinho</button>
    </section>
    <button type="button" data-acao="carrinho">Ver carrinho</button>
    <p>Carrinho: <span aria-label="Itens no carrinho">${quantidadeNoCarrinho}</span></p>`;
}

/**
 * Monta o HTML do carrinho.
 * @param {number} quantidade - Quantidade atual.
 * @returns {string} HTML do carrinho.
 */
function htmlCarrinho(quantidade) {
  return `
    <h1>Carrinho</h1>
    <label>Quantidade <input type="number" min="1" value="${quantidade}"></label>
    <p data-subtotal>Subtotal: ${formatarPreco(quantidade * PRODUTO.preco)}</p>
    <button type="button" data-acao="checkout">Ir para o checkout</button>`;
}

/**
 * Monta o HTML do checkout.
 * @returns {string} HTML do checkout.
 */
function htmlCheckout() {
  return `
    <h1>Checkout</h1>
    <label>Endereço <input name="endereco"></label>
    <label>Cartão de teste <input name="cartao"></label>
    <button type="button" data-acao="confirmar" disabled>Confirmar</button>`;
}

/**
 * Monta o HTML da confirmação do pedido.
 * @param {number} numeroPedido - Número do pedido gerado.
 * @returns {string} HTML da confirmação.
 */
function htmlConfirmacao(numeroPedido) {
  return `<p role="status">${MSG_SUCESSO_PEDIDO}: #${numeroPedido}</p>`;
}

/**
 * Renderiza e controla a loja inteira dentro de um container.
 * @param {HTMLElement} container - Elemento onde a loja é montada.
 * @returns {HTMLElement} O elemento <main> criado.
 */
export function montarLoja(container) {
  const principal = document.createElement('main');
  container.replaceChildren(principal);

  const gerarPedido = criarGeradorPedido();
  const estado = { itens: 0, quantidade: 1 };

  /**
   * Troca a página exibida e liga os eventos dela.
   * @param {string} pagina - Nome da página de destino.
   * @param {number} [numeroPedido] - Usado só na confirmação.
   * @returns {void}
   */
  function irPara(pagina, numeroPedido) {
    principal.dataset.pagina = pagina;
    const renderizadores = {
      [PAGINA_LOGIN]: () => htmlLogin(),
      [PAGINA_PAINEL]: () => htmlPainel(estado.itens),
      [PAGINA_CARRINHO]: () => htmlCarrinho(estado.quantidade),
      [PAGINA_CHECKOUT]: () => htmlCheckout(),
      [PAGINA_CONFIRMACAO]: () => htmlConfirmacao(numeroPedido),
    };
    principal.innerHTML = renderizadores[pagina]();
    ligarEventos(pagina);
  }

  /**
   * Liga os eventos específicos da página atual.
   * @param {string} pagina - Nome da página renderizada.
   * @returns {void}
   */
  function ligarEventos(pagina) {
    const ligadores = {
      [PAGINA_LOGIN]: ligarLogin,
      [PAGINA_PAINEL]: ligarPainel,
      [PAGINA_CARRINHO]: ligarCarrinho,
      [PAGINA_CHECKOUT]: ligarCheckout,
    };
    const ligar = ligadores[pagina];
    if (ligar) ligar();
  }

  /**
   * Controla o envio do formulário de login.
   * @returns {void}
   */
  function ligarLogin() {
    const formulario = principal.querySelector('form');
    const alerta = principal.querySelector('[role="alert"]');
    formulario.noValidate = true;
    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const email = formulario.elements.email.value;
      const senha = formulario.elements.senha.value;
      const estaValido = email === EMAIL_VALIDO && senha === SENHA_VALIDA;
      if (!estaValido) {
        alerta.textContent = MSG_CREDENCIAIS_INVALIDAS;
        return;
      }
      irPara(PAGINA_PAINEL);
    });
  }

  /**
   * Controla os botões do painel.
   * @returns {void}
   */
  function ligarPainel() {
    const contador = principal.querySelector('[aria-label="Itens no carrinho"]');
    principal.querySelector('[data-acao="adicionar"]').addEventListener('click', () => {
      estado.itens += 1;
      contador.textContent = String(estado.itens);
    });
    principal.querySelector('[data-acao="carrinho"]').addEventListener('click', () => {
      estado.quantidade = Math.max(estado.itens, 1);
      irPara(PAGINA_CARRINHO);
    });
  }

  /**
   * Controla quantidade, subtotal e avanço para o checkout.
   * @returns {void}
   */
  function ligarCarrinho() {
    const campo = principal.querySelector('input[type="number"]');
    const subtotal = principal.querySelector('[data-subtotal]');
    campo.addEventListener('input', () => {
      const quantidade = Number(campo.value);
      const quantidadeValida = Number.isFinite(quantidade) && quantidade >= 1;
      if (!quantidadeValida) return;
      estado.quantidade = quantidade;
      subtotal.textContent = `Subtotal: ${formatarPreco(quantidade * PRODUTO.preco)}`;
    });
    principal.querySelector('[data-acao="checkout"]').addEventListener('click', () => {
      irPara(PAGINA_CHECKOUT);
    });
  }

  /**
   * Habilita o botão Confirmar conforme endereço e cartão e conclui o pedido.
   * @returns {void}
   */
  function ligarCheckout() {
    const endereco = principal.querySelector('[name="endereco"]');
    const cartao = principal.querySelector('[name="cartao"]');
    const botao = principal.querySelector('[data-acao="confirmar"]');
    const atualizar = () => {
      const cartaoValido = new RegExp(`^\\d{${TAMANHO_CARTAO}}$`).test(cartao.value);
      botao.disabled = !(endereco.value.trim() !== '' && cartaoValido);
    };
    endereco.addEventListener('input', atualizar);
    cartao.addEventListener('input', atualizar);
    botao.addEventListener('click', () => {
      if (botao.disabled) return;
      irPara(PAGINA_CONFIRMACAO, gerarPedido());
    });
  }

  irPara(PAGINA_LOGIN);
  return principal;
}
