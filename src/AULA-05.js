// Aula 05 — tela de login e carrinho usados nos testes com fetch mockado.

export const URL_API = 'http://localhost:3000/api';
export const MSG_CARREGANDO = 'Carregando...';
export const MSG_SERVICO_INDISPONIVEL = 'Serviço indisponível, tente novamente';
export const MSG_NAO_ENCONTRADO = 'Recurso não encontrado';
export const MSG_SEM_CONEXAO = 'Sem conexão, tente novamente';
export const CHAVE_TOKEN = 'token';
export const CHAVE_CARRINHO = 'carrinho';

const STATUS_NAO_AUTORIZADO = 401;
const STATUS_NAO_ENCONTRADO = 404;
const STATUS_ERRO_SERVIDOR = 500;

/**
 * Envia as credenciais para a API de login.
 * @param {{email: string, senha: string}} credenciais - Dados digitados no formulário.
 * @returns {Promise<Response>} Resposta do servidor.
 * @throws {TypeError} Quando não há conexão (fetch rejeita).
 */
function enviarLogin(credenciais) {
  return fetch(`${URL_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciais),
  });
}

/**
 * Converte a resposta do login na mensagem exibida ao usuário.
 * Só lê o corpo JSON quando necessário (erros 5xx podem vir sem corpo).
 * @param {Response} resposta - Resposta do servidor.
 * @returns {Promise<string>} Mensagem de aviso.
 */
async function interpretarResposta(resposta) {
  if (resposta.status >= STATUS_ERRO_SERVIDOR) return MSG_SERVICO_INDISPONIVEL;
  if (resposta.status === STATUS_NAO_ENCONTRADO) return MSG_NAO_ENCONTRADO;

  const dados = await resposta.json();
  if (resposta.status === STATUS_NAO_AUTORIZADO) return dados.erro;
  if (!resposta.ok) return MSG_SERVICO_INDISPONIVEL;

  localStorage.setItem(CHAVE_TOKEN, dados.token);
  return `Bem-vindo, ${dados.nome}`;
}

/**
 * Monta a tela de login dentro do container informado.
 * @param {HTMLElement} container - Elemento que receberá o formulário.
 * @returns {void}
 */
export function montarTelaLogin(container) {
  container.innerHTML = `
    <form>
      <label>E-mail <input name="email" type="email"></label>
      <label>Senha <input name="senha" type="password"></label>
      <button type="submit">Entrar</button>
      <p role="status"></p>
    </form>
  `;

  const formulario = container.querySelector('form');
  const botao = formulario.querySelector('button');
  const aviso = formulario.querySelector('[role="status"]');

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    aviso.textContent = MSG_CARREGANDO;
    botao.disabled = true;

    const credenciais = {
      email: formulario.elements.email.value,
      senha: formulario.elements.senha.value,
    };

    try {
      const resposta = await enviarLogin(credenciais);
      aviso.textContent = await interpretarResposta(resposta);
    } catch {
      aviso.textContent = MSG_SEM_CONEXAO;
    } finally {
      botao.disabled = false;
    }
  });
}

/**
 * Lê o carrinho salvo no localStorage.
 * @returns {Array<{id: *, nome: string, preco: number}>} Itens; vazio se ausente ou inválido.
 */
export function lerCarrinho() {
  const texto = localStorage.getItem(CHAVE_CARRINHO);
  if (!texto) return [];

  try {
    const itens = JSON.parse(texto);
    return Array.isArray(itens) ? itens : [];
  } catch {
    return [];
  }
}

/**
 * Grava a lista de itens do carrinho.
 * @param {Array<object>} itens - Itens a gravar.
 * @returns {Array<object>} Os mesmos itens gravados.
 */
function salvarCarrinho(itens) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
  return itens;
}

/**
 * Adiciona um item ao carrinho.
 * @param {{id: *, nome: string, preco: number}} item - Item a adicionar.
 * @returns {Array<object>} Novo carrinho.
 */
export function adicionarAoCarrinho(item) {
  return salvarCarrinho([...lerCarrinho(), item]);
}

/**
 * Remove do carrinho o item com o id informado.
 * @param {*} id - Identificador do item.
 * @returns {Array<object>} Novo carrinho.
 */
export function removerDoCarrinho(id) {
  return salvarCarrinho(lerCarrinho().filter((item) => item.id !== id));
}

/**
 * Esvazia o carrinho.
 * @returns {void}
 */
export function limparCarrinho() {
  localStorage.removeItem(CHAVE_CARRINHO);
}
