/** Ponto de entrada: liga a API, o login, o menu, o modal Config e as telas. */

import './estilo.css';
import { criarApi } from './api.js';
import { abrirModalAtividade, criarModalAtividade } from './atividade-modal.js';
import { criarTelaCliente } from './cliente.js';
import { criarTelaCondicao } from './condicao-pagamento.js';
import { abrirModalConfig, criarModalConfig, lerUrlBanco } from './config.js';
import { criarTelaLogin } from './login.js';
import { ITENS_MENU, marcarAtivo, montarMenu } from './menu.js';
import { criarTelaConsultaPedido } from './pedido-consulta.js';
import { criarTelaProduto } from './produto.js';
import { criarRepositorioUsuarios, criarTelaUsuario } from './usuario.js';

const ID_SAIR = 'sair';
const ID_CONFIG = 'config';
const ID_ATIVIDADE = 'atividade';
const ID_TELA_INICIAL = ITENS_MENU[0].id;

const api = criarApi({ obterUrlBase: () => lerUrlBanco() });
const modalConfig = criarModalConfig();
const modalAtividade = criarModalAtividade();
const raiz = document.querySelector('#app');
const menuArea = document.querySelector('#menu');
const tela = document.querySelector('#tela');

const TELAS = {
  clientes: () => criarTelaCliente(api),
  produtos: () => criarTelaProduto(api),
  pedidos: () => criarTelaConsultaPedido(api),
  condicoes: () => criarTelaCondicao(api),
  usuarios: () => criarTelaUsuario(api),
};

/** Volta para a tela de login (o usuário aluno / aluno entra direto). */
function mostrarLogin() {
  menuArea.replaceChildren();
  tela.replaceChildren(criarTelaLogin(mostrarSistema, criarRepositorioUsuarios(api)));
}

/** Mostra o menu e a primeira tela depois do login. */
function mostrarSistema() {
  let telaAtual = ID_TELA_INICIAL;
  const menu = montarMenu(ITENS_MENU, (id) => {
    if (id === ID_SAIR) return mostrarLogin();
    if (id === ID_CONFIG) {
      marcarAtivo(menu, telaAtual);
      return abrirModalConfig(modalConfig);
    }
    if (id === ID_ATIVIDADE) {
      marcarAtivo(menu, telaAtual);
      return abrirModalAtividade(modalAtividade);
    }
    telaAtual = id;
    tela.replaceChildren(TELAS[id]());
  });
  menuArea.replaceChildren(menu);
  tela.replaceChildren(TELAS[ID_TELA_INICIAL]());
  marcarAtivo(menu, ID_TELA_INICIAL);
}

document.body.append(modalConfig, modalAtividade);
raiz.hidden = false;
mostrarLogin();
