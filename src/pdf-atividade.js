/**
 * Exporta a atividade (atividade-sa.html) em PDF no padrão de atividade SENAI do aulasenai
 * (cabeçalho SENAI, itens CAPACIDADE / Contexto / Comando / Resposta, tabelas de borda fina),
 * com o visual futurista do CRM (fundo escuro, ciano e magenta).
 */

import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export const NOME_ARQUIVO_PDF = 'Atividade-SA-CRM.pdf';
const DOCENTE = 'GELVAZIO CAMARGO';
const MARGEM = 15;
const LINHAS_RESPOSTA = 3;
const ROTULOS = ['CAPACIDADE:', 'Contexto:', 'Comando:', 'Resposta:'];
const SUBSTITUICOES = [
  [/→/g, '->'], [/≥/g, '>='], [/≤/g, '<='], [/☒/g, 'X'], [/·/g, '-'], [/[“”]/g, '"'],
  [/[^\u0000-ÿ–—]/g, ''],
];
const COR = {
  fundo: [5, 3, 13], cartao: [20, 12, 44], texto: [232, 236, 255],
  ciano: [0, 240, 255], magenta: [255, 43, 214], violeta: [122, 60, 255],
};

/**
 * Troca caracteres que a fonte padrão do PDF não desenha e normaliza espaços.
 * @param {string} texto - Texto original.
 * @returns {string} Texto seguro para o PDF.
 */
export function limparTexto(texto) {
  const limpo = SUBSTITUICOES.reduce((atual, [padrao, troca]) => atual.replace(padrao, troca), texto);
  return limpo.replace(/\s+/g, ' ').trim();
}

/**
 * Lê as linhas de texto de uma seção (parágrafos, listas, tabelas e código).
 * @param {Element} secao - Elemento .cartao.
 * @returns {string[]} Linhas de texto, na ordem da página.
 */
export function extrairLinhas(secao) {
  const linhas = [];
  secao.querySelectorAll('p, li, tr, pre').forEach((elemento) => {
    const eTabela = elemento.tagName === 'TR';
    const texto = eTabela
      ? [...elemento.cells].map((celula) => celula.textContent).join(' | ')
      : elemento.textContent;
    const limpo = limparTexto(texto);
    if (limpo) linhas.push(limpo);
  });
  return linhas;
}

/**
 * Lê os itens de exercício (.exercicio-box) de uma seção.
 * @param {Element} secao - Elemento .cartao.
 * @returns {{cabecalho: string, linhas: string[]}[]} Itens com suas linhas.
 */
export function extrairItens(secao) {
  return [...secao.querySelectorAll('.exercicio-box')].map((caixa) => ({
    cabecalho: limparTexto(caixa.querySelector('.exercicio-header')?.textContent ?? ''),
    linhas: [...caixa.querySelectorAll('p')].map((p) => limparTexto(p.textContent)).filter(Boolean),
  }));
}

/**
 * Monta os dados do PDF a partir da página.
 * @param {Document} documento - Documento da atividade.
 * @returns {{titulo: string, secoes: object[]}} Título e seções (com linhas ou itens).
 */
export function extrairAtividade(documento) {
  const titulo = limparTexto(documento.querySelector('h1')?.textContent ?? 'Atividade');
  const secoes = [...documento.querySelectorAll('.cartao')].map((secao) => ({
    titulo: limparTexto(secao.querySelector('h2')?.textContent ?? ''),
    itens: extrairItens(secao),
    linhas: secao.querySelector('.exercicio-box') ? [] : extrairLinhas(secao),
  }));
  return { titulo, secoes: secoes.filter((secao) => secao.titulo) };
}

/**
 * Pinta o fundo escuro e a moldura neon da página atual.
 * @param {jsPDF} doc - Documento PDF.
 */
function pintarPagina(doc) {
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  doc.setFillColor(...COR.fundo);
  doc.rect(0, 0, largura, altura, 'F');
  doc.setDrawColor(...COR.ciano);
  doc.setLineWidth(0.4);
  doc.rect(6, 6, largura - 12, altura - 12);
}

/** Estilos base das tabelas: borda fina ciano, texto claro sobre cartão escuro. */
const ESTILO_BASE = {
  fontSize: 10, cellPadding: 3, lineColor: COR.ciano, lineWidth: 0.1,
  textColor: COR.texto, fillColor: COR.cartao,
};

/**
 * Estilo de uma célula de título (faixa neon).
 * @param {number[]} cor - Cor do texto.
 * @returns {object} Estilos da célula.
 */
