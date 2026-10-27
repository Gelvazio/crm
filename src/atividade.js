/** Liga o botão "Exportar PDF" da atividade. */

import { exportarPdf } from './pdf-atividade.js';

document.querySelector('#botao-pdf').addEventListener('click', () => exportarPdf(document));
