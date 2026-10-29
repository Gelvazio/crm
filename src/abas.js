/** Abas "PRATICA AULA NN" da atividade: mostra um painel por vez. */

/**
 * Seleciona uma aba: marca a aba e mostra só o painel dela.
 * @param {HTMLElement} raiz - Elemento que contém as abas e os painéis.
 * @param {HTMLElement} aba - Aba a selecionar.
 * @returns {void}
 */
export function selecionarAba(raiz, aba) {
  raiz.querySelectorAll('[role="tab"]').forEach((candidata) => {
    candidata.setAttribute('aria-selected', String(candidata === aba));
  });
  raiz.querySelectorAll('[role="tabpanel"]').forEach((painel) => {
    painel.hidden = painel.id !== aba.getAttribute('aria-controls');
  });
}

/**
 * Liga as abas: o clique seleciona a aba e leva a tela até o painel dela.
 * @param {HTMLElement} raiz - Elemento que contém as abas e os painéis.
 * @returns {void}
 */
export function ativarAbas(raiz) {
  const abas = [...raiz.querySelectorAll('[role="tab"]')];
  if (abas.length === 0) return;

  abas.forEach((aba) => {
    aba.addEventListener('click', () => {
      selecionarAba(raiz, aba);
      const painel = raiz.querySelector(`#${aba.getAttribute('aria-controls')}`);
      if (typeof painel.scrollIntoView === 'function') painel.scrollIntoView();
    });
  });

  const abaInicial = abas.find((aba) => aba.getAttribute('aria-selected') === 'true') ?? abas[0];
  selecionarAba(raiz, abaInicial);
}
