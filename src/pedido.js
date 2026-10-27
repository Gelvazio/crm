/** Pedido de venda: cálculo do total, regras de criação (baixa de estoque) e tela. */

import { COLECAO_CLIENTES, listarClientes } from './cliente.js';
import { listarCondicoes } from './condicao-pagamento.js';
import { abrirModalPedido } from './pedido-impressao.js';
import { COLECAO_PRODUTOS, listarProdutos, temEstoque } from './produto.js';

export const COLECAO_PEDIDOS = 'pedidos';
const CASAS_DECIMAIS = 2;
const MSG_CLIENTE_NAO_ENCONTRADO = 'Cliente não encontrado';
const MSG_PEDIDO_SEM_ITENS = 'Pedido sem itens';
const MSG_QUANTIDADE_INVALIDA = 'Quantidade inválida';
const MSG_PRECO_VENDIDO_INVALIDO = 'Preço vendido inválido (negativo ou maior que o preço do produto)';
const MSG_PRODUTO_NAO_ENCONTRADO = 'Produto não encontrado';
export const STATUS_ABERTO = 'aberto';
export const STATUS_CONCLUIDO = 'concluido';
export const STATUS_CANCELADO = 'cancelado';
const MSG_PEDIDO_NAO_ENCONTRADO = 'Pedido não encontrado';
const MSG_PEDIDO_FECHADO = 'Só é possível alterar pedido em aberto';
const CLASSE_MENSAGEM = '.mensagem';
const CLASSE_LISTA = '.lista-pedidos';

/**
 * @param {{preco: number, precoVendido?: number}} item - Item do pedido.
 * @returns {number} Preço em que o item foi vendido (o preço real, se não houve desconto).
 */
export function obterPrecoVendido(item) {
  return item.precoVendido ?? item.preco;
}

/**
 * Desconto de um item: (preço real - preço vendido) x quantidade.
 * @param {{preco: number, precoVendido?: number, quantidade: number}} item - Item do pedido.
 * @returns {number} Desconto do item, em 2 casas.
 */
export function calcularDescontoItem(item) {
  const desconto = (item.preco - obterPrecoVendido(item)) * item.quantidade;
  return Number(desconto.toFixed(CASAS_DECIMAIS));
}

/**
 * Soma o desconto de todos os itens.
 * @param {object[]} itens - Itens do pedido.
 * @returns {number} Desconto total do pedido.
 */
export function calcularDesconto(itens) {
  const total = itens.reduce((soma, item) => soma + calcularDescontoItem(item), 0);
  return Number(total.toFixed(CASAS_DECIMAIS));
}

/**
 * Soma preço vendido x quantidade de cada item, arredondando em 2 casas.
 * @param {{preco: number, precoVendido?: number, quantidade: number}[]} itens - Itens do pedido.
 * @returns {number} Total do pedido.
 */
export function calcularTotal(itens) {
  const total = itens.reduce((soma, item) => soma + obterPrecoVendido(item) * item.quantidade, 0);
  return Number(total.toFixed(CASAS_DECIMAIS));
}

/**
 * Confere um item pedido: quantidade, produto e estoque.
 * @param {object} api - API injetada.
 * @param {{produtoId: number, quantidade: number, precoVendido?: number}} pedido - Item pedido.
 * @returns {Promise<{produto: object, item: object}>} Produto atual e item com preço.
 * (Recusa se quantidade, produto, estoque ou preço vendido forem inválidos.)
 */
function conferirItem(api, { produtoId, quantidade, precoVendido }) {
  const quantidadeValida = Number.isInteger(quantidade) && quantidade > 0;
  if (!quantidadeValida) return Promise.reject(new Error(MSG_QUANTIDADE_INVALIDA));

  return api.buscarPorId(COLECAO_PRODUTOS, produtoId).then((produto) => {
    if (!produto) return Promise.reject(new Error(MSG_PRODUTO_NAO_ENCONTRADO));
    if (!temEstoque(produto, quantidade)) {
      return Promise.reject(new Error(`Sem estoque de ${produto.nome}`));
    }
    const precoValido = precoVendido === undefined
      || (precoVendido >= 0 && precoVendido <= produto.preco);
    if (!precoValido) return Promise.reject(new Error(MSG_PRECO_VENDIDO_INVALIDO));
    const item = { produtoId, nome: produto.nome, preco: produto.preco, quantidade };
    if (precoVendido !== undefined) item.precoVendido = precoVendido;
    return { produto, item };
  });
}

