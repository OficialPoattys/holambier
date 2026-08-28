/* ============================================================
   HOLAMBIER — Núcleo do CMS (simulação WordPress)
   ------------------------------------------------------------
   - Armazena páginas/blocos criados no Painel (admin.html)
   - Publicação: localStorage (rascunho do administrador) e
     cms-conteudo.json (conteúdo publicado p/ todos os visitantes)
   - Injeta as páginas no menu de todas as páginas do site
   - Renderiza as páginas dinâmicas (pagina.html?slug=...)
   ============================================================ */

(function () {
    'use strict';

    const STORAGE_KEY = 'holambier_cms_v1';
    const CONTEUDO_PUBLICADO = 'cms-conteudo.json';

    /* ===== CONTEÚDO PADRÃO (seed) ===== */
    const SEED = {
        version: 1,
        site: {
            titulo: 'Holambier',
            slogan: 'Cervejaria & Restaurante',
            whatsapp: '5519996617607',
            whatsappMsg: 'Olá! Gostaria de mais informações sobre a Holambier.',
            instagram: 'https://www.instagram.com/holambier/',
            googleReview: 'https://www.google.com/search?q=holambier+holambra',
            tripadvisor: 'https://www.tripadvisor.pt/Restaurant_Review-g2572355-d25233735-Reviews-Restaurante_e_Cervejaria_Holambier-Holambra_State_of_Sao_Paulo.html',
            cardapio: 'https://www.hubt.com.br/holambier/',
            adminUser: 'admin',
            adminPass: 'holambier123'
        },
        paginas: [
            {
                id: 'nossa-cervejaria',
                titulo: 'Nossa Cervejaria',
                slug: 'nossa-cervejaria',
                status: 'publicada',
                noMenu: true,
                ordem: 10,
                criadaEm: '2026-01-05T10:00:00.000Z',
                atualizadaEm: '2026-01-05T10:00:00.000Z',
                blocos: [
                    {
                        tipo: 'banner',
                        titulo: 'Nossa Cervejaria',
                        subtitulo: 'Do mosto ao copo: conheça a fábrica artesanal que produz cada chopp servido no nosso salão.',
                        imagem: '',
                        botaoTexto: 'Agende uma visita',
                        botaoLink: 'https://wa.me/5519996617607'
                    },
                    {
                        tipo: 'texto',
                        subtitulo: 'Fábrica aberta, portas abertas',
                        conteudo: 'Aqui dentro, a cerveja não viaja: ela nasce a poucos metros da sua mesa. Nossa fábrica segue a escola cervejeira europeia, com equipamentos modernos e insumos selecionados a cada batelada.\n\nVocê pode acompanhar o processo por trás do salão — e, se quiser, conhecer tudo de perto em uma visita guiada com nossos cervejeiros.'
                    },
                    {
                        tipo: 'colunas',
                        titulo: 'Por que a nossa cerveja é diferente?',
                        itens: [
                            { emoji: '🏭', titulo: 'Fábrica própria', texto: 'Todo o processo acontece dentro da Holambier, do cozimento do mosto à maturação.' },
                            { emoji: '🌾', titulo: 'Insumos selecionados', texto: 'Maltes e lúpulos de origem controlada, água tratada e leveduras próprias de cada estilo.' },
                            { emoji: '🌷', titulo: 'Toque de Holambra', texto: 'Edições especiais inspiradas na cidade das flores e na herança holandesa da região.' }
                        ]
                    },
                    {
                        tipo: 'cartoes',
                        titulo: 'O caminho da cerveja',
                        itens: [
                            { emoji: '🌱', titulo: '1. Mostura', texto: 'O malte é moído e misturado à água em temperaturas precisas para extrair os açúcares.' },
                            { emoji: '🔥', titulo: '2. Fervura', texto: 'O mosto ferve e recebe o lúpulo, que traz amargor, aroma e estabilidade.' },
                            { emoji: '⏳', titulo: '3. Fermentação', texto: 'A levedura transforma açúcar em álcool e aromas — cada estilo tem sua cepa.' },
                            { emoji: '🧊', titulo: '4. Maturação', texto: 'A cerveja descansa no frio até atingir equilíbrio. Depois é levada direta pro chopp.' }
                        ]
                    },
                    {
                        tipo: 'botoes',
                        itens: [
                            { texto: 'Ver cardápio completo', link: 'https://www.hubt.com.br/holambier/', estilo: 'primario' },
                            { texto: 'Falar no WhatsApp', link: 'https://wa.me/5519996617607', estilo: 'secundario' }
                        ]
                    }
                ]
            },
            {
                id: 'eventos',
                titulo: 'Eventos & Reservas',
                slug: 'eventos',
                status: 'publicada',
                noMenu: true,
                ordem: 20,
                criadaEm: '2026-01-05T10:05:00.000Z',
                atualizadaEm: '2026-01-05T10:05:00.000Z',
                blocos: [
                    {
                        tipo: 'banner',
                        titulo: 'Eventos & Reservas',
                        subtitulo: 'Aniversários, confrarias, eventos corporativos e degustações guiadas em um cenário único: a cervejaria de Holambra.',
                        imagem: '',
                        botaoTexto: 'Reservar pelo WhatsApp',
                        botaoLink: 'https://wa.me/5519996617607'
                    },
                    {
                        tipo: 'texto',
                        subtitulo: 'Sua festa com sabor de fábrica',
                        conteudo: 'Nossa estrutura recebe grupos de todos os tamanhos. Monte seu evento com pratos para compartilhar, régua de degustação e aquela hospitalidade holandesa que só Holambra tem.\n\nFale com a nossa equipe: montamos o cardápio sob medida para o seu grupo.'
                    },
                    {
                        tipo: 'colunas',
                        titulo: 'Tipos de evento',
                        itens: [
                            { emoji: '🎂', titulo: 'Aniversários', texto: 'Salão reservado, cardápio de porções e chopps gelados para todas as idades.' },
                            { emoji: '💼', titulo: 'Corporativos', texto: 'Happy hour e confrarias com degustação guiada e espaço para apresentações.' },
                            { emoji: '🍻', titulo: 'Degustações', texto: 'Régua de 4 estilos com explicação do cervejeiro — a experiência mais completa da casa.' }
                        ]
                    },
                    {
                        tipo: 'texto',
                        subtitulo: 'Como reservar',
                        conteudo: 'As reservas são feitas pelo WhatsApp (19) 99661-7607. Informe a data, o número de pessoas e o tipo de evento — nós retornamos com as opções de cardápio e valores.'
                    }
                ]
            },
            {
                id: 'tour-da-fabrica',
                titulo: 'Tour da Fábrica',
                slug: 'tour-da-fabrica',
                status: 'rascunho',
                noMenu: false,
                ordem: 30,
                criadaEm: '2026-01-05T10:10:00.000Z',
                atualizadaEm: '2026-01-05T10:10:00.000Z',
                blocos: [
                    {
                        tipo: 'banner',
                        titulo: 'Tour da Fábrica',
                        subtitulo: 'Página em construção — em breve, o tour guiado completo pela nossa cervejaria.',
                        imagem: '',
                        botaoTexto: 'Tenho interesse',
                        botaoLink: 'https://wa.me/5519996617607'
                    },
                    {
                        tipo: 'texto',
                        conteudo: 'Estamos preparando uma experiência guiada com história, processo produtivo e degustação final. Esta página está como rascunho para você testar o painel.'
                    }
                ]
            }
        ],
        midia: []
    };

    /* ===== PERSISTÊNCIA ===== */
    function carregarLocal() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.warn('[CMS] localStorage inválido, usando padrão.', e);
            return null;
        }
    }

    function salvarLocal(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('[CMS] Falha ao salvar (cota cheia?).', e);
            return false;
        }
    }

    function clonar(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    let cacheData = null;

    /* API pública */
    const CMS = {
        /** Carrega dados: localStorage > cms-conteudo.json (publicado) > seed */
        async getData() {
            if (cacheData) return cacheData;

            const local = carregarLocal();
            if (local && local.version) {
                cacheData = local;
                return cacheData;
            }

            // Tenta o conteúdo publicado (funciona quando servido via HTTP)
            try {
                const resp = await fetch(CONTEUDO_PUBLICADO, { cache: 'no-store' });
                if (resp.ok) {
                    const publicado = await resp.json();
                    if (publicado && publicado.version) {
                        // Publicado tem prioridade, mas herda padrões do seed
                        // (ex.: credenciais não são exportadas para o arquivo público)
                        cacheData = {
                            ...clonar(SEED),
                            ...publicado,
                            site: { ...SEED.site, ...(publicado.site || {}) },
                            paginas: Array.isArray(publicado.paginas) ? publicado.paginas : clonar(SEED.paginas),
                            midia: Array.isArray(publicado.midia) ? publicado.midia : []
                        };
                        return cacheData;
                    }
                }
            } catch (e) { /* arquivo:// ou ausente — usa seed */ }

            cacheData = clonar(SEED);
            return cacheData;
        },

        /** Salva (é o "Publicar" local do administrador) */
        save(data) {
            data.atualizadoEm = new Date().toISOString();
            cacheData = data;
            return salvarLocal(data);
        },

        reset() {
            localStorage.removeItem(STORAGE_KEY);
            cacheData = clonar(SEED);
            return clonar(SEED);
        },

        seed() { return clonar(SEED); },

        /** Download do conteúdo publicado (cms-conteudo.json) */
        exportar(data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cms-conteudo.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        },

        util: { clonar, esc, slugify, tempoRelativo }
    };

    /* ===== HELPERS ===== */
    function esc(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function slugify(str) {
        return String(str || '').toLowerCase().normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '').trim()
            .replace(/\s+/g, '-').replace(/-+/g, '-');
    }

    function tempoRelativo(iso) {
        if (!iso) return '—';
        const diff = Date.now() - new Date(iso).getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return 'agora mesmo';
        if (min < 60) return `há ${min} min`;
        const h = Math.floor(min / 60);
        if (h < 24) return `há ${h} h`;
        const d = Math.floor(h / 24);
        if (d === 1) return 'ontem';
        if (d < 30) return `há ${d} dias`;
        return new Date(iso).toLocaleDateString('pt-BR');
    }

    /* ===== RENDERIZAÇÃO DE BLOCOS (site público) ===== */
    function paragrafos(texto) {
        return String(texto || '').split(/\n{2,}/).map((p) =>
            `<p>${esc(p).replace(/\n/g, '<br>')}</p>`
        ).join('');
    }

    const BLOCK_RENDERERS = {
        banner(b) {
            const bg = b.imagem
                ? `style="background-image:linear-gradient(rgba(15,46,18,.8),rgba(15,46,18,.85)),url('${esc(b.imagem)}')"`
                : '';
            const btn = b.botaoTexto
                ? `<a href="${esc(b.botaoLink || '#')}" target="_blank" rel="noopener" class="btn-primary">${esc(b.botaoTexto)}</a>`
                : '';
            return `<section class="page-banner" ${bg}>
                <div class="page-banner-inner">
                    <h1>${esc(b.titulo)}</h1>
                    ${b.subtitulo ? `<p>${esc(b.subtitulo)}</p>` : ''}
                    ${btn}
                </div>
            </section>`;
        },

        texto(b) {
            return `<section class="page-section">
                ${b.subtitulo ? `<h2 class="section-title">${esc(b.subtitulo)}</h2>` : ''}
                <div class="page-text">${paragrafos(b.conteudo)}</div>
            </section>`;
        },

        colunas(b) {
            return `<section class="page-section">
                ${b.titulo ? `<h2 class="section-title">${esc(b.titulo)}</h2>` : ''}
                <div class="page-colunas">
                    ${(b.itens || []).map((i) => `
                        <div class="page-coluna">
                            <span class="page-coluna-emoji">${esc(i.emoji || '✨')}</span>
                            <h3>${esc(i.titulo)}</h3>
                            <p>${esc(i.texto)}</p>
                        </div>`).join('')}
                </div>
            </section>`;
        },

        cartoes(b) {
            return `<section class="page-section">
                ${b.titulo ? `<h2 class="section-title">${esc(b.titulo)}</h2>` : ''}
                <div class="page-cartoes">
                    ${(b.itens || []).map((i) => `
                        <article class="page-cartao">
                            ${i.imagem
                                ? `<div class="page-cartao-media"><img src="${esc(i.imagem)}" alt="${esc(i.titulo)}" loading="lazy" data-fallback-emoji="${esc(i.emoji || '📷')}"><span class="page-cartao-emoji">${esc(i.emoji || '')}</span></div>`
                                : `<div class="page-cartao-media page-cartao-media-emoji"><span class="page-cartao-emoji">${esc(i.emoji || '✨')}</span></div>`}
                            <div class="page-cartao-corpo">
                                <h3>${esc(i.titulo)}</h3>
                                <p>${esc(i.texto)}</p>
                            </div>
                        </article>`).join('')}
                </div>
            </section>`;
        },

        imagem(b) {
            if (!b.src) return '';
            const cls = b.largura === 'estreita' ? 'page-imagem page-imagem-estreita' : 'page-imagem';
            return `<section class="page-section">
                <figure class="${cls}">
                    <img src="${esc(b.src)}" alt="${esc(b.legenda || '')}" loading="lazy">
                    ${b.legenda ? `<figcaption>${esc(b.legenda)}</figcaption>` : ''}
                </figure>
            </section>`;
        },

        galeria(b) {
            const imgs = (b.imagens || []).filter(Boolean);
            if (!imgs.length) return '';
            return `<section class="page-section">
                <div class="page-galeria">
                    ${imgs.map((src) => `<img src="${esc(src)}" alt="${esc(b.legenda || 'Foto')}" loading="lazy">`).join('')}
                </div>
                ${b.legenda ? `<p class="page-galeria-legenda">${esc(b.legenda)}</p>` : ''}
            </section>`;
        },

        botoes(b) {
            const btns = (b.itens || []).filter((i) => i.texto);
            if (!btns.length) return '';
            return `<section class="page-section page-botoes">
                ${btns.map((i) => `
                    <a href="${esc(i.link || '#')}" target="_blank" rel="noopener"
                       class="${i.estilo === 'secundario' ? 'btn-secundario' : 'btn-primary'}">${esc(i.texto)}</a>`).join('')}
            </section>`;
        }
    };

    function renderBlocos(blocos) {
        return (blocos || []).map((b) => {
            const fn = BLOCK_RENDERERS[b.tipo];
            return fn ? fn(b) : '';
        }).join('\n');
    }

    /* ===== INTEGRAÇÃO COM AS PÁGINAS ESTÁTICAS ===== */

    /** Injeta páginas publicadas (noMenu) no menu de navegação */
    async function injetarNoMenu() {
        const menus = document.querySelectorAll('.nav-menu');
        if (!menus.length) return;

        const data = await CMS.getData();
        const publicadas = (data.paginas || [])
            .filter((p) => p.status === 'publicada' && p.noMenu)
            .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

        const slugAtual = new URLSearchParams(location.search).get('slug');

        menus.forEach((ul) => {
            publicadas.forEach((p) => {
                if (ul.querySelector(`a[data-cms-slug="${p.slug}"]`)) return;
                const li = document.createElement('li');
                li.innerHTML = `<a href="pagina.html?slug=${encodeURIComponent(p.slug)}" data-cms-slug="${esc(p.slug)}">${esc(p.titulo)}</a>`;
                ul.appendChild(li);
            });
            if (slugAtual) {
                const ativo = ul.querySelector(`a[data-cms-slug="${slugAtual}"]`);
                if (ativo) ativo.classList.add('active');
            }
        });
    }

    /** Renderiza a página dinâmica (usado em pagina.html) */
    async function renderizarPaginaDinamica() {
        const alvo = document.getElementById('paginaConteudo');
        if (!alvo) return;

        const params = new URLSearchParams(location.search);
        const slug = params.get('slug');
        const preview = params.get('preview') === '1';

        const data = await CMS.getData();
        const pagina = (data.paginas || []).find((p) => p.slug === slug);

        const skeleton = document.getElementById('paginaSkeleton');

        if (!pagina || (pagina.status !== 'publicada' && !preview)) {
            document.title = 'Página não encontrada - Holambier';
            alvo.innerHTML = `
                <section class="page-404">
                    <span class="page-404-emoji">🍺</span>
                    <h1>Página não encontrada</h1>
                    <p>O conteúdo que você procura não existe ou não está publicado.</p>
                    <a href="index.html" class="btn-primary">Voltar para a home</a>
                </section>`;
            if (skeleton) skeleton.remove();
            return;
        }

        document.title = `${pagina.titulo} - Holambier`;

        const aviso = preview && pagina.status !== 'publicada'
            ? `<div class="preview-notice">👁️ Pré-visualização de rascunho — visível apenas com o link de preview.</div>`
            : '';

        alvo.innerHTML = aviso + renderBlocos(pagina.blocos);
        if (skeleton) skeleton.remove();

        // Reaplica fallbacks de imagem nos blocos recém-criados
        alvo.querySelectorAll('img').forEach((img) => {
            img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
        });
    }

    /* ===== BOOT ===== */
    document.addEventListener('DOMContentLoaded', () => {
        injetarNoMenu();
        renderizarPaginaDinamica();
    });

    window.CMS = CMS;
})();
