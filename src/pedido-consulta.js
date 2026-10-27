/** Consulta de pedidos: lista com Ver, Editar, Concluir, Cancelar e botão de novo pedido. */

import { listarClientes } from './cliente.js';
import {
  STATUS_ABERTO, cancelarPedido, concluirPedido, criarTelaPedido, listarPedidos, obterStatus,
} from './pedido.js';
import { abrirModalPedido, formatarMoeda } from './pedido-impressao.js';

const COLUNAS_CONSULTA = ['Nº', 'Cliente', 'Data', 'Cond. Pagto', 'Total', 'Status', 'Ações'];
const ROTULOS_STATUS = { aberto: 'Em aberto', concluido: 'Concluído', cancelado: 'Cancelado' };
const FORMATO_DATA = 'pt-BR';
const SEM_VALOR = '-';

/**
 * Cria um botão de ação.
 * @param {string} texto - Texto do botão.
 * @param {string} classe - Classe CSS extra.
 * @param {() => void} aoClicar - Tratador de clique.
 * @returns {HTMLButtonElement} Botão pronto.
 */
function criarBotao(texto, classe, aoClicar) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = `botao botao--secundario ${classe}`;
  botao.textContent = texto;
  botao.addEventListener('click', aoClicar);
  return botao;
}

/**
 * Cria as células de dados de uma linha da consulta.
 * @param {object} pedido - Pedido salvo.
 * @param {Map<number, object>} clientes - Clientes por id.
 * @returns {string[]} Textos das células (sem a coluna Ações).
 */
function obterTextosDaLinha(pedido, clientes) {
  const cliente = clientes.get(pedido.clienteId);
  const data = pedido.data ? new Date(pedido.data).toLocaleDateString(FORMATO_DATA) : SEM_VALOR;
  return [
    String(pedido.id), cliente ? cliente.nome : String(pedido.clienteId), data,
    pedido.condicaoPagamento || SEM_VALOR, formatarMoeda(pedido.total),
    ROTULOS_STATUS[obterStatus(pedido)],
  ];
}

/**
 * Cria a tabela da consulta com os botões de cada pedido.
 * @param {{pedidos: object[], clientes: Map<number, object>,
 *   acoes: {ver: Function, editar: Function, concluir: Function, cancelar: Function}}} contexto
 *   - Dados e tratadores de clique.
 * @returns {HTMLTableElement} Tabela pronta.
 */
function criarTabelaConsulta({ pedidos, clientes, acoes }) {
  const tabela = document.createElement('table');
  tabela.className = 'tabela';
  const cabecalho = tabela.createTHead().insertRow();
  COLUNAS_CONSULTA.forEach((coluna) => {
    cabecalho.insertCell().textContent = coluna;
  });
  const corpo = tabela.createTBody();
  pedidos.forEach((pedido) => {
    const linha = corpo.insertRow();
    obterTextosDaLinha(pedido, clientes).forEach((texto) => {
      linha.insertCell().textContent = texto;
    });
    const botoes = [criarBotao('Ver', 'acao-ver', () => acoes.ver(pedido))];
    if (obterStatus(pedido) === STATUS_ABERTO) {
      botoes.push(
        criarBotao('Editar', 'acao-editar', () => acoes.editar(pedido)),
        criarBotao('Concluir', 'acao-concluir', () => acoes.concluir(pedido)),
        criarBotao('Cancelar', 'acao-excluir', () => acoes.cancelar(pedido)),
      );
    }
    linha.insertCell().append(...botoes);
  });
  return tabela;
}

/**
 * Monta a consulta de pedidos; "Novo Pedido" e "Editar" abrem o formulário na mesma área.
 * @param {object} api - API injetada.
 * @returns {HTMLElement} Seção da tela.
 */
export function criarTelaConsultaPedido(api) {
  const secao = document.createElement('section');
  const consulta = document.createElement('div');
  secao.append(consulta);
  const mensagem = Object.assign(document.createElement('p'), { className: 'mensagem' });

  /** @param {Error} erro - Erro a mostrar na consulta. */
  function mostrarErro(erro) {
    mensagem.textContent = erro.message;
  }

  /** Volta para a lista de pedidos, relida do banco. */
  function mostrarConsulta() {
    secao.replaceChildren(consulta);
    Promise.all([listarPedidos(api), listarClientes(api)])
      .then(([pedidos, listaClientes]) => desenharConsulta(pedidos, listaClientes))
      .catch(mostrarErro);
  }

  /**
   * @param {object} [pedido] - Pedido em aberto a editar (sem pedido, abre um novo).
   */
  function mostrarFormulario(pedido) {
    secao.replaceChildren(criarTelaPedido(api, { pedido, aoVoltar: mostrarConsulta }));
  }

  /**
   * Executa uma ação de status e relê a lista (mostra o erro se for recusada).
   * @param {() => Promise} acao - Ação a executar.
   */
  function executar(acao) {
    mensagem.textContent = '';
    acao().then(mostrarConsulta).catch(mostrarErro);
  }

  /**
   * @param {object[]} pedidos - Pedidos salvos.
   * @param {object[]} listaClientes - Clientes cadastrados.
   */
  function desenharConsulta(pedidos, listaClientes) {
    const clientes = new Map(listaClientes.map((cliente) => [cliente.id, cliente]));
    const acoes = {
      ver: (pedido) => abrirModalPedido({ pedido, cliente: clientes.get(pedido.clienteId) }),
      editar: mostrarFormulario,
      concluir: (pedido) => executar(() => concluirPedido(api, pedido.id)),
      cancelar: (pedido) => executar(() => cancelarPedido(api, pedido.id)),
    };
    const titulo = Object.assign(document.createElement('h2'), { textContent: 'Pedidos' });
    const novo = criarBotao('Novo Pedido', 'acao-novo', () => mostrarFormulario());
    const tabela = criarTabelaConsulta({ pedidos, clientes, acoes });
    consulta.className = 'cartao';
    consulta.replaceChildren(titulo, novo, mensagem, tabela);
  }

  mostrarConsulta();
  return secao;
}