/**
 * Confere se o cliente do pedido existe.
 * @param {object} api - API injetada.
 * @param {number} clienteId - Id do cliente.
 * @returns {Promise<object>} Cliente encontrado (recusa se não existir).
 */
function conferirCliente(api, clienteId) {
  return api.buscarPorId(COLECAO_CLIENTES, clienteId).then((cliente) => {
    if (!cliente) return Promise.reject(new Error(MSG_CLIENTE_NAO_ENCONTRADO));
    return cliente;
  });
}

/**
 * Dá baixa no estoque de cada produto conferido.
 * @param {object} api - API injetada.
 * @param {{produto: object, item: object}[]} conferidos - Itens já conferidos.
 * @returns {Promise<object[]>} Produtos atualizados.
 */
function darBaixaNoEstoque(api, conferidos) {
  return Promise.all(
    conferidos.map(({ produto, item }) =>
      api.atualizar(COLECAO_PRODUTOS, produto.id, {
        estoque: produto.estoque - item.quantidade,
      })
    )
  );
}

/**
 * Confere cliente, itens, produtos e estoque de um pedido.
 * @param {object} api - API injetada.
 * @param {{clienteId: number, itens: object[]}} dados - Pedido.
 * @returns {Promise<{conferidos: object[], itens: object[]}>} Itens conferidos e itens do pedido.
 * (Recusa se cliente, itens, produto, quantidade ou estoque forem inválidos.)
 */
function conferirPedido(api, dados) {
  return conferirCliente(api, dados.clienteId)
    .then(() => {
      if (dados.itens.length === 0) return Promise.reject(new Error(MSG_PEDIDO_SEM_ITENS));
      return Promise.all(dados.itens.map((pedido) => conferirItem(api, pedido)));
    })
    .then((conferidos) => ({ conferidos, itens: conferidos.map(({ item }) => item) }));
}

/**
 * Monta os campos gravados do pedido (cliente, itens, total e pagamento).
 * @param {object} dados - Pedido digitado (condicaoPagamento e acrescimo são opcionais).
 * @param {object[]} itens - Itens conferidos.
 * @returns {object} Campos para gravar.
 */
function montarCamposPedido(dados, itens) {
  const acrescimo = dados.acrescimo ?? 0;
  const pagamento = dados.condicaoPagamento
    ? { condicaoPagamento: dados.condicaoPagamento, acrescimo, desconto: calcularDesconto(itens) }
    : {};
  const total = Number((calcularTotal(itens) + acrescimo).toFixed(CASAS_DECIMAIS));
  return { clienteId: dados.clienteId, itens, total, ...pagamento };
}

/**
 * Cria um pedido, grava e dá baixa no estoque (só depois de todas as conferências).
 * @param {object} api - API injetada.
 * @param {{clienteId: number, itens: {produtoId: number, quantidade: number}[]}} dados - Pedido.
 * @param {() => Date} [agora] - Relógio injetável (nos testes vira um mock).
 * @returns {Promise<object>} Pedido salvo.
 * (Recusa se cliente, itens, produto, quantidade ou estoque forem inválidos.)
 */
export function criarPedido(api, dados, agora = () => new Date()) {
  return conferirPedido(api, dados).then(({ conferidos, itens }) =>
    darBaixaNoEstoque(api, conferidos).then(() =>
      api.criar(COLECAO_PEDIDOS, {
        ...montarCamposPedido(dados, itens),
        data: agora().toISOString(),
      })
    )
  );
}

/**
 * @param {object} pedido - Pedido salvo.
 * @returns {string} Status do pedido (pedido sem status conta como em aberto).
 */
export function obterStatus(pedido) {
  return pedido.status ?? STATUS_ABERTO;
}

/**
 * Soma (sinal 1) ou tira (sinal -1) do estoque as quantidades dos itens.
 * @param {object} api - API injetada.
 * @param {object[]} itens - Itens do pedido.
 * @param {number} sinal - 1 devolve ao estoque, -1 dá baixa.
 * @returns {Promise<object[]>} Produtos atualizados.
 */
