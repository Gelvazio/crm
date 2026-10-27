/**
 * Cliente do json-server: fala com as rotas REST do banco local (db.json) usando a Fetch API.
 * O fetch encadeia com .then (sem async/await e sem criar Promise na mão).
 */

export const URL_BANCO_PADRAO = 'http://localhost:3000';
export const MSG_SEM_CONEXAO = 'Não foi possível acessar o banco local. Confira o endereço em Config.';
const STATUS_NAO_ENCONTRADO = 404;
// O json-server --watch recarrega o db.json após cada gravação e derruba conexões por instantes.
const TENTATIVAS_REDE = 3;
const ESPERA_ENTRE_TENTATIVAS_MS = 300;
const CABECALHO_JSON = { 'Content-Type': 'application/json' };

/**
 * Cria o cliente da API.
 * @param {{fetchFn?: Function, obterUrlBase?: () => string}} [opcoes] - Dependências injetáveis:
 *   fetchFn (padrão: fetch do navegador) e obterUrlBase (padrão: URL_BANCO_PADRAO).
 * @returns {object} API com listar, buscarPorId, criar, atualizar e remover.
 */
export function criarApi({
  fetchFn = (...argumentos) => globalThis.fetch(...argumentos),
  obterUrlBase = () => URL_BANCO_PADRAO,
} = {}) {
  /**
   * Faz uma requisição e converte erro de rede em mensagem clara.
   * @param {string} metodo - Verbo HTTP.
   * @param {string} caminho - Caminho depois da URL base (ex.: /clientes/1).
   * @param {object} [corpo] - Corpo JSON.
   * @returns {Promise<Response>} Resposta crua.
   */
  function requisitar(metodo, caminho, corpo) {
    const opcoes = { method: metodo };
    if (corpo) Object.assign(opcoes, { headers: CABECALHO_JSON, body: JSON.stringify(corpo) });
    return tentar(() => fetchFn(`${obterUrlBase()}${caminho}`, opcoes), TENTATIVAS_REDE)
      .catch(() => {
        throw new Error(MSG_SEM_CONEXAO);
      });
  }

  /**
   * Repete a chamada quando a rede falha, esperando um pouco entre as tentativas.
   * @param {() => Promise<Response>} chamada - Faz o fetch.
   * @param {number} restantes - Tentativas que ainda podem ser feitas.
   * @returns {Promise<Response>} Resposta, ou a falha da última tentativa.
   */
  function tentar(chamada, restantes) {
    return chamada().catch((erro) => {
      if (restantes <= 1) throw erro;
      return new Promise((resolver) => setTimeout(resolver, ESPERA_ENTRE_TENTATIVAS_MS))
        .then(() => tentar(chamada, restantes - 1));
    });
  }

  /**
   * Lê o JSON de uma resposta; 404 vira null; outros erros viram exceção.
   * @param {Response} resposta - Resposta do fetch.
   * @returns {Promise<object|null>|null} Dados, ou null quando não existe.
   */
  function lerJson(resposta) {
    if (resposta.status === STATUS_NAO_ENCONTRADO) return null;
    if (!resposta.ok) throw new Error(`Falha no banco local (${resposta.status})`);
    return resposta.json();
  }

  return {
    listar: (colecao) => requisitar('GET', `/${colecao}`).then(lerJson),
    buscarPorId: (colecao, id) => requisitar('GET', `/${colecao}/${id}`).then(lerJson),
    criar: (colecao, registro) => requisitar('POST', `/${colecao}`, registro).then(lerJson),
    atualizar: (colecao, id, campos) =>
      requisitar('PATCH', `/${colecao}/${id}`, campos).then(lerJson),
    remover: (colecao, id) =>
      requisitar('DELETE', `/${colecao}/${id}`).then((resposta) => resposta.ok),
  };
}
