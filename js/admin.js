/* ============================================================
   HOLAMBIER — Painel administrativo (simulação WordPress)
   SPA em hash-routing sobre o núcleo CMS (js/cms.js)
   ============================================================ */

(function () {
    'use strict';

    const AUTH_KEY = 'holambier_admin_sessao';
    const SENHA_PADRAO = 'holambier123';

    let estado = null;          // dados do CMS carregados
    let editando = null;        // cópia de trabalho da página no editor
    let ehNova = false;         // criando página nova (oculta "zona de perigo")
    let slugTocado = false;     // usuário editou o slug manualmente?
    let campoMidiaAlvo = null;  // id do input que receberá a imagem
    let confirmResolve = null;
    let autosaveTimer = null;

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));
    const esc = CMS.util.esc;
    const slugify = CMS.util.slugify;
    const tempoRelativo = CMS.util.tempoRelativo;
    const clonar = CMS.util.clonar;

    /* ========================================================
       CATÁLOGO DE BLOCOS
       ======================================================== */
    const TIPOS_BLOCO = {
        banner: {
            rotulo: '🏷️ Banner de abertura',
            icone: 'fa-panorama',
            novo: () => ({ tipo: 'banner', titulo: 'Novo banner', subtitulo: '', imagem: '', botaoTexto: '', botaoLink: '' })
        },
        texto: {
            rotulo: '📝 Texto',
            icone: 'fa-align-left',
            novo: () => ({ tipo: 'texto', subtitulo: '', conteudo: 'Digite aqui o texto desta seção.\n\nSepare parágrafos pulando uma linha em branco.' })
        },
        colunas: {
            rotulo: '🔢 Colunas com ícones',
            icone: 'fa-table-cells-large',
            novo: () => ({
                tipo: 'colunas', titulo: '',
                itens: [
                    { emoji: '✨', titulo: 'Item 1', texto: 'Descrição curta do item.' },
                    { emoji: '🌟', titulo: 'Item 2', texto: 'Descrição curta do item.' },
                    { emoji: '👍', titulo: 'Item 3', texto: 'Descrição curta do item.' }
                ]
            })
        },
        cartoes: {
            rotulo: '🃏 Cartões (itens em grade)',
            icone: 'fa-clone',
            novo: () => ({ tipo: 'cartoes', titulo: '', itens: [{ emoji: '🍺', titulo: 'Novo item', texto: '', imagem: '' }] })
        },
        imagem: {
            rotulo: '🖼️ Imagem',
            icone: 'fa-image',
            novo: () => ({ tipo: 'imagem', src: '', legenda: '', largura: 'estreita' })
        },
        galeria: {
            rotulo: '📸 Galeria de fotos',
            icone: 'fa-images',
            novo: () => ({ tipo: 'galeria', imagens: [''], legenda: '' })
        },
        botoes: {
            rotulo: '🔗 Botões de ação',
            icone: 'fa-hand-pointer',
            novo: () => ({ tipo: 'botoes', itens: [{ texto: 'Clique aqui', link: '', estilo: 'primario' }] })
        }
    };

    /* ========================================================
       HELPERS DE UI
       ======================================================== */
    function toast(msg, tipo = 'ok') {
        const wrap = $('#toastWrap');
        const el = document.createElement('div');
        el.className = `toast ${tipo === 'ok' ? '' : tipo}`;
        const icone = tipo === 'erro' ? 'fa-circle-exclamation' : tipo === 'info' ? 'fa-circle-info' : 'fa-circle-check';
        el.innerHTML = `<i class="fas ${icone}"></i><span>${esc(msg)}</span>`;
        wrap.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.4s';
            setTimeout(() => el.remove(), 400);
        }, 3400);
    }

    function confirmar(titulo, msg, okTexto = 'Excluir', perigo = true) {
        return new Promise((resolve) => {
            $('#confirmTitulo').textContent = titulo;
            $('#confirmMsg').innerHTML = msg;
            const ok = $('#confirmOk');
            ok.textContent = okTexto;
            ok.className = 'adm-btn ' + (perigo ? 'perigo' : 'primario');
            $('#modalConfirm').hidden = false;
            confirmResolve = resolve;
        });
    }

    function fecharConfirm(valor) {
        if (!$('#modalConfirm').hidden) {
            $('#modalConfirm').hidden = true;
            if (confirmResolve) { confirmResolve(valor); confirmResolve = null; }
        }
    }

    function copiar(texto) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(texto).then(() => toast('Link copiado para a área de transferência.'));
        } else {
            const ta = document.createElement('textarea');
            ta.value = texto;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            toast('Link copiado para a área de transferência.');
        }
    }

    function agoraISO() { return new Date().toISOString(); }

    /* ========================================================
       AUTENTICAÇÃO (simulada, client-side)
       ======================================================== */
    function logado() {
        return sessionStorage.getItem(AUTH_KEY) === '1';
    }

    function sair() {
        sessionStorage.removeItem(AUTH_KEY);
        mostrarLogin();
    }

    function mostrarLogin() {
        $('#app').hidden = true;
        $('#telaLogin').hidden = false;
        $('#loginDica').style.display = (estado.site.adminPass === SENHA_PADRAO) ? '' : 'none';
        $('#loginErro').hidden = true;
        $('#loginSenha').value = '';
        setTimeout(() => $('#loginUsuario').focus(), 50);
    }

    function mostrarApp() {
        $('#telaLogin').hidden = true;
        $('#app').hidden = false;
        $('#adminBarUser').textContent = estado.site.adminUser || 'admin';
        navegar();
    }

    /* ========================================================
       ROTEADOR
       ======================================================== */
    function rotaAtual() {
        const hash = (location.hash || '#painel').slice(1);
        return hash.split('/').filter(Boolean);
    }

    function navegar() {
        if (!logado()) { mostrarLogin(); return; }

        const rota = rotaAtual();
        const secao = rota[0] || 'painel';
        const rotasValidas = ['painel', 'paginas', 'midia', 'config'];
        const rotaMenu = (secao === 'paginas' && rota[1]) ? 'paginas' : secao;

        $$('.admin-sidebar nav a').forEach((a) => {
            a.classList.toggle('ativo', a.dataset.rota === rotaMenu);
        });

        if (!rotasValidas.includes(secao)) { location.hash = '#painel'; return; }

        if (secao === 'painel') viewPainel();
        else if (secao === 'paginas') {
            if (rota[1] === 'nova') viewEditor(null);
            else if (rota[1] === 'editar' && rota[2]) viewEditor(decodeURIComponent(rota[2]));
            else viewPaginas();
        }
        else if (secao === 'midia') viewMidia();
        else if (secao === 'config') viewConfig();

        window.scrollTo(0, 0);
    }

    /* ========================================================
       VIEW: PAINEL (dashboard)
       ======================================================== */
    function viewPainel() {
        const paginas = estado.paginas || [];
        const publicadas = paginas.filter((p) => p.status === 'publicada');
        const rascunhos = paginas.filter((p) => p.status !== 'publicada');
        const noMenu = paginas.filter((p) => p.status === 'publicada' && p.noMenu);
        const totalBlocos = paginas.reduce((s, p) => s + (p.blocos || []).length, 0);
        const recentes = [...paginas]
            .sort((a, b) => new Date(b.atualizadaEm || 0) - new Date(a.atualizadaEm || 0))
            .slice(0, 5);

        $('#adminConteudo').innerHTML = `
            <div class="adm-topo">
                <h1><i class="fas fa-gauge-high"></i> Painel</h1>
                <div class="adm-topo-acoes">
                    <a class="adm-btn secundario" href="index.html" target="_blank" rel="noopener"><i class="fas fa-up-right-from-square"></i> Ver site</a>
                    <a class="adm-btn primario" href="#paginas/nova"><i class="fas fa-plus"></i> Nova página</a>
                </div>
            </div>

            <div class="adm-notice verde">
                <strong>Bem-vindo ao Painel Holambier! 🍺</strong>
                Daqui você cria, edita e remove páginas do site sem precisar de código.
                As páginas novas aparecem no menu do site automaticamente.
            </div>

            <div class="adm-linha-cards">
                <div class="adm-stat verde">
                    <i class="fas fa-circle-check"></i>
                    <div><div class="adm-stat-num">${publicadas.length}</div><div class="adm-stat-rotulo">Publicadas</div></div>
                </div>
                <div class="adm-stat laranja">
                    <i class="fas fa-pencil"></i>
                    <div><div class="adm-stat-num">${rascunhos.length}</div><div class="adm-stat-rotulo">Rascunhos</div></div>
                </div>
                <div class="adm-stat">
                    <i class="fas fa-layer-group"></i>
                    <div><div class="adm-stat-num">${totalBlocos}</div><div class="adm-stat-rotulo">Blocos de conteúdo</div></div>
                </div>
                <div class="adm-stat roxo">
                    <i class="fas fa-images"></i>
                    <div><div class="adm-stat-num">${(estado.midia || []).length}</div><div class="adm-stat-rotulo">Imagens na mídia</div></div>
                </div>
            </div>

            <div class="adm-card">
                <h2>Páginas recentes</h2>
                <p class="adm-card-desc">Últimas páginas criadas ou editadas no painel.</p>
                ${recentes.length ? `
                <div class="adm-tabela-wrap">
                    <table class="adm-tabela">
                        <thead><tr><th>Título</th><th>Status</th><th>No menu</th><th>Última edição</th><th></th></tr></thead>
                        <tbody>
                            ${recentes.map((p) => `
                                <tr>
                                    <td><span class="titulo-pagina">${esc(p.titulo)}</span></td>
                                    <td>${badgeStatus(p.status)}</td>
                                    <td>${badgeMenu(p.noMenu)}</td>
                                    <td>${esc(tempoRelativo(p.atualizadaEm))}</td>
                                    <td><a class="adm-btn discreto" href="#paginas/editar/${encodeURIComponent(p.id)}"><i class="fas fa-pen"></i></a></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : '<p style="color:var(--wp-texto-fraco)">Nenhuma página ainda. Crie a primeira!</p>'}
            </div>

            <div class="adm-card">
                <h2><i class="fas fa-cloud-arrow-up" style="color:var(--wp-azul)"></i> Como publicar para todos os visitantes</h2>
                <p class="adm-card-desc">O painel salva suas alterações neste navegador. Para o mundo inteiro ver:</p>
                <ol style="margin-left:20px; font-size:0.88rem; display:grid; gap:6px;">
                    <li>Clique em <strong>“Publicar p/ o site”</strong> no menu lateral — o arquivo <code>cms-conteudo.json</code> é baixado.</li>
                    <li>Substitua o arquivo <code>cms-conteudo.json</code> na raiz do repositório (commit pelo GitHub).</li>
                    <li>Pronto — o site lê esse arquivo e exibe o conteúdo atualizado para todos. 🎉</li>
                </ol>
            </div>

            <div class="adm-card">
                <h2><i class="fas fa-circle-info" style="color:var(--wp-amarelo)"></i> Páginas no menu</h2>
                <p class="adm-card-desc">Atualmente <strong>${noMenu.length}</strong> página(s) do CMS aparecem no menu principal:
                ${noMenu.length ? noMenu.map((p) => `“${esc(p.titulo)}”`).join(', ') : 'nenhuma'}. Você pode ativar/desativar isso em cada página, no editor.</p>
            </div>
        `;
    }

    function badgeStatus(status) {
        return status === 'publicada'
            ? '<span class="badge publicada"><i class="fas fa-check"></i> Publicada</span>'
            : '<span class="badge rascunho"><i class="fas fa-pencil"></i> Rascunho</span>';
    }

    function badgeMenu(noMenu) {
        return noMenu
            ? '<span class="badge menu-sim"><i class="fas fa-list"></i> No menu</span>'
            : '<span class="badge menu-nao"><i class="fas fa-eye-slash"></i> Oculta</span>';
    }

    /* ========================================================
       VIEW: LISTA DE PÁGINAS
       ======================================================== */
    function viewPaginas(filtro = '') {
        const paginas = [...(estado.paginas || [])]
            .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

        const q = filtro.trim().toLowerCase();
        const lista = q
            ? paginas.filter((p) => p.titulo.toLowerCase().includes(q) || p.slug.includes(q))
            : paginas;

        $('#adminConteudo').innerHTML = `
            <div class="adm-topo">
                <h1><i class="fas fa-file-lines"></i> Páginas</h1>
                <div class="adm-topo-acoes">
                    <a class="adm-btn primario" href="#paginas/nova"><i class="fas fa-plus"></i> Adicionar Nova Página</a>
                </div>
            </div>

            <div class="adm-campo" style="max-width:340px">
                <input type="text" id="buscaPagina" placeholder="🔎 Buscar páginas…" value="${esc(filtro)}">
            </div>

            ${lista.length ? `
            <div class="adm-tabela-wrap">
                <table class="adm-tabela">
                    <thead>
                        <tr><th>Título</th><th>Status</th><th>Menu</th><th>Ordem</th><th>Última edição</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        ${lista.map((p) => `
                        <tr>
                            <td>
                                <span class="titulo-pagina">${esc(p.titulo) || '<em>(sem título)</em>'}</span>
                                <div class="abaixo">pagina.html?slug=${esc(p.slug)}</div>
                            </td>
                            <td>${badgeStatus(p.status)}</td>
                            <td>${badgeMenu(p.noMenu)}</td>
                            <td>${esc(p.ordem)}</td>
                            <td>${esc(tempoRelativo(p.atualizadaEm))}</td>
                            <td>
                                <div class="adm-acoes-linha">
                                    <a class="adm-btn discreto" href="#paginas/editar/${encodeURIComponent(p.id)}" title="Editar"><i class="fas fa-pen"></i> Editar</a>
                                    <a class="adm-btn discreto" href="pagina.html?slug=${encodeURIComponent(p.slug)}${p.status === 'publicada' ? '' : '&preview=1'}" target="_blank" title="Ver"><i class="fas fa-eye"></i> Ver</a>
                                    <button class="adm-btn discreto" data-acao="excluir-pagina" data-id="${esc(p.id)}" title="Excluir"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
            <p style="margin-top:12px; font-size:0.82rem; color:var(--wp-texto-fraco)">${lista.length} página(s) • ${paginas.length} no total</p>`
            : `<div class="adm-card" style="text-align:center; padding:44px">
                   <div style="font-size:2.6rem; margin-bottom:10px">📄</div>
                   <h2>Nenhuma página encontrada</h2>
                   <p class="adm-card-desc">${q ? 'Tente outro termo de busca.' : 'Clique em “Adicionar Nova Página” para criar a primeira.'}</p>
               </div>`}
        `;

        const busca = $('#buscaPagina');
        busca.addEventListener('input', () => {
            const tabela = $('#adminConteudo');
            const pos = window.scrollY;
            viewPaginas(busca.value);
            window.scrollTo(0, pos);
            $('#buscaPagina').focus();
        });
    }

    /* ========================================================
       VIEW: EDITOR DE PÁGINA (blocos)
       ======================================================== */
    function viewEditor(id) {
        slugTocado = false;

        if (id) {
            const pagina = (estado.paginas || []).find((p) => p.id === id);
            if (!pagina) {
                toast('Página não encontrada.', 'erro');
                location.hash = '#paginas';
                return;
            }
            editando = clonar(pagina);
            ehNova = false;
        } else {
            const maxOrdem = Math.max(0, ...(estado.paginas || []).map((p) => p.ordem || 0));
            editando = {
                id: 'p' + Date.now(),
                titulo: '',
                slug: '',
                status: 'rascunho',
                noMenu: true,
                ordem: maxOrdem + 10,
                criadaEm: agoraISO(),
                atualizadaEm: agoraISO(),
                blocos: [TIPOS_BLOCO.banner.novo(), TIPOS_BLOCO.texto.novo()]
            };
            ehNova = true;
            slugTocado = false;
        }

        renderEditor();
    }

    function renderEditor() {
        const e = editando;
        $('#adminConteudo').innerHTML = `
            <div class="adm-topo">
                <h1><i class="fas fa-file-pen"></i> ${e.titulo ? 'Editar página' : 'Nova página'}</h1>
                <div class="adm-topo-acoes">
                    <a class="adm-btn secundario" href="#paginas"><i class="fas fa-arrow-left"></i> Voltar</a>
                    <button class="adm-btn secundario" data-acao="visualizar"><i class="fas fa-eye"></i> Visualizar</button>
                    <button class="adm-btn primario" data-acao="salvar"><i class="fas fa-floppy-disk"></i> Salvar</button>
                </div>
            </div>

            <div class="editor-layout">
                <div class="editor-principal">
                    <div class="adm-card">
                        <input type="text" id="editorTitulo" class="editor-titulo-input"
                               placeholder="Adicionar título da página" value="${esc(e.titulo)}">
                        <p class="permalink">Endereço do site: <code>pagina.html?slug=<span id="permalinkSlug">${esc(e.slug)}</span></code>
                           <button class="adm-btn discreto" data-acao="slug-regen" title="Gerar a partir do título"><i class="fas fa-rotate"></i></button>
                        </p>
                        <div class="adm-grid-2">
                            <div class="adm-campo">
                                <label for="editorSlug">Slug (endereço amigável)</label>
                                <input type="text" id="editorSlug" value="${esc(e.slug)}">
                                <p class="ajuda">Letras minúsculas, números e hífens.</p>
                            </div>
                        </div>
                    </div>

                    <h2 style="font-size:1rem; margin:6px 0 12px; color:#1d2327">
                        <i class="fas fa-layer-group" style="color:var(--wp-azul)"></i> Conteúdo (${e.blocos.length} bloco${e.blocos.length === 1 ? '' : 's'})
                    </h2>

                    <div id="listaBlocos">${e.blocos.length ? e.blocos.map(renderBloco).join('') : `
                        <div class="vazio-blocos">
                            <p><strong>Página vazia.</strong><br>Adicione o primeiro bloco de conteúdo abaixo. ⬇️</p>
                        </div>`}
                    </div>

                    <div class="adicionar-bloco">
                        <span><i class="fas fa-plus"></i> Adicionar bloco:</span>
                        <select id="novoBlocoTipo">
                            ${Object.entries(TIPOS_BLOCO).map(([k, t]) => `<option value="${k}">${t.rotulo}</option>`).join('')}
                        </select>
                        <button class="adm-btn primario" data-acao="bloco-add">Adicionar</button>
                    </div>
                </div>

                <aside class="editor-lateral">
                    <div class="adm-card">
                        <h2><i class="fas fa-cloud-arrow-up"></i> Publicar</h2>
                        <div class="adm-campo">
                            <label for="editorStatus">Status</label>
                            <select id="editorStatus">
                                <option value="rascunho" ${e.status !== 'publicada' ? 'selected' : ''}>Rascunho</option>
                                <option value="publicada" ${e.status === 'publicada' ? 'selected' : ''}>Publicada</option>
                            </select>
                        </div>
                        <div class="adm-campo">
                            <label class="adm-campo-check">
                                <input type="checkbox" id="editorNoMenu" ${e.noMenu ? 'checked' : ''}>
                                Mostrar no menu do site
                            </label>
                        </div>
                        <div class="adm-campo">
                            <label for="editorOrdem">Ordem no menu</label>
                            <input type="number" id="editorOrdem" value="${esc(e.ordem)}">
                            <p class="ajuda">Menor = aparece antes.</p>
                        </div>
                        <button class="adm-btn primario largo" data-acao="salvar"><i class="fas fa-floppy-disk"></i> Salvar página</button>
                        <p style="text-align:center; font-size:0.75rem; color:var(--wp-texto-fraco); margin-top:8px" id="autosaveStatus">Alterações são salvas automaticamente.</p>
                    </div>

                    <div class="adm-card">
                        <h2><i class="fas fa-lightbulb" style="color:var(--wp-amarelo)"></i> Dicas</h2>
                        <p style="font-size:0.83rem; color:var(--wp-texto-fraco)">
                            • Monte a página combinando blocos: banner, textos, colunas e cartões.<br><br>
                            • Use a <strong>Mídia</strong> para enviar fotos e depois escolha-as nos blocos pelo botão <em>Mídia</em>.<br><br>
                            • Publique a página para ela aparecer no menu do site.
                        </p>
                    </div>

                    ${!ehNova ? `<div class="adm-card zona-perigo">
                        <h2><i class="fas fa-triangle-exclamation"></i> Zona de perigo</h2>
                        <p style="font-size:0.83rem; color:var(--wp-texto-fraco); margin-bottom:12px">A exclusão é permanente. A página sai do menu imediatamente.</p>
                        <button class="adm-btn perigo largo" data-acao="excluir-atual"><i class="fas fa-trash"></i> Mover para a lixeira</button>
                    </div>` : ''}
                </aside>
            </div>
        `;

        bindEditor();
    }

    /* --- render de um bloco do editor --- */
    function renderBloco(b, i) {
        const meta = TIPOS_BLOCO[b.tipo];
        let corpo = '';

        const campoTexto = (campo, label, valor, opts = {}) => `
            <div class="adm-campo">
                <label for="f-b${i}-${campo}">${label}</label>
                <input type="${opts.tipo || 'text'}" id="f-b${i}-${campo}" value="${esc(valor)}"
                       data-bloco="${i}" data-campo="${campo}" ${opts.attrs || ''}>
                ${opts.ajuda ? `<p class="ajuda">${opts.ajuda}</p>` : ''}
            </div>`;

        const campoImagem = (campo, label, valor, ajuda) => `
            <div class="adm-campo">
                <label for="f-b${i}-${campo}">${label}</label>
                ${valor ? `<img class="preview-mini" src="${esc(valor)}" alt="Prévia" onerror="this.style.display='none'">` : ''}
                <div class="campo-com-midia">
                    <input type="text" id="f-b${i}-${campo}" value="${esc(valor)}"
                           data-bloco="${i}" data-campo="${campo}" placeholder="URL da imagem…">
                    <button class="adm-btn secundario" data-acao="abrir-midia" data-alvo="f-b${i}-${campo}">
                        <i class="fas fa-images"></i> Mídia
                    </button>
                </div>
                ${ajuda ? `<p class="ajuda">${ajuda}</p>` : ''}
            </div>`;

        if (b.tipo === 'banner') {
            corpo = `
                ${campoTexto('titulo', 'Título', b.titulo)}
                ${campoTexto('subtitulo', 'Subtítulo', b.subtitulo)}
                ${campoImagem('imagem', 'Imagem de fundo (opcional)', b.imagem, 'Sem imagem, o banner usa o fundo verde da marca.')}
                <div class="adm-grid-2">
                    ${campoTexto('botaoTexto', 'Texto do botão (opcional)', b.botaoTexto)}
                    ${campoTexto('botaoLink', 'Link do botão', b.botaoLink, { attrs: 'placeholder="https://…"' })}
                </div>`;
        } else if (b.tipo === 'texto') {
            corpo = `
                ${campoTexto('subtitulo', 'Subtítulo da seção (opcional)', b.subtitulo)}
                <div class="adm-campo">
                    <label for="f-b${i}-conteudo">Texto</label>
                    <textarea id="f-b${i}-conteudo" data-bloco="${i}" data-campo="conteudo"
                        placeholder="Escreva o texto da seção…">${esc(b.conteudo)}</textarea>
                    <p class="ajuda">Separe parágrafos com uma linha em branco.</p>
                </div>`;
        } else if (b.tipo === 'colunas' || b.tipo === 'cartoes' || b.tipo === 'botoes') {
            const rotuloItem = b.tipo === 'botoes' ? 'Botão' : 'Item';
            corpo = `
                ${b.tipo !== 'botoes' ? campoTexto('titulo', 'Título da seção (opcional)', b.titulo) : ''}
                ${(b.itens || []).map((item, j) => `
                    <div class="bloco-item">
                        <div class="bloco-item-cab">
                            <span>${rotuloItem} ${j + 1}</span>
                            <button data-acao="item-del" data-bloco="${i}" data-item="${j}" title="Remover">
                                <i class="fas fa-xmark"></i>
                            </button>
                        </div>
                        ${b.tipo === 'botoes' ? `
                            <div class="adm-grid-3">
                                ${campoTextoSub(i, 'itens', j, 'texto', 'Texto', item.texto)}
                                ${campoTextoSub(i, 'itens', j, 'link', 'Link', item.link, 'https://…')}
                                <div class="adm-campo">
                                    <label for="f-b${i}-i${j}-estilo">Estilo</label>
                                    <select id="f-b${i}-i${j}-estilo" data-bloco="${i}" data-campo="itens" data-sub="${j}" data-subcampo="estilo">
                                        <option value="primario" ${item.estilo !== 'secundario' ? 'selected' : ''}>Verde/laranja (primário)</option>
                                        <option value="secundario" ${item.estilo === 'secundario' ? 'selected' : ''}>Contorno (secundário)</option>
                                    </select>
                                </div>
                            </div>` : `
                            <div class="adm-grid-3">
                                <div class="adm-campo">
                                    <label for="f-b${i}-i${j}-emoji">Emoji</label>
                                    <input type="text" id="f-b${i}-i${j}-emoji" value="${esc(item.emoji)}"
                                           data-bloco="${i}" data-campo="itens" data-sub="${j}" data-subcampo="emoji" maxlength="4">
                                </div>
                                ${campoTextoSub(i, 'itens', j, 'titulo', 'Título', item.titulo)}
                            </div>
                            <div class="adm-campo">
                                <label for="f-b${i}-i${j}-texto">Texto</label>
                                <textarea id="f-b${i}-i${j}-texto" rows="2" data-bloco="${i}" data-campo="itens" data-sub="${j}" data-subcampo="texto">${esc(item.texto)}</textarea>
                            </div>
                            ${b.tipo === 'cartoes' ? campoImagemSub(i, 'itens', j, 'imagem', 'Imagem do cartão (opcional)', item.imagem) : ''}
                        `}
                    </div>`).join('')}
                <button class="adm-btn secundario" data-acao="item-add" data-bloco="${i}">
                    <i class="fas fa-plus"></i> Adicionar ${rotuloItem.toLowerCase()}
                </button>`;
        } else if (b.tipo === 'imagem') {
            corpo = `
                ${campoImagem('src', 'Imagem', b.src)}
                ${campoTexto('legenda', 'Legenda (opcional)', b.legenda)}
                <div class="adm-campo">
                    <label for="f-b${i}-largura">Largura</label>
                    <select id="f-b${i}-largura" data-bloco="${i}" data-campo="largura">
                        <option value="estreita" ${b.largura !== 'total' ? 'selected' : ''}>Estreita (centro)</option>
                        <option value="total" ${b.largura === 'total' ? 'selected' : ''}>Largura total da área</option>
                    </select>
                </div>`;
        } else if (b.tipo === 'galeria') {
            corpo = `
                ${(b.imagens || []).map((src, j) => `
                    <div class="bloco-item">
                        <div class="bloco-item-cab">
                            <span>Foto ${j + 1}</span>
                            <button data-acao="galeria-del" data-bloco="${i}" data-item="${j}" title="Remover">
                                <i class="fas fa-xmark"></i>
                            </button>
                        </div>
                        ${campoImagemSub(i, 'imagens', j, '', 'URL da imagem', src)}
                    </div>`).join('')}
                <button class="adm-btn secundario" data-acao="galeria-add" data-bloco="${i}">
                    <i class="fas fa-plus"></i> Adicionar foto
                </button>
                ${campoTexto('legenda', 'Legenda da galeria (opcional)', b.legenda)}`;
        }

        return `
            <div class="bloco">
                <div class="bloco-cab">
                    <i class="fas ${meta.icone} tipo"></i>
                    <span class="nome-tipo">${meta.rotulo.replace(/^\S+\s/, '')}</span>
                    <span class="ordem-bloco">Bloco ${i + 1}</span>
                    <button data-acao="bloco-up" data-bloco="${i}" title="Mover para cima" ${i === 0 ? 'disabled' : ''}><i class="fas fa-arrow-up"></i></button>
                    <button data-acao="bloco-down" data-bloco="${i}" title="Mover para baixo" ${i === editando.blocos.length - 1 ? 'disabled' : ''}><i class="fas fa-arrow-down"></i></button>
                    <button class="excluir" data-acao="bloco-del" data-bloco="${i}" title="Remover bloco"><i class="fas fa-trash"></i></button>
                </div>
                <div class="bloco-corpo">${corpo}</div>
            </div>`;
    }

    /* campos dentro de itens (arrays de objetos) */
    function campoTextoSub(i, campo, j, sub, label, valor, placeholder = '') {
        return `<div class="adm-campo">
            <label for="f-b${i}-i${j}-${sub}">${label}</label>
            <input type="text" id="f-b${i}-i${j}-${sub}" value="${esc(valor)}" placeholder="${placeholder}"
                   data-bloco="${i}" data-campo="${campo}" data-sub="${j}" data-subcampo="${sub}">
        </div>`;
    }

    function campoImagemSub(i, campo, j, sub, label, valor) {
        const id = `f-b${i}-i${j}-${sub || 'img'}`;
        const dataAttrs = `data-bloco="${i}" data-campo="${campo}" data-sub="${j}"${sub ? ` data-subcampo="${sub}"` : ''}`;
        return `<div class="adm-campo">
            <label for="${id}">${label}</label>
            ${valor ? `<img class="preview-mini" src="${esc(valor)}" alt="Prévia" onerror="this.style.display='none'">` : ''}
            <div class="campo-com-midia">
                <input type="text" id="${id}" value="${esc(valor)}" ${dataAttrs} placeholder="URL da imagem…">
                <button class="adm-btn secundario" data-acao="abrir-midia" data-alvo="${id}">
                    <i class="fas fa-images"></i> Mídia
                </button>
            </div>
        </div>`;
    }

    /* --- eventos do editor (delegados) --- */
    function bindEditor() {
        const conteudo = $('#adminConteudo');

        conteudo.oninput = (ev) => {
            const t = ev.target;

            if (t.id === 'editorTitulo') {
                editando.titulo = t.value;
                if (!slugTocado) {
                    editando.slug = slugify(t.value);
                    $('#editorSlug').value = editando.slug;
                }
                $('#permalinkSlug').textContent = editando.slug;
                agendarAutosave();
                return;
            }
            if (t.id === 'editorSlug') {
                slugTocado = true;
                editando.slug = slugify(t.value);
                t.value = editando.slug;
                $('#permalinkSlug').textContent = editando.slug;
                agendarAutosave();
                return;
            }
            if (t.id === 'editorStatus') { editando.status = t.value; agendarAutosave(); return; }
            if (t.id === 'editorNoMenu') { editando.noMenu = t.checked; agendarAutosave(); return; }
            if (t.id === 'editorOrdem') { editando.ordem = parseInt(t.value, 10) || 0; agendarAutosave(); return; }

            if (t.dataset.bloco !== undefined) {
                const bi = parseInt(t.dataset.bloco, 10);
                const campo = t.dataset.campo;
                const bloco = editando.blocos[bi];
                if (!bloco) return;

                if (t.dataset.subcampo) {
                    bloco[campo][parseInt(t.dataset.sub, 10)][t.dataset.subcampo] = t.value;
                } else if (t.dataset.sub !== undefined) {
                    bloco[campo][parseInt(t.dataset.sub, 10)] = t.value;
                } else {
                    bloco[campo] = t.type === 'checkbox' ? t.checked : t.value;
                }
                agendarAutosave();
            }
        };

        conteudo.onchange = (ev) => conteudo.oninput(ev);

        conteudo.onclick = async (ev) => {
            const btn = ev.target.closest('[data-acao]');
            if (!btn) return;
            const acao = btn.dataset.acao;
            const i = parseInt(btn.dataset.bloco, 10);

            switch (acao) {
                case 'salvar':
                    salvarPagina(true);
                    break;

                case 'visualizar':
                    salvarPagina(false);
                    window.open(`pagina.html?slug=${encodeURIComponent(editando.slug)}&preview=1`, '_blank');
                    break;

                case 'slug-regen':
                    editando.slug = slugify(editando.titulo);
                    slugTocado = false;
                    $('#editorSlug').value = editando.slug;
                    $('#permalinkSlug').textContent = editando.slug;
                    agendarAutosave();
                    toast('Slug regenerado a partir do título.', 'info');
                    break;

                case 'bloco-add': {
                    const tipo = $('#novoBlocoTipo').value;
                    editando.blocos.push(TIPOS_BLOCO[tipo].novo());
                    comScroll(() => renderEditor());
                    agendarAutosave();
                    break;
                }

                case 'bloco-up':
                    if (i > 0) {
                        [editando.blocos[i - 1], editando.blocos[i]] = [editando.blocos[i], editando.blocos[i - 1]];
                        comScroll(() => renderEditor());
                        agendarAutosave();
                    }
                    break;

                case 'bloco-down':
                    if (i < editando.blocos.length - 1) {
                        [editando.blocos[i + 1], editando.blocos[i]] = [editando.blocos[i], editando.blocos[i + 1]];
                        comScroll(() => renderEditor());
                        agendarAutosave();
                    }
                    break;

                case 'bloco-del': {
                    const ok = await confirmar('Remover bloco?', 'Este bloco de conteúdo será removido da página.', 'Remover');
                    if (!ok) return;
                    editando.blocos.splice(i, 1);
                    comScroll(() => renderEditor());
                    agendarAutosave();
                    toast('Bloco removido.');
                    break;
                }

                case 'item-add': {
                    const bloco = editando.blocos[i];
                    if (bloco.tipo === 'colunas') bloco.itens.push({ emoji: '✨', titulo: 'Novo item', texto: '' });
                    else if (bloco.tipo === 'cartoes') bloco.itens.push({ emoji: '🍺', titulo: 'Novo item', texto: '', imagem: '' });
                    else if (bloco.tipo === 'botoes') bloco.itens.push({ texto: 'Botão', link: '', estilo: 'primario' });
                    comScroll(() => renderEditor());
                    agendarAutosave();
                    break;
                }

                case 'item-del':
                    editando.blocos[i].itens.splice(parseInt(btn.dataset.item, 10), 1);
                    comScroll(() => renderEditor());
                    agendarAutosave();
                    break;

                case 'galeria-add':
                    editando.blocos[i].imagens.push('');
                    comScroll(() => renderEditor());
                    agendarAutosave();
                    break;

                case 'galeria-del':
                    editando.blocos[i].imagens.splice(parseInt(btn.dataset.item, 10), 1);
                    comScroll(() => renderEditor());
                    agendarAutosave();
                    break;

                case 'abrir-midia':
                    abrirPicker(btn.dataset.alvo);
                    break;

                case 'excluir-atual':
                    await excluirPagina(editando.id, true);
                    break;
            }
        };
    }

    function comScroll(fn) {
        const y = window.scrollY;
        fn();
        window.scrollTo(0, y);
    }

    function slugUnico(slug, idAtual) {
        let base = slug || 'pagina';
        let candidato = base;
        let n = 2;
        while ((estado.paginas || []).some((p) => p.slug === candidato && p.id !== idAtual)) {
            candidato = `${base}-${n++}`;
        }
        return candidato;
    }

    function salvarPagina(mostrarToast) {
        if (!editando.titulo.trim()) {
            toast('Dê um título à página antes de salvar.', 'erro');
            $('#editorTitulo').focus();
            return false;
        }
        if (!editando.slug) editando.slug = slugify(editando.titulo);
        editando.slug = slugUnico(editando.slug, editando.id);
        editando.atualizadaEm = agoraISO();

        const idx = (estado.paginas || []).findIndex((p) => p.id === editando.id);
        if (idx >= 0) estado.paginas[idx] = clonar(editando);
        else estado.paginas.push(clonar(editando));

        if (CMS.save(estado)) {
            if (mostrarToast) toast('Página salva com sucesso! 🎉');
            $('#permalinkSlug').textContent = editando.slug;
            return true;
        }
        toast('Erro ao salvar — armazenamento cheio? Remova imagens grandes da Mídia.', 'erro');
        return false;
    }

    function agendarAutosave() {
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(() => {
            if (!editando) return;
            if (!editando.titulo.trim()) return; // sem título ainda: nada a salvar
            salvarPagina(false);
            const st = $('#autosaveStatus');
            if (st) st.textContent = `✓ Salvo automaticamente às ${new Date().toLocaleTimeString('pt-BR')}`;
        }, 900);
    }

    async function excluirPagina(id, voltar) {
        const pag = (estado.paginas || []).find((p) => p.id === id);
        const ok = await confirmar(
            'Excluir página?',
            `A página <strong>${esc(pag ? pag.titulo : id)}</strong> será excluída permanentemente e sairá do menu do site.`,
            'Excluir definitivamente'
        );
        if (!ok) return false;

        estado.paginas = estado.paginas.filter((p) => p.id !== id);
        CMS.save(estado);
        toast('Página excluída.');
        if (voltar) location.hash = '#paginas';
        return true;
    }

    /* ========================================================
       VIEW: MÍDIA
       ======================================================== */
    function viewMidia() {
        const midia = estado.midia || [];
        $('#adminConteudo').innerHTML = `
            <div class="adm-topo">
                <h1><i class="fas fa-images"></i> Mídia</h1>
            </div>

            <div class="adm-notice">
                <strong>Biblioteca de imagens</strong>
                Envie fotos do computador (são otimizadas automaticamente) ou adicione por URL.
                Depois, use o botão <em>Mídia</em> dentro dos blocos do editor para escolhê-las.
            </div>

            <div class="adm-card">
                <div class="midia-upload">
                    <label class="adm-btn secundario" style="cursor:pointer">
                        <i class="fas fa-upload"></i> Enviar do computador
                        <input type="file" id="midiaUpload" accept="image/*" multiple hidden>
                    </label>
                    <span style="color:var(--wp-texto-fraco); font-size:0.8rem">JPG, PNG ou WebP • redimensionamos para máx. 1100px</span>
                </div>
                <div class="campo-com-midia" style="max-width:560px">
                    <input type="url" id="midiaUrl" placeholder="Ou cole uma URL de imagem (https://…)">
                    <button class="adm-btn primario" data-acao="midia-url"><i class="fas fa-link"></i> Adicionar</button>
                </div>
            </div>

            ${midia.length ? `
            <div class="midia-grid">
                ${midia.map((m) => `
                <div class="midia-item">
                    <img src="${esc(m.url)}" alt="${esc(m.nome)}" loading="lazy" data-midia-foto>
                    <div class="midia-item-info">
                        <div class="nome" title="${esc(m.nome)}">${esc(m.nome)}</div>
                        <div class="detalhe">${esc(m.tamanho || '—')} • ${esc(tempoRelativo(m.data))}</div>
                        <div class="midia-acoes">
                            <button class="adm-btn secundario pequeno" data-acao="midia-copiar" data-id="${esc(m.id)}"><i class="fas fa-copy"></i></button>
                            <button class="adm-btn secundario pequeno" data-acao="midia-excluir" data-id="${esc(m.id)}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>`).join('')}
            </div>`
            : `<div class="adm-card" style="text-align:center; padding:44px">
                   <div style="font-size:2.6rem; margin-bottom:10px">🖼️</div>
                   <h2>Nenhuma imagem ainda</h2>
                   <p class="adm-card-desc">Envie fotos do computador ou adicione por URL acima.</p>
               </div>`}
        `;

        bindMidia();
    }

    function bindMidia() {
        const conteudo = $('#adminConteudo');
        const inputUpload = $('#midiaUpload');

        if (inputUpload) {
            inputUpload.addEventListener('change', async () => {
                const arquivos = Array.from(inputUpload.files || []);
                if (!arquivos.length) return;

                toast(`Processando ${arquivos.length} imagem(ns)…`, 'info');
                const novas = [];
                for (const file of arquivos) {
                    try {
                        const dataUrl = await comprimirImagem(file);
                        const kb = Math.round((dataUrl.length * 0.75) / 1024);
                        novas.push({
                            id: 'm' + Date.now() + Math.random().toString(36).slice(2, 6),
                            nome: file.name,
                            url: dataUrl,
                            tamanho: kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`,
                            data: agoraISO()
                        });
                    } catch (e) {
                        toast(`Falha ao processar “${file.name}”.`, 'erro');
                    }
                }
                estado.midia.push(...novas);
                if (CMS.save(estado)) {
                    toast('Imagens adicionadas à mídia! 🎉');
                    viewMidia();
                } else {
                    estado.midia = estado.midia.filter((m) => !novas.some((n) => n.id === m.id));
                    toast('Armazenamento cheio — remova imagens antes de enviar novas.', 'erro');
                }
            });
        }

        conteudo.onclick = async (ev) => {
            const btn = ev.target.closest('[data-acao]');
            if (!btn) return;

            if (btn.dataset.acao === 'midia-url') {
                const input = $('#midiaUrl');
                const url = input.value.trim();
                if (!url) { toast('Cole uma URL primeiro.', 'erro'); return; }
                estado.midia.push({
                    id: 'm' + Date.now() + Math.random().toString(36).slice(2, 6),
                    nome: url.split('/').pop()?.split('?')[0] || 'imagem',
                    url,
                    tamanho: '—',
                    data: agoraISO()
                });
                CMS.save(estado);
                toast('Imagem adicionada!');
                viewMidia();
            }

            if (btn.dataset.acao === 'midia-copiar') {
                const m = (estado.midia || []).find((x) => x.id === btn.dataset.id);
                if (m) copiar(m.url);
            }

            if (btn.dataset.acao === 'midia-excluir') {
                const m = (estado.midia || []).find((x) => x.id === btn.dataset.id);
                const ok = await confirmar('Excluir imagem?', `“${esc(m ? m.nome : '')}” sairá da biblioteca (páginas que a usam manterão o endereço).`, 'Excluir');
                if (!ok) return;
                estado.midia = estado.midia.filter((x) => x.id !== btn.dataset.id);
                CMS.save(estado);
                toast('Imagem removida.');
                viewMidia();
            }
        };
    }

    function comprimirImagem(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
                const max = 1100;
                let w = img.naturalWidth;
                let h = img.naturalHeight;
                if (w > max) { h = Math.round(h * max / w); w = max; }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(objectUrl);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('imagem inválida')); };
            img.src = objectUrl;
        });
    }

    /* ========================================================
       SELETOR DE MÍDIA (picker)
       ======================================================== */
    function abrirPicker(inputId) {
        campoMidiaAlvo = inputId;
        const grid = $('#midiaPickerGrid');
        const midia = estado.midia || [];

        grid.innerHTML = midia.length
            ? midia.map((m) => `
                <button class="midia-picker-item" data-url="${esc(m.url)}" title="${esc(m.nome)}">
                    <img src="${esc(m.url)}" alt="${esc(m.nome)}">
                </button>`).join('')
            : '<p class="midia-picker-vazio">Nenhuma imagem na biblioteca.<br>Envie fotos na seção <strong>Mídia</strong> ou use uma URL abaixo.</p>';

        $('#midiaPickerUrl').value = '';
        $('#modalMidia').hidden = false;
    }

    function pickImagem(url) {
        if (!campoMidiaAlvo) return;
        const input = document.getElementById(campoMidiaAlvo);
        if (input) {
            input.value = url;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        $('#modalMidia').hidden = true;
        campoMidiaAlvo = null;
        toast('Imagem aplicada ao bloco.');
    }

    /* ========================================================
       VIEW: CONFIGURAÇÕES
       ======================================================== */
    function viewConfig() {
        const s = estado.site;
        const kb = Math.round(JSON.stringify(estado).length / 1024);

        $('#adminConteudo').innerHTML = `
            <div class="adm-topo">
                <h1><i class="fas fa-gear"></i> Configurações</h1>
                <div class="adm-topo-acoes">
                    <button class="adm-btn primario" data-acao="config-salvar"><i class="fas fa-floppy-disk"></i> Salvar alterações</button>
                </div>
            </div>

            <div class="adm-card">
                <h2>Identidade do site</h2>
                <p class="adm-card-desc">Informações usadas pelo painel e pelo conteúdo do site.</p>
                <div class="adm-grid-2">
                    <div class="adm-campo">
                        <label for="cfg-titulo">Nome do site</label>
                        <input type="text" id="cfg-titulo" value="${esc(s.titulo)}" data-config="titulo">
                    </div>
                    <div class="adm-campo">
                        <label for="cfg-slogan">Slogan</label>
                        <input type="text" id="cfg-slogan" value="${esc(s.slogan)}" data-config="slogan">
                    </div>
                </div>
                <div class="adm-grid-2">
                    <div class="adm-campo">
                        <label for="cfg-cardapio">Link do cardápio (Hubt)</label>
                        <input type="url" id="cfg-cardapio" value="${esc(s.cardapio)}" data-config="cardapio">
                    </div>
                    <div class="adm-campo">
                        <label for="cfg-whatsapp">WhatsApp (só números, com DDI+DDD)</label>
                        <input type="text" id="cfg-whatsapp" value="${esc(s.whatsapp)}" data-config="whatsapp" placeholder="5519996617607">
                    </div>
                </div>
                <div class="adm-campo">
                    <label for="cfg-whatsapp-msg">Mensagem padrão do WhatsApp</label>
                    <input type="text" id="cfg-whatsapp-msg" value="${esc(s.whatsappMsg)}" data-config="whatsappMsg">
                </div>
                <div class="adm-campo">
                    <label for="cfg-instagram">Instagram</label>
                    <input type="url" id="cfg-instagram" value="${esc(s.instagram)}" data-config="instagram">
                </div>
                <div class="adm-grid-2">
                    <div class="adm-campo">
                        <label for="cfg-google">Link “Avalie no Google”</label>
                        <input type="url" id="cfg-google" value="${esc(s.googleReview)}" data-config="googleReview">
                    </div>
                    <div class="adm-campo">
                        <label for="cfg-tripadvisor">Link do TripAdvisor</label>
                        <input type="url" id="cfg-tripadvisor" value="${esc(s.tripadvisor)}" data-config="tripadvisor">
                    </div>
                </div>
            </div>

            <div class="adm-card">
                <h2>Acesso ao painel</h2>
                <p class="adm-card-desc">Credenciais usadas nesta tela de login (simulação — armazenadas apenas neste navegador).</p>
                <div class="adm-grid-2">
                    <div class="adm-campo">
                        <label for="cfg-user">Usuário</label>
                        <input type="text" id="cfg-user" value="${esc(s.adminUser)}" data-config="adminUser">
                    </div>
                    <div class="adm-campo">
                        <label for="cfg-pass">Senha</label>
                        <input type="text" id="cfg-pass" value="${esc(s.adminPass)}" data-config="adminPass">
                    </div>
                </div>
            </div>

            <div class="adm-card">
                <h2>Conteúdo do site</h2>
                <p class="adm-card-desc">Backup, restauração e publicação. Tamanho atual do conteúdo: ~${kb} KB.</p>
                <div class="adm-topo-acoes">
                    <button class="adm-btn secundario" data-acao="config-exportar"><i class="fas fa-download"></i> Exportar conteúdo (JSON)</button>
                    <label class="adm-btn secundario" style="cursor:pointer">
                        <i class="fas fa-upload"></i> Importar conteúdo
                        <input type="file" id="cfgImport" accept="application/json" hidden>
                    </label>
                    <button class="adm-btn perigo" data-acao="config-reset"><i class="fas fa-rotate-left"></i> Restaurar padrão</button>
                </div>
            </div>

            <div class="adm-card zona-perigo">
                <h2><i class="fas fa-circle-info"></i> Sobre este painel</h2>
                <p style="font-size:0.86rem; color:var(--wp-texto-fraco)">
                    Este é um sistema de gerenciamento <strong>sem código</strong> inspirado no WordPress, feito para o site estático da Holambier.
                    As alterações ficam salvas no <strong>localStorage deste navegador</strong> e as páginas criadas aparecem no menu do site imediatamente
                    (neste navegador). Para publicar para todos os visitantes, use <strong>“Publicar p/ o site”</strong> no menu lateral
                    e substitua o arquivo <code>cms-conteudo.json</code> no repositório.
                </p>
            </div>
        `;

        bindConfig();
    }

    function bindConfig() {
        const conteudo = $('#adminConteudo');

        conteudo.oninput = (ev) => {
            const t = ev.target;
            if (t.dataset.config) {
                estado.site[t.dataset.config] = t.value;
            }
        };

        conteudo.onclick = async (ev) => {
            const btn = ev.target.closest('[data-acao]');
            if (!btn) return;

            if (btn.dataset.acao === 'config-salvar') {
                if (CMS.save(estado)) toast('Configurações salvas! ✓');
                else toast('Erro ao salvar configurações.', 'erro');
            }

            if (btn.dataset.acao === 'config-exportar') {
                exportarPublicacao();
            }

            if (btn.dataset.acao === 'config-reset') {
                const ok = await confirmar(
                    'Restaurar conteúdo padrão?',
                    'Todas as páginas, mídias e configurações salvas neste navegador serão substituídas pelo conteúdo de fábrica.',
                    'Restaurar tudo'
                );
                if (!ok) return;
                estado = CMS.reset();
                toast('Conteúdo restaurado ao padrão.', 'info');
                viewConfig();
            }
        };

        const importInput = $('#cfgImport');
        if (importInput) {
            importInput.addEventListener('change', () => {
                const file = importInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const dados = JSON.parse(reader.result);
                        if (!dados || !Array.isArray(dados.paginas)) throw new Error('formato inválido');
                        estado = dados;
                        CMS.save(estado);
                        toast('Conteúdo importado com sucesso! 🎉');
                        viewConfig();
                    } catch (e) {
                        toast('Arquivo inválido — use um JSON exportado pelo painel.', 'erro');
                    }
                };
                reader.readAsText(file);
            });
        }
    }

    function exportarPublicacao() {
        const ok = confirmar(
            'Publicar conteúdo para o site',
            `<ol style="margin-left:18px; font-size:0.86rem; display:grid; gap:6px">
                <li>O arquivo <code>cms-conteudo.json</code> será baixado com tudo que está publicado.</li>
                <li>Substitua o arquivo <code>cms-conteudo.json</code> na raiz do repositório (via commit no GitHub).</li>
                <li>Em instantes, o site exibirá o novo conteúdo para <strong>todos os visitantes</strong>. 🎉</li>
            </ol>`,
            'Baixar cms-conteudo.json',
            false
        ).then((confirmou) => {
            if (!confirmou) return;
            const dados = clonar(estado);
            delete dados.site.adminUser;
            delete dados.site.adminPass;
            CMS.exportar(dados);
            toast('Download iniciado — substitua o arquivo no repositório.', 'info');
        });
    }

    /* ========================================================
       INIT
       ======================================================== */
    async function init() {
        estado = await CMS.getData();

        // Login
        $('#formLogin').addEventListener('submit', (ev) => {
            ev.preventDefault();
            const u = $('#loginUsuario').value.trim();
            const p = $('#loginSenha').value;
            if (u === estado.site.adminUser && p === estado.site.adminPass) {
                sessionStorage.setItem(AUTH_KEY, '1');
                mostrarApp();
            } else {
                $('#loginErro').hidden = false;
            }
        });

        $('#btnSair').addEventListener('click', sair);

        // Modais
        $('#confirmOk').addEventListener('click', () => fecharConfirm(true));
        $('#confirmCancelar').addEventListener('click', () => fecharConfirm(false));
        $('#modalConfirm').addEventListener('click', (ev) => {
            if (ev.target === $('#modalConfirm')) fecharConfirm(false);
        });

        $('#midiaPickerFechar').addEventListener('click', () => { $('#modalMidia').hidden = true; campoMidiaAlvo = null; });
        $('#midiaPickerUsar').addEventListener('click', () => {
            const url = $('#midiaPickerUrl').value.trim();
            if (!url) { toast('Cole uma URL de imagem.', 'erro'); return; }
            pickImagem(url);
        });
        $('#midiaPickerGrid').addEventListener('click', (ev) => {
            const item = ev.target.closest('.midia-picker-item');
            if (item) pickImagem(item.dataset.url);
        });

        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') {
                fecharConfirm(false);
                $('#modalMidia').hidden = true;
                campoMidiaAlvo = null;
            }
        });

        // Publicar p/ o site (menu lateral)
        $('#btnPublicarJson').addEventListener('click', exportarPublicacao);

        // Roteador
        window.addEventListener('hashchange', navegar);

        if (logado()) mostrarApp();
        else mostrarLogin();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