function ajustarEstoque(api, itens, sinal) {
  return Promise.all(itens.map((item) =>
    api.buscarPorId(COLECAO_PRODUTOS, item.produtoId).then((produto) => {
      if (!produto) return null;
      const estoque = produto.estoque + sinal * item.quantidade;
      return api.atualizar(COLECAO_PRODUTOS, produto.id, { estoque });
    })
  ));
}

/**
 * Busca um pedido e garante que ele ainda está em aberto.
 * @param {object} api - API injetada.
 * @param {number} id - Id do pedido.
 * @returns {Promise<object>} Pedido em aberto (recusa se não existir ou estiver fechado).
 */
function buscarPedidoAberto(api, id) {
  return api.buscarPorId(COLECAO_PEDIDOS, id).then((pedido) => {
    if (!pedido) return Promise.reject(new Error(MSG_PEDIDO_NAO_ENCONTRADO));
    if (obterStatus(pedido) !== STATUS_ABERTO) return Promise.reject(new Error(MSG_PEDIDO_FECHADO));
    return pedido;
  });
}

/**
 * Marca um pedido em aberto como concluído.
 * @param {object} api - API injetada.
 * @param {number} id - Id do pedido.
 * @returns {Promise<object>} Pedido atualizado.
 */
export function concluirPedido(api, id) {
  return buscarPedidoAberto(api, id).then(() =>
    api.atualizar(COLECAO_PEDIDOS, id, { status: STATUS_CONCLUIDO })
  );
}

/**
 * Cancela um pedido em aberto e devolve os itens ao estoque.
 * @param {object} api - API injetada.
 * @param {number} id - Id do pedido.
 * @returns {Promise<object>} Pedido atualizado.
 */
export function cancelarPedido(api, id) {
  return buscarPedidoAberto(api, id).then((pedido) =>
    ajustarEstoque(api, pedido.itens, 1).then(() =>
      api.atualizar(COLECAO_PEDIDOS, id, { status: STATUS_CANCELADO })
    )
  );
}

/**
 * Altera um pedido em aberto: devolve o estoque antigo, confere e grava os novos itens.
 * Se a nova versão for recusada, o estoque volta ao que era.
 * @param {object} api - API injetada.
 * @param {number} id - Id do pedido.
 * @param {object} dados - Novo pedido (mesmo formato de criarPedido).
 * @returns {Promise<object>} Pedido atualizado.
 */
export function atualizarPedido(api, id, dados) {
  return buscarPedidoAberto(api, id).then((pedido) =>
    ajustarEstoque(api, pedido.itens, 1)
      .then(() => conferirPedido(api, dados))
      .then(({ conferidos, itens }) =>
        darBaixaNoEstoque(api, conferidos).then(() =>
          api.atualizar(COLECAO_PEDIDOS, id, montarCamposPedido(dados, itens))
        )
      )
      .catch((erro) => ajustarEstoque(api, pedido.itens, -1).then(() => Promise.reject(erro)))
  );
}

/**
 * @param {object} api - API injetada.
 * @returns {Promise<object[]>} Todos os pedidos.
 */
export function listarPedidos(api) {
  return api.listar(COLECAO_PEDIDOS);
}