function estiloTitulo(cor) {
  return { fontStyle: 'bold', halign: 'center', fillColor: COR.violeta, textColor: cor };
}

/**
 * Desenha uma tabela depois da anterior, repintando o fundo em cada página nova.
 * @param {jsPDF} doc - Documento PDF.
 * @param {object[][]} corpo - Linhas da tabela.
 * @param {number} inicioY - Posição vertical inicial.
 * @returns {number} Posição vertical logo abaixo da tabela.
 */
function desenharTabela(doc, corpo, inicioY) {
  autoTable(doc, {
    body: corpo, startY: inicioY, margin: MARGEM + 2, styles: ESTILO_BASE,
    willDrawPage: () => pintarPagina(doc),
  });
  return doc.lastAutoTable.finalY + 6;
}

/**
 * Cabeçalho SENAI (padrão do aulasenai) em tabela.
 * @param {string} titulo - Título da atividade.
 * @returns {object[][]} Linhas do cabeçalho.
 */
function montarCabecalho(titulo) {
  const faixa = { fontSize: 10, fontStyle: 'bold', halign: 'center' };
  return [
    [
      { content: 'SENAI\nServiço Nacional de Aprendizagem Industrial\nSanta Catarina',
        colSpan: 2, styles: { ...faixa, fillColor: COR.violeta, textColor: COR.ciano } },
      { content: titulo, styles: { ...faixa, textColor: COR.magenta } },
      { content: 'Desempenho', styles: { ...faixa, textColor: COR.ciano } },
    ],
    [{ content: 'SITUAÇÃO DE APRENDIZAGEM - TESTES UNITÁRIOS NO CRM', colSpan: 4,
      styles: { fontStyle: 'bold' } }],
    [{ content: 'Data: ___/___/___', colSpan: 4 }],
    [{ content: `Docente: ${DOCENTE}`, colSpan: 4, styles: { fontStyle: 'bold' } }],
    [{ content: 'Unidade Curricular: Testes de Front-End', colSpan: 2 },
      { content: 'Turma: ______________', colSpan: 2 }],
    [{ content: 'Estudante: ____________________________________________', colSpan: 4 }],
  ];
}

/**
 * Linhas de uma seção de texto (título + conteúdo).
 * @param {{titulo: string, linhas: string[]}} secao - Seção.
 * @returns {object[][]} Linhas da tabela.
 */
function montarSecao(secao) {
  const titulo = [{ content: secao.titulo.toUpperCase(), styles: estiloTitulo(COR.ciano) }];
  return [titulo, ...secao.linhas.map((linha) => [linha])];
}

/**
 * Linhas de um item de exercício, com rótulos em negrito e linhas de resposta.
 * @param {{cabecalho: string, linhas: string[]}} item - Item.
 * @returns {object[][]} Linhas da tabela.
 */
function montarItem(item) {
  const titulo = [{ content: item.cabecalho, styles: estiloTitulo(COR.magenta) }];
  const corpo = item.linhas.map((linha) => {
    const temRotulo = ROTULOS.some((rotulo) => linha.startsWith(rotulo));
    const cor = temRotulo ? COR.ciano : COR.texto;
    return [{ content: linha, styles: { fontStyle: temRotulo ? 'bold' : 'normal', textColor: cor } }];
  });
  const respostas = Array.from({ length: LINHAS_RESPOSTA }, () => [{ content: '', styles: { minCellHeight: 8 } }]);
  return [titulo, ...corpo, ...respostas];
}

/**
 * Gera o PDF da atividade.
 * @param {{titulo: string, secoes: object[]}} dados - Dados vindos de extrairAtividade.
 * @param {() => jsPDF} [criarDocumento] - Fábrica do documento (injetável nos testes).
 * @returns {jsPDF} Documento gerado (ainda não salvo).
 */
export function gerarPdf(dados, criarDocumento = () => new jsPDF('p', 'mm', 'a4')) {
  const doc = criarDocumento();
  pintarPagina(doc);
  let posicaoY = desenharTabela(doc, montarCabecalho(dados.titulo), 14);
  dados.secoes.forEach((secao) => {
    posicaoY = desenharTabela(doc, montarSecao(secao), posicaoY);
    secao.itens.forEach((item) => {
      posicaoY = desenharTabela(doc, montarItem(item), posicaoY);
    });
  });
  return doc;
}

/**
 * Lê a página e baixa o PDF.
 * @param {Document} documento - Documento da atividade.
 */
export function exportarPdf(documento) {
  gerarPdf(extrairAtividade(documento)).save(NOME_ARQUIVO_PDF);
}
