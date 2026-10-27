/** Cadastro de produto: regras de validação, acesso à API e tela. */

import { criarTelaCadastro } from './tela.js';

export const COLECAO_PRODUTOS = 'produtos';
export const CAMPOS_PRODUTO = [
  { nome: 'nome', rotulo: 'Nome', tipo: 'text' },
  { nome: 'preco', rotulo: 'Preço', tipo: 'number' },
  { nome: 'estoque', rotulo: 'Estoque', tipo: 'number' },
];
const COLUNAS_PRODUTO = [
  { chave: 'id', rotulo: 'ID' },
  { chave: 'nome', rotulo: 'Nome' },
  { chave: 'preco', rotulo: 'Preço' },
  { chave: 'estoque', rotulo: 'Estoque' },
];

/**
 * Confere os dados de um produto.
 * @param {{nome: string, preco: number, estoque: number}} produto - Dados.
 * @returns {string[]} Lista de erros (vazia quando está tudo certo).
 */
export function validarProduto(produto) {
  const erros = [];
  if (!produto.nome) erros.push('Nome obrigatório');
  if (!(produto.preco > 0)) erros.push('Preço deve ser maior que zero');
  const estoqueValido = Number.isInteger(produto.estoque) && produto.estoque >= 0;
  if (!estoqueValido) erros.push('Estoque inválido');
  return erros;
}

/**
 * Valida e grava um produto.
 * @param {object} api - API injetada (json-server).
 * @param {object} dados - Dados do produto.
 * @returns {Promise<object>} Produto salvo, com id.
 * (Recusa com os erros separados por "; " se os dados forem inválidos.)
 */
export function cadastrarProduto(api, dados) {
  const erros = validarProduto(dados);
  if (erros.length > 0) return Promise.reject(new Error(erros.join('; ')));
  return api.criar(COLECAO_PRODUTOS, dados);
}

/**
 * Valida e atualiza um produto.
 * @param {object} api - API injetada (json-server).
 * @param {number} id - Id do produto.
 * @param {object} dados - Novos dados.
 * @returns {Promise<object>} Produto atualizado.
 * (Recusa com os erros separados por "; " se os dados forem inválidos.)
 */
export function atualizarProduto(api, id, dados) {
  const erros = validarProduto(dados);
  if (erros.length > 0) return Promise.reject(new Error(erros.join('; ')));
  return api.atualizar(COLECAO_PRODUTOS, id, dados);
}

/**
 * @param {object} api - API injetada (json-server).
 * @param {number} id - Id do produto a excluir.
 * @returns {Promise<boolean>} true se excluiu.
 */
export function removerProduto(api, id) {
  return api.remover(COLECAO_PRODUTOS, id);
}

/**
 * @param {object} api - API injetada (json-server).
 * @returns {Promise<object[]>} Todos os produtos.
 */
export function listarProdutos(api) {
  return api.listar(COLECAO_PRODUTOS);
}

/**
 * Indica se há estoque para a quantidade pedida.
 * @param {{estoque: number}} produto - Produto.
 * @param {number} quantidade - Quantidade desejada.
 * @returns {boolean} true se o estoque cobre a quantidade.
 */
export function temEstoque(produto, quantidade) {
  return produto.estoque >= quantidade;
}

/**
 * Monta a tela de produtos.
 * @param {object} api - API injetada (json-server).
 * @returns {HTMLElement} Seção da tela.
 */
export function criarTelaProduto(api) {
  return criarTelaCadastro({
    titulo: 'Produtos',
    campos: CAMPOS_PRODUTO,
    colunas: COLUNAS_PRODUTO,
    aoSalvar: (dados) => cadastrarProduto(api, dados),
    aoListar: () => listarProdutos(api),
    aoAtualizar: (id, dados) => atualizarProduto(api, id, dados),
    aoExcluir: (id) => removerProduto(api, id),
  });
}
