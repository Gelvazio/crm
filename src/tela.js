/**
 * Monta uma tela de cadastro genérica (formulário + tabela) a partir de uma descrição.
 * Cliente, produto e usuário reaproveitam este mesmo molde (Open/Closed).
 * aoSalvar e aoListar devolvem o resultado do fetch (encadeado com .then).
 */

const CLASSE_MENSAGEM = 'mensagem';

/**
 * Lê os campos do formulário e converte os numéricos.
 * @param {HTMLFormElement} formulario - Formulário da tela.
 * @param {{nome: string, tipo: string}[]} campos - Descrição dos campos.
 * @returns {object} Dados digitados.
 */
export function lerCampos(formulario, campos) {
  const dados = {};
  campos.forEach((campo) => {
    const valor = formulario.elements[campo.nome].value;
    dados[campo.nome] = campo.tipo === 'number' ? Number(valor) : valor.trim();
  });
  return dados;
}

/**
 * Cria o rótulo + input de um campo.
 * @param {{nome: string, rotulo: string, tipo: string}} campo - Descrição do campo.
 * @param {Document} documento - Documento onde criar.
 * @returns {HTMLLabelElement} Campo pronto.
 */
function criarCampo(campo, documento) {
  const rotulo = documento.createElement('label');
  rotulo.className = 'campo';
  rotulo.textContent = campo.rotulo;
  const entrada = documento.createElement('input');
  entrada.name = campo.nome;
  entrada.type = campo.tipo;
  entrada.autocomplete = 'off';
  rotulo.append(entrada);
  return rotulo;
}

/**
 * Cria a tabela com os registros.
 * @param {{chave: string, rotulo: string}[]} colunas - Colunas exibidas.
 * @param {object[]} registros - Linhas.
 * @param {Document} documento - Documento onde criar.
 * @returns {HTMLTableElement} Tabela preenchida.
 */
export function criarTabela(colunas, registros, documento) {
  const tabela = documento.createElement('table');
  tabela.className = 'tabela';
  const cabecalho = tabela.createTHead().insertRow();
  colunas.forEach((coluna) => {
    cabecalho.insertCell().textContent = coluna.rotulo;
  });
  const corpo = tabela.createTBody();
  registros.forEach((registro) => {
    const linha = corpo.insertRow();
    colunas.forEach((coluna) => {
      linha.insertCell().textContent = String(registro[coluna.chave]);
    });
  });
  return tabela;
}

/**
 * Cria um botão de ação de linha.
 * @param {string} texto - Texto do botão.
 * @param {string} classe - Classe CSS extra.
 * @param {Document} documento - Documento onde criar.
 * @returns {HTMLButtonElement} Botão pronto.
 */
function criarBotaoAcao(texto, classe, documento) {
  const botao = documento.createElement('button');
  botao.type = 'button';
  botao.className = `botao botao--secundario ${classe}`;
  botao.textContent = texto;
  return botao;
}

/**
 * Acrescenta a coluna Ações (Editar e Excluir) à tabela.
 * @param {{tabela: HTMLTableElement, registros: object[], documento: Document,
 *   aoEditar: (registro: object) => void, aoExcluir: (registro: object) => void}} contexto
 *   - Tabela já montada, seus registros e os tratadores de clique.
 */
function acrescentarAcoes({ tabela, registros, documento, aoEditar, aoExcluir }) {
  tabela.tHead.rows[0].insertCell().textContent = 'Ações';
  registros.forEach((registro, posicao) => {
    const editar = criarBotaoAcao('Editar', 'acao-editar', documento);
    const excluir = criarBotaoAcao('Excluir', 'acao-excluir', documento);
    editar.addEventListener('click', () => aoEditar(registro));
    excluir.addEventListener('click', () => aoExcluir(registro));
    tabela.tBodies[0].rows[posicao].insertCell().append(editar, excluir);
  });
}

/**
 * Monta a tela de cadastro.
 * @param {{titulo: string, campos: object[], colunas: object[],
 *   aoSalvar: (dados: object) => Promise, aoListar: () => Promise<object[]>,
 *   aoAtualizar?: (id: number, dados: object) => Promise,
 *   aoExcluir?: (id: number) => Promise}} descricao
 *   - O que a tela mostra e como salva/lista.
 * @param {Document} [documento] - Documento (injetável nos testes).
 * @returns {HTMLElement} Seção da tela.
 */
export function criarTelaCadastro(descricao, documento = document) {
  const secao = documento.createElement('section');
  secao.className = 'cartao';
  const titulo = documento.createElement('h2');
  titulo.textContent = descricao.titulo;
  const formulario = documento.createElement('form');
  formulario.className = 'formulario';
  descricao.campos.forEach((campo) => formulario.append(criarCampo(campo, documento)));
  const botao = documento.createElement('button');
  botao.className = 'botao';
  botao.type = 'submit';
  botao.textContent = 'Salvar';
  formulario.append(botao);
  const mensagem = documento.createElement('p');
  mensagem.className = CLASSE_MENSAGEM;
  const area = documento.createElement('div');

  const temAcoes = Boolean(descricao.aoAtualizar && descricao.aoExcluir);
  let idEmEdicao = null;

  /** Sai do modo edição: limpa o formulário e volta o botão para Salvar. */
  function encerrarEdicao() {
    idEmEdicao = null;
    formulario.reset();
    botao.textContent = 'Salvar';
  }

  /** @param {object} registro - Registro a carregar no formulário para editar. */
  function iniciarEdicao(registro) {
    idEmEdicao = registro.id;
    descricao.campos.forEach((campo) => {
      formulario.elements[campo.nome].value = registro[campo.nome];
    });
    botao.textContent = 'Atualizar';
    mensagem.textContent = '';
  }

  /** @param {object} registro - Registro a excluir. @returns {Promise} Exclui e redesenha. */
  function excluirRegistro(registro) {
    return descricao.aoExcluir(registro.id)
      .then(() => {
        if (idEmEdicao === registro.id) encerrarEdicao();
        return desenhar();
      })
      .catch(mostrarErro);
  }

  /** @returns {Promise} Redesenha a tabela com os dados atuais do banco. */
  function desenhar() {
    return descricao.aoListar().then((registros) => {
      const tabela = criarTabela(descricao.colunas, registros, documento);
      if (temAcoes) {
        acrescentarAcoes({
          tabela, registros, documento, aoEditar: iniciarEdicao, aoExcluir: excluirRegistro,
        });
      }
      area.replaceChildren(tabela);
    });
  }

  /** @param {Error} erro - Erro a mostrar abaixo do formulário. */
  function mostrarErro(erro) {
    mensagem.textContent = erro.message;
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = lerCampos(formulario, descricao.campos);
    const salvar = idEmEdicao === null
      ? descricao.aoSalvar(dados)
      : descricao.aoAtualizar(idEmEdicao, dados);
    salvar
      .then(() => {
        mensagem.textContent = '';
        encerrarEdicao();
        return desenhar();
      })
      .catch(mostrarErro);
  });

  secao.append(titulo, formulario, mensagem, area);
  desenhar().catch(mostrarErro);
  return secao;
}
