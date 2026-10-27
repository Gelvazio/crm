/** Cadastro de cliente: regras de validação, acesso à API e tela. */

import { criarTelaCadastro } from './tela.js';

export const COLECAO_CLIENTES = 'clientes';
export const IDADE_MINIMA = 0;
export const IDADE_MAXIMA = 120;
export const CAMPOS_CLIENTE = [
  { nome: 'nome', rotulo: 'Nome', tipo: 'text' },
  { nome: 'idade', rotulo: 'Idade', tipo: 'number' },
  { nome: 'cidade', rotulo: 'Cidade', tipo: 'text' },
  { nome: 'salario', rotulo: 'Salário', tipo: 'number' },
];
const COLUNAS_CLIENTE = [
  { chave: 'id', rotulo: 'ID' },
  { chave: 'nome', rotulo: 'Nome' },
  { chave: 'idade', rotulo: 'Idade' },
  { chave: 'cidade', rotulo: 'Cidade' },
  { chave: 'salario', rotulo: 'Salário' },
];

/**
 * Confere os dados de um cliente.
 * @param {{nome: string, idade: number, cidade: string, salario: number}} cliente - Dados.
 * @returns {string[]} Lista de erros (vazia quando está tudo certo).
 */
export function validarCliente(cliente) {
  const erros = [];
  if (!cliente.nome) erros.push('Nome obrigatório');
  const idadeValida = Number.isInteger(cliente.idade)
    && cliente.idade >= IDADE_MINIMA && cliente.idade <= IDADE_MAXIMA;
  if (!idadeValida) erros.push('Idade inválida');
  if (!cliente.cidade) erros.push('Cidade obrigatória');
  if (!(cliente.salario >= 0)) erros.push('Salário inválido');
  return erros;
}

/**
 * Valida e grava um cliente.
 * @param {object} api - API injetada (json-server).
 * @param {object} dados - Dados do cliente.
 * @returns {Promise<object>} Cliente salvo, com id.
 * (Recusa com os erros separados por "; " se os dados forem inválidos.)
 */
export function cadastrarCliente(api, dados) {
  const erros = validarCliente(dados);
  if (erros.length > 0) return Promise.reject(new Error(erros.join('; ')));
  return api.criar(COLECAO_CLIENTES, dados);
}

/**
 * Valida e atualiza um cliente.
 * @param {object} api - API injetada (json-server).
 * @param {number} id - Id do cliente.
 * @param {object} dados - Novos dados.
 * @returns {Promise<object>} Cliente atualizado.
 * (Recusa com os erros separados por "; " se os dados forem inválidos.)
 */
export function atualizarCliente(api, id, dados) {
  const erros = validarCliente(dados);
  if (erros.length > 0) return Promise.reject(new Error(erros.join('; ')));
  return api.atualizar(COLECAO_CLIENTES, id, dados);
}

/**
 * @param {object} api - API injetada (json-server).
 * @returns {Promise<object[]>} Todos os clientes.
 */
export function listarClientes(api) {
  return api.listar(COLECAO_CLIENTES);
}

/**
 * @param {object} api - API injetada (json-server).
 * @param {number} id - Id do cliente.
 * @returns {Promise<boolean>} true se removeu.
 */
export function removerCliente(api, id) {
  return api.remover(COLECAO_CLIENTES, id);
}

/**
 * Monta a tela de clientes.
 * @param {object} api - API injetada (json-server).
 * @returns {HTMLElement} Seção da tela.
 */
export function criarTelaCliente(api) {
  return criarTelaCadastro({
    titulo: 'Clientes',
    campos: CAMPOS_CLIENTE,
    colunas: COLUNAS_CLIENTE,
    aoSalvar: (dados) => cadastrarCliente(api, dados),
    aoListar: () => listarClientes(api),
    aoAtualizar: (id, dados) => atualizarCliente(api, id, dados),
    aoExcluir: (id) => removerCliente(api, id),
  });
}
