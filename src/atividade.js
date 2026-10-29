/** Liga o botão "Exportar PDF" e as abas "PRATICA AULA NN" da atividade. */

import { exportarPdf } from './pdf-atividade.js';
import { ativarAbas } from './abas.js';

document.querySelector('#botao-pdf').addEventListener('click', () => exportarPdf(document));
ativarAbas(document.querySelector('main'));
