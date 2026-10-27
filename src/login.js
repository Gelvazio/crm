/**
 * Regra de autenticação. O usuário padrão (aluno / aluno) entra direto, sem consultar o banco;
 * os demais são procurados no repositório de usuários, recebido por parâmetro (injeção).
 */

import { estaAtivo } from './usuario.js';

export const USUARIO_PADRAO = 'aluno';
export const SENHA_PADRAO = 'aluno';
export const MOTIVO_CAMPOS_VAZIOS = 'Informe usuário e senha';
export const MOTIVO_NAO_ENCONTRADO = 'Usuário não encontrado';
export const MOTIVO_SENHA_INVALIDA = 'Senha inválida';
export const MOTIVO_INATIVO = 'Usuário inativo';
const STATUS_ATIVO = 1;

/**
 * Confere a senha e o status de um usuário já encontrado no banco.
 * @param {object|null} usuario - Usuário do banco (ou null).
 * @param {string} senha - Senha digitada.
 * @returns {{sucesso: boolean, usuario?: object, motivo?: string}} Resultado do login.
 */
export function avaliarUsuario(usuario, senha) {
  if (!usuario) return { sucesso: false, motivo: MOTIVO_NAO_ENCONTRADO };
  if (usuario.senha !== senha) return { sucesso: false, motivo: MOTIVO_SENHA_INVALIDA };
  if (!estaAtivo(usuario)) return { sucesso: false, motivo: MOTIVO_INATIVO };
  return { sucesso: true, usuario };
}

/**
 * Tenta autenticar um usuário.
 * @param {string} login - Usuário digitado.
 * @param {string} senha - Senha digitada.
 * @param {{buscarPorLogin: (login: string) => Promise<object|null>}} repositorio - Usuários.
 * @returns {Promise<{sucesso: boolean, usuario?: object, motivo?: string}>} Resultado do login.
 */
export function autenticar(login, senha, repositorio) {
  if (!login || !senha) {
    return Promise.resolve({ sucesso: false, motivo: MOTIVO_CAMPOS_VAZIOS });
  }

  const ehUsuarioPadrao = login === USUARIO_PADRAO && senha === SENHA_PADRAO;
  if (ehUsuarioPadrao) {
    const usuario = { id: 0, login: USUARIO_PADRAO, status: STATUS_ATIVO };
    return Promise.resolve({ sucesso: true, usuario });
  }

  return repositorio.buscarPorLogin(login).then((usuario) => avaliarUsuario(usuario, senha));
}

/**
 * Monta a tela de login: usuário, senha e botão empilhados e centralizados.
 * @param {(usuario: object) => void} aoEntrar - Chamada quando o login é aceito.
 * @param {{buscarPorLogin: Function}} repositorio - Repositório de usuários.
 * @returns {HTMLElement} Seção da tela.
 */
export function criarTelaLogin(aoEntrar, repositorio) {
  const secao = document.createElement('section');
  secao.className = 'cartao cartao--login';
  secao.innerHTML = `
    <h2>Acesso ao CRM</h2>
    <form class="formulario formulario--centralizado">
      <label class="campo">Usuário<input name="login" autocomplete="off"></label>
      <label class="campo">Senha<input name="senha" type="password"></label>
      <button class="botao" type="submit">Entrar</button>
    </form>
    <p class="mensagem"></p>`;
  const mensagem = secao.querySelector('.mensagem');

  secao.querySelector('form').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const { login, senha } = evento.target.elements;
    autenticar(login.value.trim(), senha.value, repositorio)
      .then((resultado) => {
        if (resultado.sucesso) return aoEntrar(resultado.usuario);
        mensagem.textContent = resultado.motivo;
      })
      .catch((erro) => {
        mensagem.textContent = erro.message;
      });
  });
  return secao;
}