const CONDICOES_PADRAO = [{ id: 1, nome: 'A Vista' }];
const COLUNAS_ITENS = ['Código', 'Descrição', 'Qtde', 'Unit.', 'Vendido', 'Desconto', 'Total', 'Ações'];
const MODELO_TELA = `<h2>Pedidos</h2>
  <form class="pedido">
    <div class="pedido__linha">
      <label class="pedido__campo">Cliente: <select name="clienteId"></select></label>
      <label class="pedido__campo">Cond.Pagt: <select name="condicaoPagamento"></select></label>
      <label class="pedido__campo">Acréscimo:
        <input name="acrescimo" type="text" inputmode="decimal" value="0,00"></label>
      <label class="pedido__campo">Desconto:
        <input name="desconto" readonly value="0,00"></label>
      <label class="pedido__campo">Total Venda:
        <input name="totalVenda" readonly value="0,00"></label>
    </div>
    <div class="pedido__linha pedido__linha--produto">
      <label class="pedido__campo">Produto: <select name="produtoId"></select></label>
      <button class="pedido__busca" type="button" aria-label="Buscar produto">&#128269;</button>
      <label class="pedido__campo pedido__campo--largo">Descrição:
        <input name="descricao" readonly></label>
      <label class="pedido__campo">Qtde:
        <input name="quantidade" type="number" min="1" value="1"></label>
      <label class="pedido__campo">Unit.: <input name="unitario" readonly></label>
      <label class="pedido__campo">Vendido:
        <input name="precoVendido" type="text" inputmode="decimal"></label>
      <label class="pedido__campo">Total: <input name="totalItem" readonly></label>
      <button class="pedido__adicionar" type="button">Adicionar</button>
    </div>
    <div class="pedido__itens"><table class="pedido__tabela"><thead><tr>
      ${COLUNAS_ITENS.map((coluna) => `<th>${coluna}</th>`).join('')}
    </tr></thead><tbody></tbody></table></div>
    <p class="mensagem"></p>
    <div class="pedido__rodape">
      <button class="pedido__confirmar" type="submit">Confirmar</button>
      <button class="pedido__fechar" type="button">Fechar</button>
    </div>
  </form>
  <ul class="lista-pedidos"></ul>`;

/**
 * Formata um valor com 2 casas e vírgula decimal.
 * @param {number} valor - Valor numérico.
 * @returns {string} Valor formatado (ex.: 5,50).
 */
function formatarValor(valor) {
  return valor.toFixed(CASAS_DECIMAIS).replace('.', ',');
}

/**
 * Lê um número digitado (aceita vírgula); texto inválido vira 0.
 * @param {string} texto - Texto do campo.
 * @returns {number} Número lido.
 */
function lerNumero(texto) {
  const numero = Number(String(texto).replace(',', '.'));
  return Number.isFinite(numero) ? numero : 0;
}

/**
 * Preenche um seletor com as opções dos registros.
 * @param {HTMLSelectElement} seletor - Seletor a preencher.
 * @param {{id: number, nome: string}[]} registros - Opções.
 */
function preencherSeletor(seletor, registros) {
  const opcoes = registros.map((registro) => new Option(registro.nome, String(registro.id)));
  seletor.replaceChildren(...opcoes);
}

/**
 * Preenche o seletor de condição de pagamento (usa a padrão se o cadastro estiver vazio).
 * @param {HTMLSelectElement} seletor - Seletor a preencher.
 * @param {{nome: string}[]} condicoes - Condições cadastradas.
 */
function preencherCondicoes(seletor, condicoes) {
  const lista = condicoes.length > 0 ? condicoes : CONDICOES_PADRAO;
  seletor.replaceChildren(...lista.map((condicao) => new Option(condicao.nome)));
}

/**
 * Cria a lista de pedidos para exibir.
 * @param {object[]} pedidos - Pedidos salvos.
 * @returns {HTMLLIElement[]} Linhas da lista.
 */
function criarLinhasPedidos(pedidos) {
  return pedidos.map((pedido) => {
    const item = document.createElement('li');
    item.textContent = `#${pedido.id} - cliente ${pedido.clienteId} - R$ ${pedido.total}`;
    return item;
  });
}

/**
 * Cria uma linha da tabela de itens do pedido, com botão de remover.
 * @param {{produtoId: number, nome: string, preco: number, quantidade: number}} item - Item.
 * @param {(item: object) => void} aoRemover - Chamado ao clicar em Remover.
 * @returns {HTMLTableRowElement} Linha da tabela.
 */
function criarLinhaItem(item, aoRemover) {
  const vendido = obterPrecoVendido(item);
  const valores = [
    item.produtoId, item.nome, item.quantidade, formatarValor(item.preco),
    formatarValor(vendido), formatarValor(calcularDescontoItem(item)),
    formatarValor(vendido * item.quantidade),
  ];
  const celulas = valores.map((valor) =>
    Object.assign(document.createElement('td'), { textContent: String(valor) })
  );
  const remover = Object.assign(document.createElement('button'), {
    className: 'pedido__remover', type: 'button', textContent: 'Remover',
  });
  remover.addEventListener('click', () => aoRemover(item));
  const acoes = document.createElement('td');
  acoes.append(remover);
  const linha = document.createElement('tr');
  linha.append(...celulas, acoes);
  return linha;
}

