/** Modal de impressão do pedido (o navegador salva em PDF pelo diálogo de impressão). */

const CASAS_DECIMAIS = 2;
const NOME_EMPRESA = 'CRM Núcleo de Vendas';
const CLASSE_MODAL = 'modal-pedido';
const COLUNAS_IMPRESSAO = ['Descrição', 'Qtd', 'Valor Unit.', 'Desconto', 'Total'];
const FORMATO_DATA = 'pt-BR';

/**
 * Formata um valor em reais (ex.: R$ 22,00).
 * @param {number} valor - Valor numérico.
 * @returns {string} Valor formatado.
 */
export function formatarMoeda(valor) {
  return `R$ ${Number(valor).toFixed(CASAS_DECIMAIS).replace('.', ',')}`;
}

/**
 * Cria um elemento com classe e texto.
 * @param {string} tag - Nome da tag.
 * @param {string} classe - Classe CSS.
 * @param {string} texto - Texto do elemento.
 * @returns {HTMLElement} Elemento criado.
 */
function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  elemento.textContent = texto;
  return elemento;
}

/**
 * Cria um bloco de linhas "Rótulo: valor".
 * @param {string[][]} pares - Pares [rótulo, valor].
 * @returns {HTMLDivElement} Bloco pronto.
 */
function criarBlocoDados(pares) {
  const bloco = document.createElement('div');
  pares.forEach(([rotulo, valor]) => {
    const linha = criarElemento('p', 'modal-pedido__dado', `${rotulo}: `);
    linha.append(criarElemento('span', 'modal-pedido__valor', valor));
    bloco.append(linha);
  });
  return bloco;
}

/**
 * Cria a tabela de itens do pedido.
 * @param {{nome: string, quantidade: number, preco: number}[]} itens - Itens do pedido.
 * @returns {HTMLTableElement} Tabela pronta.
 */
function criarTabelaItens(itens) {
  const tabela = criarElemento('table', 'modal-pedido__tabela', '');
  const cabecalho = tabela.createTHead().insertRow();
  COLUNAS_IMPRESSAO.forEach((coluna) => {
    cabecalho.insertCell().textContent = coluna;
  });
  const corpo = tabela.createTBody();
  itens.forEach((item) => {
    const vendido = item.precoVendido ?? item.preco;
    const desconto = (item.preco - vendido) * item.quantidade;
    const valores = [
      item.nome, String(item.quantidade), formatarMoeda(item.preco),
      formatarMoeda(desconto), formatarMoeda(vendido * item.quantidade),
    ];
    const linha = corpo.insertRow();
    valores.forEach((valor) => {
      linha.insertCell().textContent = valor;
    });
  });
  return tabela;
}

/**
 * Cria o documento do pedido (a parte que vai para o papel).
 * @param {{pedido: object, cliente: object}} dados - Pedido salvo e seu cliente.
 * @param {Date} agora - Data usada se o pedido não tiver data.
 * @returns {HTMLElement} Documento pronto.
 */
export function criarDocumentoPedido({ pedido, cliente }, agora = new Date()) {
  const documento = criarElemento('article', 'modal-pedido__documento', '');
  const data = new Date(pedido.data || agora).toLocaleDateString(FORMATO_DATA);
  const acrescimo = pedido.acrescimo ?? 0;
  documento.append(
    criarElemento('h2', 'modal-pedido__numero', `NÚMERO: ${pedido.id}`),
    criarBlocoDados([
      ['Empresa', NOME_EMPRESA], ['Cliente', cliente ? cliente.nome : String(pedido.clienteId)],
      ['Cidade', cliente ? cliente.cidade : '-'], ['Data', data],
      ['Cond. Pagamento', pedido.condicaoPagamento || '-'],
    ]),
    criarElemento('h3', 'modal-pedido__subtitulo', 'Itens do Pedido'),
    criarTabelaItens(pedido.itens),
    criarElemento('p', 'modal-pedido__total', `Acréscimo: ${formatarMoeda(acrescimo)}`),
    criarElemento('p', 'modal-pedido__total', `Desconto: ${formatarMoeda(pedido.desconto ?? 0)}`),
    criarElemento('p', 'modal-pedido__total', `Total: ${formatarMoeda(pedido.total)}`),
  );
  return documento;
}

/**
 * Cria o modal com o botão Imprimir Pedido, o documento e o botão Fechar.
 * @param {{pedido: object, cliente: object}} dados - Pedido salvo e seu cliente.
 * @param {() => void} [imprimir] - Ação de imprimir (padrão: window.print).
 * @returns {HTMLDialogElement} Diálogo pronto (ainda não aberto).
 */
export function criarModalPedido(dados, imprimir = () => window.print()) {
  const dialogo = document.createElement('dialog');
  dialogo.className = CLASSE_MODAL;
  const botaoImprimir = criarElemento('button', 'botao modal-pedido__imprimir', 'Imprimir Pedido');
  const botaoFechar = criarElemento('button', 'botao botao--secundario', 'Fechar');
  botaoImprimir.type = 'button';
  botaoFechar.type = 'button';
  botaoImprimir.addEventListener('click', imprimir);
  botaoFechar.addEventListener('click', () => dialogo.close());
  const acoes = criarElemento('div', 'modal-pedido__acoes', '');
  acoes.append(botaoImprimir, botaoFechar);
  dialogo.append(acoes, criarDocumentoPedido(dados));
  dialogo.addEventListener('close', () => dialogo.remove());
  return dialogo;
}

/**
 * Abre o modal do pedido na página.
 * @param {{pedido: object, cliente: object}} dados - Pedido salvo e seu cliente.
 * @returns {HTMLDialogElement} Diálogo aberto.
 */
export function abrirModalPedido(dados) {
  const dialogo = criarModalPedido(dados);
  document.body.append(dialogo);
  if (typeof dialogo.showModal === 'function') dialogo.showModal();
  return dialogo;
}
