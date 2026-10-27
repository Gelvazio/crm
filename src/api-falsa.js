/**
 * API falsa em memória, com a mesma forma de api.js (listar, buscarPorId, criar, atualizar,
 * remover). Existe só para os testes: roda sem rede e sem json-server.
 */

const ID_INICIAL = 1;

/**
 * Cria uma API em memória.
 * @param {object} [dadosIniciais] - Coleções já existentes.
 * @returns {object} API com a mesma forma de criarApi, devolvendo resultados encadeáveis.
 */
export function criarApiFalsa(dadosIniciais = {}) {
  const dados = structuredClone(dadosIniciais);

  /** @param {string} colecao - Nome da coleção. @returns {object[]} Lista (cria se não existe). */
  function obterColecao(colecao) {
    if (!dados[colecao]) dados[colecao] = [];
    return dados[colecao];
  }

  /** @param {object[]} lista - Lista atual. @returns {number} Próximo id livre. */
  function proximoId(lista) {
    const maiorId = lista.reduce((maior, registro) => Math.max(maior, registro.id), 0);
    return Math.max(maiorId + 1, ID_INICIAL);
  }

  return {
    listar: (colecao) => Promise.resolve(structuredClone(obterColecao(colecao))),

    buscarPorId(colecao, id) {
      const registro = obterColecao(colecao).find((item) => item.id === id);
      return Promise.resolve(registro ? structuredClone(registro) : null);
    },

    criar(colecao, registro) {
      const lista = obterColecao(colecao);
      const novo = { ...registro, id: proximoId(lista) };
      lista.push(novo);
      return Promise.resolve(structuredClone(novo));
    },

    atualizar(colecao, id, campos) {
      const registro = obterColecao(colecao).find((item) => item.id === id);
      if (!registro) return Promise.resolve(null);
      Object.assign(registro, campos, { id });
      return Promise.resolve(structuredClone(registro));
    },

    remover(colecao, id) {
      const lista = obterColecao(colecao);
      const posicao = lista.findIndex((item) => item.id === id);
      if (posicao === -1) return Promise.resolve(false);
      lista.splice(posicao, 1);
      return Promise.resolve(true);
    },
  };
}
