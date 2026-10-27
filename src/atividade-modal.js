/** Modal "Atividade": mostra a atividade de SA (atividade-sa.html) sem sair do CRM. */

export const CAMINHO_ATIVIDADE = '/atividade-sa.html';

/**
 * Cria o modal da atividade (a página só é carregada quando o modal abre).
 * @returns {HTMLDialogElement} Diálogo com classe modal-atividade.
 */
export function criarModalAtividade() {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'modal-atividade';

  const cabecalho = document.createElement('div');
  cabecalho.className = 'modal-atividade__cabecalho';
  const titulo = document.createElement('h2');
  titulo.textContent = 'Atividade — Situação de Aprendizagem';
  const fechar = document.createElement('button');
  fechar.type = 'button';
  fechar.className = 'botao botao--secundario';
  fechar.textContent = 'Fechar';
  fechar.addEventListener('click', function () {
    dialogo.close();
  });
  cabecalho.append(titulo, fechar);

  const quadro = document.createElement('iframe');
  quadro.className = 'modal-atividade__quadro';
  quadro.title = 'Atividade de SA';

  dialogo.append(cabecalho, quadro);
  return dialogo;
}

/**
 * Carrega a atividade (na primeira vez) e abre o modal.
 * @param {HTMLDialogElement} dialogo - Modal criado por criarModalAtividade.
 */
export function abrirModalAtividade(dialogo) {
  const quadro = dialogo.querySelector('iframe');
  if (!quadro.getAttribute('src')) {
    quadro.setAttribute('src', CAMINHO_ATIVIDADE);
  }
  if (typeof dialogo.showModal === 'function') {
    dialogo.showModal();
  }
}
