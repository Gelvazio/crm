/**
 * Configuração do CRM: endereço do banco local (json-server) guardado no localStorage
 * e modal "Config" para informá-lo. Sem async/await: o fetch encadeia com .then/.catch.
 */
import { URL_BANCO_PADRAO } from './api.js';

export const CHAVE_URL_BANCO = 'crm:url-banco';
export const MSG_URL_VAZIA = 'Informe o endereço do banco';
export const MSG_URL_INVALIDA = 'Endereço inválido';
export const MSG_CONEXAO_OK = 'Conexão OK';
export const MSG_SEM_RESPOSTA = 'Sem resposta do banco';
const PROTOCOLOS_VALIDOS = ['http:', 'https:'];
const REGEX_BARRAS_FINAIS = /\/+$/;
const ROTA_TESTE = '/usuarios';

/**
 * Valida o endereço do banco.
 * @param {string} texto - Endereço digitado.
 * @returns {string[]} Lista de erros (vazia quando válido).
 */
export function validarUrlBanco(texto) {
  const valor = String(texto ?? '').trim();
  if (!valor) return [MSG_URL_VAZIA];
  try {
    const url = new URL(valor);
    return PROTOCOLOS_VALIDOS.includes(url.protocol) ? [] : [MSG_URL_INVALIDA];
  } catch {
    return [MSG_URL_INVALIDA];
  }
}

/**
 * Remove espaços e barras finais do endereço.
 * @param {string} texto - Endereço digitado.
 * @returns {string} Endereço normalizado.
 */
export function normalizarUrlBanco(texto) {
  return String(texto ?? '').trim().replace(REGEX_BARRAS_FINAIS, '');
}

/**
 * Lê o endereço salvo do banco.
 * @param {Storage} [armazenamento] - Armazenamento (padrão: localStorage).
 * @returns {string} Endereço salvo ou o padrão.
 */
export function lerUrlBanco(armazenamento = localStorage) {
  try {
    return armazenamento.getItem(CHAVE_URL_BANCO) || URL_BANCO_PADRAO;
  } catch {
    return URL_BANCO_PADRAO;
  }
}

/**
 * Valida e salva o endereço do banco.
 * @param {string} texto - Endereço digitado.
 * @param {Storage} [armazenamento] - Armazenamento (padrão: localStorage).
 * @returns {string} Endereço salvo, normalizado.
 * @throws {Error} Se o endereço for inválido.
 */
export function salvarUrlBanco(texto, armazenamento = localStorage) {
  const erros = validarUrlBanco(texto);
  if (erros.length) throw new Error(erros.join('; '));
  const url = normalizarUrlBanco(texto);
  armazenamento.setItem(CHAVE_URL_BANCO, url);
  return url;
}

/**
 * Testa se o banco responde no endereço informado.
 * @param {string} url - Endereço do banco.
 * @param {Function} [fetchFn] - fetch injetável.
 * @returns {Promise<boolean>} true se a resposta for ok.
 */
export function testarConexao(url, fetchFn = (...argumentos) => globalThis.fetch(...argumentos)) {
  return fetchFn(`${normalizarUrlBanco(url)}${ROTA_TESTE}`)
    .then((resposta) => Boolean(resposta.ok))
    .catch(() => false);
}

/**
 * Cria um elemento com classe e texto.
 * @param {string} tag - Nome da tag.
 * @param {string} classe - Classe CSS.
 * @param {string} texto - Texto interno.
 * @returns {HTMLElement} Elemento criado.
 */
function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  elemento.textContent = texto;
  return elemento;
}

/**
 * Cria um botão do modal.
 * @param {string} rotulo - Texto do botão.
 * @param {string} tipo - submit ou button.
 * @returns {HTMLButtonElement} Botão criado.
 */
function criarBotao(rotulo, tipo) {
  const botao = criarElemento('button', 'botao', rotulo);
  botao.type = tipo;
  if (tipo === 'button') botao.classList.add('botao--secundario');
  return botao;
}

/**
 * Monta o campo do endereço do banco.
 * @param {string} valor - Valor inicial.
 * @returns {{rotulo: HTMLLabelElement, entrada: HTMLInputElement}} Rótulo e input.
 */
function criarCampoUrl(valor) {
  const rotulo = criarElemento('label', 'campo', 'Caminho do banco de dados local');
  const entrada = document.createElement('input');
  entrada.name = 'urlBanco';
  entrada.value = valor;
  rotulo.append(entrada);
  return { rotulo, entrada };
}

/**
 * Cria o modal de configurações.
 * @param {Storage} [armazenamento] - Armazenamento (padrão: localStorage).
 * @param {Function} [fetchFn] - fetch injetável para o teste de conexão.
 * @returns {HTMLDialogElement} Diálogo com classe modal-config.
 */
export function criarModalConfig(armazenamento = localStorage, fetchFn = undefined) {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal-config';
  const formulario = document.createElement('form');
  const { rotulo, entrada } = criarCampoUrl(lerUrlBanco(armazenamento));
  const mensagem = criarElemento('p', 'mensagem', '');
  const salvar = criarBotao('Salvar', 'submit');
  const testar = criarBotao('Testar conexão', 'button');
  const fechar = criarBotao('Fechar', 'button');
  const acoes = criarElemento('div', 'modal-config__acoes', '');
  acoes.append(salvar, testar, fechar);
  formulario.append(rotulo, acoes, mensagem);
  dialogo.append(criarElemento('h2', '', 'Configurações'), formulario);

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    try {
      mensagem.textContent = `Endereço salvo: ${salvarUrlBanco(entrada.value, armazenamento)}`;
    } catch (erro) {
      mensagem.textContent = erro.message;
    }
  });
  testar.addEventListener('click', () => {
    testarConexao(entrada.value, fetchFn).then((ok) => {
      mensagem.textContent = ok ? MSG_CONEXAO_OK : MSG_SEM_RESPOSTA;
    });
  });
  fechar.addEventListener('click', () => dialogo.close());
  dialogo.armazenamento = armazenamento;
  return dialogo;
}

/**
 * Recarrega o campo com o endereço salvo e abre o modal.
 * @param {HTMLDialogElement} dialogo - Modal criado por criarModalConfig.
 */
export function abrirModalConfig(dialogo) {
  const entrada = dialogo.querySelector('input[name=urlBanco]');
  if (entrada) entrada.value = lerUrlBanco(dialogo.armazenamento);
  if (typeof dialogo.showModal === 'function') dialogo.showModal();
}
