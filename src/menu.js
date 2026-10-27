/** Menu do CRM: lista de telas e montagem da navegação. */

export const ITENS_MENU = [
  { id: 'clientes', rotulo: 'Clientes' },
  { id: 'produtos', rotulo: 'Produtos' },
  { id: 'pedidos', rotulo: 'Pedidos' },
  { id: 'condicoes', rotulo: 'Cond. Pagto' },
  { id: 'usuarios', rotulo: 'Usuários' },
  { id: 'atividade', rotulo: 'Atividade' },
  { id: 'config', rotulo: 'Config' },
  { id: 'sair', rotulo: 'Sair' },
];

/**
 * Marca apenas o item ativo (aria-current) dentro do menu.
 * @param {HTMLElement} menu - Elemento do menu.
 * @param {string} idAtivo - Id do item a marcar.
 */
export function marcarAtivo(menu, idAtivo) {
  menu.querySelectorAll('button').forEach((botao) => {
    if (botao.dataset.tela === idAtivo) botao.setAttribute('aria-current', 'page');
    else botao.removeAttribute('aria-current');
  });
}

/**
 * Monta o menu de navegação.
 * @param {{id: string, rotulo: string}[]} itens - Itens do menu.
 * @param {(id: string) => void} aoSelecionar - Chamada ao clicar em um item.
 * @returns {HTMLElement} Elemento <nav> pronto.
 */
export function montarMenu(itens, aoSelecionar) {
  const menu = document.createElement('nav');
  menu.className = 'menu';
  menu.setAttribute('aria-label', 'Menu do CRM');
  itens.forEach((item) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao botao--secundario';
    botao.dataset.tela = item.id;
    botao.textContent = item.rotulo;
    botao.addEventListener('click', () => {
      marcarAtivo(menu, item.id);
      aoSelecionar(item.id);
    });
    menu.append(botao);
  });
  return menu;
}