/**
 * Monta o estado e as ações da venda (carrinho, produto escolhido, totais).
 * @param {HTMLFormElement} formulario - Formulário da tela.
 * @param {HTMLElement} secao - Seção da tela.
 * @returns {object} Ações usadas pela tela.
 */
function criarControleVenda(formulario, secao) {
  const campos = formulario.elements;
  const mensagem = secao.querySelector(CLASSE_MENSAGEM);
  const corpoItens = secao.querySelector('tbody');
  const carrinho = [];
  const estado = { produtos: [] };

  /** @returns {object|undefined} Produto escolhido (atualiza descrição, preços e total). */
  function atualizarProduto() {
    const produto = estado.produtos.find((atual) => atual.id === Number(campos.produtoId.value));
    const trocouProduto = produto && campos.precoVendido.dataset.produto !== String(produto.id);
    if (trocouProduto) {
      campos.precoVendido.value = formatarValor(produto.preco);
      campos.precoVendido.dataset.produto = String(produto.id);
    }
    const vendido = lerNumero(campos.precoVendido.value);
    const total = produto ? vendido * lerNumero(campos.quantidade.value) : 0;
    campos.descricao.value = produto ? produto.nome : '';
    campos.unitario.value = produto ? formatarValor(produto.preco) : '';
    campos.totalItem.value = produto ? formatarValor(total) : '';
    return produto;
  }

  /** Redesenha a tabela de itens, o Desconto (calculado) e o Total Venda (vendido + acréscimo). */
  function atualizarCarrinho() {
    const remover = (item) => {
      carrinho.splice(carrinho.indexOf(item), 1);
      atualizarCarrinho();
    };
    corpoItens.replaceChildren(...carrinho.map((item) => criarLinhaItem(item, remover)));
    const total = calcularTotal(carrinho) + lerNumero(campos.acrescimo.value);
    campos.desconto.value = formatarValor(calcularDesconto(carrinho));
    campos.totalVenda.value = formatarValor(total);
  }

  /** Adiciona o produto e a quantidade da linha ao carrinho (soma se já existir). */
  function adicionarItem() {
    const produto = atualizarProduto();
    const quantidade = Number(campos.quantidade.value);
    if (!produto) throw new Error(MSG_PRODUTO_NAO_ENCONTRADO);
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error(MSG_QUANTIDADE_INVALIDA);
    }
    const precoVendido = lerNumero(campos.precoVendido.value);
    if (precoVendido < 0 || precoVendido > produto.preco) {
      throw new Error(MSG_PRECO_VENDIDO_INVALIDO);
    }
    const existente = carrinho.find(
      (item) => item.produtoId === produto.id && obterPrecoVendido(item) === precoVendido,
    );
    if (existente) existente.quantidade += quantidade;
    else {
      carrinho.push({
        produtoId: produto.id, nome: produto.nome, preco: produto.preco, precoVendido, quantidade,
      });
    }
    campos.precoVendido.dataset.produto = '';
    atualizarProduto();
    atualizarCarrinho();
  }

  /** @param {object[]} itens - Itens de um pedido existente para carregar no carrinho. */
  function carregarItens(itens) {
    carrinho.splice(0, carrinho.length, ...itens.map((item) => ({ ...item })));
    atualizarCarrinho();
  }

  /** Limpa o carrinho e o acréscimo (botão Fechar e fim de um pedido). */
  function limparVenda() {
    carrinho.length = 0;
    campos.acrescimo.value = '0,00';
    campos.quantidade.value = '1';
    campos.precoVendido.dataset.produto = '';
    mensagem.textContent = '';
    atualizarCarrinho();
    atualizarProduto();
  }

  /** @returns {{produtoId: number, quantidade: number}[]} Itens do carrinho (ou a linha atual). */
  function obterItensDoPedido() {
    const linhaAtual = {
      produtoId: Number(campos.produtoId.value), quantidade: Number(campos.quantidade.value),
      precoVendido: lerNumero(campos.precoVendido.value),
    };
    const itens = carrinho.length > 0 ? carrinho : [linhaAtual];
    return itens.map((item) => ({
      produtoId: item.produtoId, quantidade: item.quantidade, precoVendido: obterPrecoVendido(item),
    }));
  }

  return {
    estado, atualizarProduto, atualizarCarrinho, adicionarItem, limparVenda, obterItensDoPedido,
    carregarItens,
  };
}

