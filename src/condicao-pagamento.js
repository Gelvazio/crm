/** Cadastro de condição de pagamento: validação, acesso à API e tela. */

// Importa o molde de tela de cadastro (formulário + tabela) usado por todos os cadastros.
import { criarTelaCadastro } from './tela.js';

// Nome da coleção no banco (json-server) onde as condições ficam guardadas.
export const COLECAO_CONDICOES = 'condicoes';
// Campos do formulário: o que a pessoa digita ao cadastrar uma condição.
export const CAMPOS_CONDICAO = [
  { nome: 'nome', rotulo: 'Nome', tipo: 'text' },
  { nome: 'parcelas', rotulo: 'Parcelas', tipo: 'number' },
];
// Colunas da tabela: o que a tela mostra de cada condição cadastrada.
const COLUNAS_CONDICAO = [
  { chave: 'id', rotulo: 'ID' },
  { chave: 'nome', rotulo: 'Nome' },
  { chave: 'parcelas', rotulo: 'Parcelas' },
];

/**
 * Confere os dados de uma condição de pagamento.
 * @param {{nome: string, parcelas: number}} condicao - Dados.
 * @returns {string[]} Lista de erros (vazia quando está tudo certo).
 */
export function validarCondicao(condicao) {
  // Começa sem erros; cada regra quebrada acrescenta uma mensagem nesta lista.
  const erros = [];
  // Regra 1: o nome é obrigatório (vazio ou ausente é erro).
  if (!condicao.nome) {
    erros.push('Nome obrigatório');
  }
  // Regra 2: parcelas precisa ser número inteiro e pelo menos 1.
  if (!Number.isInteger(condicao.parcelas) || condicao.parcelas < 1) {
    erros.push('Parcelas deve ser um inteiro maior que zero');
  }
  // Devolve a lista: vazia significa que os dados estão válidos.
  return erros;
}

/**
 * Valida e grava uma condição de pagamento.
 * @param {object} api - API injetada.
 * @param {object} dados - Dados da condição.
 * @returns {Promise<object>} Condição salva, com id (recusa se os dados forem inválidos).
 */
export function cadastrarCondicao(api, dados) {
  // Primeiro confere os dados com a validação.
  const erros = validarCondicao(dados);
  // Se houver erro, recusa a promessa com todas as mensagens juntas e não grava nada.
  if (erros.length > 0) {
    return Promise.reject(new Error(erros.join('; ')));
  }
  // Dados válidos: manda a API criar a condição na coleção e devolve o resultado.
  return api.criar(COLECAO_CONDICOES, dados);
}

/**
 * Valida e atualiza uma condição de pagamento.
 * @param {object} api - API injetada.
 * @param {number} id - Id da condição.
 * @param {object} dados - Novos dados.
 * @returns {Promise<object>} Condição atualizada (recusa se os dados forem inválidos).
 */
export function atualizarCondicao(api, id, dados) {
  // Confere os novos dados com a mesma validação do cadastro.
  const erros = validarCondicao(dados);
  // Se houver erro, recusa a promessa e não altera nada no banco.
  if (erros.length > 0) {
    return Promise.reject(new Error(erros.join('; ')));
  }
  // Dados válidos: manda a API atualizar a condição que tem esse id.
  return api.atualizar(COLECAO_CONDICOES, id, dados);
}

/**
 * @param {object} api - API injetada.
 * @param {number} id - Id da condição a excluir.
 * @returns {Promise<boolean>} true se excluiu.
 */
export function excluirCondicao(api, id) {
  // Pede para a API remover a condição desse id (true se existia, false se não).
  return api.remover(COLECAO_CONDICOES, id);
}

/**
 * @param {object} api - API injetada.
 * @returns {Promise<object[]>} Todas as condições de pagamento.
 */
export function listarCondicoes(api) {
  // Pede para a API devolver todas as condições da coleção.
  return api.listar(COLECAO_CONDICOES);
}

/**
 * Monta a tela de condições de pagamento.
 * @param {object} api - API injetada.
 * @returns {HTMLElement} Seção da tela.
 */
export function criarTelaCondicao(api) {
  // Entrega ao molde de cadastro o que mostrar e a função de cada ação da tela.
  return criarTelaCadastro({
    titulo: 'Condições de Pagamento',
    campos: CAMPOS_CONDICAO,
    colunas: COLUNAS_CONDICAO,
    // Botão Salvar: cadastra a condição digitada.
    aoSalvar: function (dados) {
      return cadastrarCondicao(api, dados);
    },
    // Busca as condições para a tela desenhar a tabela.
    aoListar: function () {
      return listarCondicoes(api);
    },
    // Botão Atualizar: grava as mudanças da condição em edição.
    aoAtualizar: function (id, dados) {
      return atualizarCondicao(api, id, dados);
    },
    // Botão Excluir de uma linha da tabela.
    aoExcluir: function (id) {
      return excluirCondicao(api, id);
    },
  });
}
