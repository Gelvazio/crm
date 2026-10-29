// Aula 04 — formulário de cadastro usado nos testes de integração com Testing Library.

export const TAMANHO_MINIMO_SENHA = 6;
export const MSG_SENHA_CURTA = 'A senha deve ter no mínimo 6 dígitos';
export const MSG_SUCESSO = 'Cadastro realizado com sucesso';

/**
 * Cria o formulário de cadastro (nome, e-mail e senha).
 * O botão Cadastrar só habilita com todos os campos válidos.
 * @param {{aoCadastrar: function({nome: string, email: string, senha: string}): void}} opcoes
 * @returns {HTMLFormElement} Formulário pronto para ser inserido no DOM.
 */
export function criarFormularioCadastro({ aoCadastrar }) {
  const formulario = document.createElement('form');
  formulario.noValidate = true;
  formulario.innerHTML = `
    <h2>Cadastro</h2>
    <label for="nome">Nome</label>
    <input id="nome" type="text" />
    <label for="email">E-mail</label>
    <input id="email" type="email" />
    <label for="senha">Senha</label>
    <input id="senha" type="password" />
    <p role="alert" hidden></p>
    <button type="submit" disabled>Cadastrar</button>
    <p role="status" hidden></p>
  `;

  const campoNome = formulario.querySelector('#nome');
  const campoEmail = formulario.querySelector('#email');
  const campoSenha = formulario.querySelector('#senha');
  const aviso = formulario.querySelector('[role="alert"]');
  const status = formulario.querySelector('[role="status"]');
  const botao = formulario.querySelector('button');

  /**
   * Revalida os campos, atualizando aviso de senha e estado do botão.
   * @returns {void}
   */
  function atualizar() {
    const senhaCurta = campoSenha.value.length > 0 && campoSenha.value.length < TAMANHO_MINIMO_SENHA;
    aviso.hidden = !senhaCurta;
    aviso.textContent = senhaCurta ? MSG_SENHA_CURTA : '';

    const senhaValida = campoSenha.value.length >= TAMANHO_MINIMO_SENHA;
    const estaCompleto = campoNome.value.trim() !== '' && campoEmail.value.includes('@');
    botao.disabled = !(estaCompleto && senhaValida);
  }

  formulario.addEventListener('input', atualizar);

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (botao.disabled) return;

    aoCadastrar({ nome: campoNome.value, email: campoEmail.value, senha: campoSenha.value });
    status.textContent = MSG_SUCESSO;
    status.hidden = false;
  });

  return formulario;
}