/**
 * Monta a tela de pedidos (cabeçalho da venda, produto, itens e rodapé).
 * @param {object} api - API injetada.
 * @param {{abrirModal?: Function, pedido?: object, aoVoltar?: Function}} [opcoes] - abrirModal
 *   abre o modal de impressão (injetável nos testes); pedido (em aberto) liga o modo edição;
 *   aoVoltar é chamado depois de confirmar ou fechar (volta para a consulta).
 * @returns {HTMLElement} Seção da tela (preenchida depois que o fetch responde).
 */
export function criarTelaPedido(api, { abrirModal = abrirModalPedido, pedido, aoVoltar } = {}) {
  const secao = document.createElement('section');
  secao.className = 'cartao cartao--pedido';
  secao.innerHTML = MODELO_TELA;
  secao.querySelector('h2').textContent = pedido ? `Editar Pedido nº ${pedido.id}` : 'Novo Pedido';
  const formulario = secao.querySelector('form');
  const campos = formulario.elements;
  const mensagem = secao.querySelector(CLASSE_MENSAGEM);
  const venda = criarControleVenda(formulario, secao);

  /** @param {Error} erro - Erro a mostrar abaixo da tabela. */
  function mostrarErro(erro) {
    mensagem.textContent = erro.message;
  }

  /** No modo edição, coloca os dados do pedido nos campos (só na primeira carga). */
  function preencherEdicao() {
    if (!pedido || campos.clienteId.dataset.editado) return;
    campos.clienteId.dataset.editado = 'sim';
    campos.clienteId.value = String(pedido.clienteId);
    if (pedido.condicaoPagamento) campos.condicaoPagamento.value = pedido.condicaoPagamento;
    campos.acrescimo.value = formatarValor(pedido.acrescimo ?? 0);
    venda.carregarItens(pedido.itens);
  }

  /** @returns {Promise} Carrega clientes, produtos e pedidos e redesenha a tela. */
  function carregar() {
    const buscas = [
      listarClientes(api), listarProdutos(api), listarPedidos(api), listarCondicoes(api),
    ];
    return Promise.all(buscas).then(
      ([clientes, produtos, pedidos, condicoes]) => {
        venda.estado.produtos = produtos;
        preencherSeletor(campos.clienteId, clientes);
        preencherSeletor(campos.produtoId, produtos);
        preencherCondicoes(campos.condicaoPagamento, condicoes);
        preencherEdicao();
        venda.atualizarProduto();
        secao.querySelector(CLASSE_LISTA).replaceChildren(...criarLinhasPedidos(pedidos));
      }
    );
  }

  /** Adiciona o item e mostra o erro, se houver. */
  function aoAdicionar() {
    mensagem.textContent = '';
    try {
      venda.adicionarItem();
    } catch (erro) {
      mostrarErro(erro);
    }
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = {
      clienteId: Number(campos.clienteId.value),
      itens: venda.obterItensDoPedido(),
      condicaoPagamento: campos.condicaoPagamento.value,
      acrescimo: lerNumero(campos.acrescimo.value),
    };
    const gravar = pedido ? atualizarPedido(api, pedido.id, dados) : criarPedido(api, dados);
    gravar
      .then((salvo) => api.buscarPorId(COLECAO_CLIENTES, dados.clienteId).then((cliente) => {
        venda.limparVenda();
        abrirModal({ pedido: salvo, cliente });
        return aoVoltar ? aoVoltar() : carregar();
      }))
      .catch(mostrarErro);
  });

  campos.produtoId.addEventListener('change', venda.atualizarProduto);
  campos.quantidade.addEventListener('input', venda.atualizarProduto);
  campos.precoVendido.addEventListener('input', venda.atualizarProduto);
  campos.acrescimo.addEventListener('input', venda.atualizarCarrinho);
  secao.querySelector('.pedido__adicionar').addEventListener('click', aoAdicionar);
  secao.querySelector('.pedido__busca').addEventListener('click', () => campos.produtoId.focus());
  secao.querySelector('.pedido__fechar').addEventListener('click', () => {
    venda.limparVenda();
    if (aoVoltar) aoVoltar();
  });

  carregar().catch(mostrarErro);
  return secao;
}
