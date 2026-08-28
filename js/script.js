/* ============================================================
   HOLAMBIER — Script principal
   - Destaques de pratos e chopps (gerados dinamicamente)
   - Modal de detalhes, menu mobile, cookies, fallback de imagens
   ============================================================ */

/* ===== DADOS: DESTAQUES DA COZINHA =====
   Estes destaques são só uma amostra — o cardápio completo
   (hubt.com.br) tem dezenas de opções. Para usar fotos reais,
   basta salvar as imagens em: images/pratos/<arquivo>.jpg      */
const PRATOS = [
    {
        id: 'costela-defumada',
        nome: 'Costela Defumada 12 Horas',
        emoji: '🥩',
        img: 'images/pratos/costela-defumada.jpg',
        badge: 'Mais pedido',
        badgeClass: '',
        tag: 'Prato principal',
        desc: 'Bobina de costela bovina defumada lentamente por 12 horas em lenha de laranjeira, até desmanchar no garfo. Finalizada com ourébano e sal grosso artesanal.',
        harmonizacao: 'Harmoniza com nossa Amber Ale — o caramelo do malte abraça o defumado da carne.',
        meta: 'Serve 1 pessoa'
    },
    {
        id: 'picanha-tabua',
        nome: 'Picanha na Tábua (2 pessoas)',
        emoji: '🔪',
        img: 'images/pratos/picanha.jpg',
        badge: 'Para compartilhar',
        badgeClass: 'badge-compartilhar',
        tag: 'Para compartilhar',
        desc: 'Peça inteira de picanha grelhada na hora, fatiada na tábua com arroz de alholva, farofa da casa, vinagrete e mandioca dourada. O clássico que nunca decepciona.',
        harmonizacao: 'Vai bem com uma Lager Holandesa Puro Malte, gelada e refrescante.',
        meta: 'Serve 2 pessoas'
    },
    {
        id: 'gouda-empanado',
        nome: 'Gouda Holandês Empanado',
        emoji: '🧀',
        img: 'images/pratos/gouda.jpg',
        badge: 'Novidade',
        badgeClass: 'badge-novidade',
        tag: 'Entrada',
        desc: 'Genuíno queijo Gouda curado, empanado na cerveja preta da casa, servido com geleia artesanal de pimenta e toque de ervas. Uma homenagem às raízes holandesas de Holambra.',
        harmonizacao: 'Experimente com a Weiss — o contraste adocicado é imbatível.',
        meta: 'Ideal para 2'
    },
    {
        id: 'fraldinha-cerveja-preta',
        nome: 'Fraldinha na Cerveja Preta',
        emoji: '🍺',
        img: 'images/pratos/fraldinha.jpg',
        badge: '',
        badgeClass: '',
        tag: 'Prato principal',
        desc: 'Fraldinha marinada 24h na nossa Stout de café, selada na chapa e servida com purê rústico de batata-doce e legumes salteados no alecrim.',
        harmonizacao: 'A própria Stout Café: notas de chocolate e café torrado com o ponto da carne.',
        meta: 'Serve 1 pessoa'
    },
    {
        id: 'kroket-holandes',
        nome: 'Kroket Holandês da Casa',
        emoji: '🥟',
        img: 'images/pratos/kroket.jpg',
        badge: 'Receita de família',
        badgeClass: 'badge-casa',
        tag: 'Entrada',
        desc: 'Croquetes cremosos de carne temperada no estilo holandês, empanados e fritinhos na hora. Receita original de família, direto da vovó de Holambra. Porção com 6 unidades.',
        harmonizacao: 'Combina com a Witbier de laranja — leveza que não pesa na entrada.',
        meta: 'Porção 6 un.'
    },
    {
        id: 'salmao-crosta-ervas',
        nome: 'Salmão em Crosta de Ervas',
        emoji: '🐟',
        img: 'images/pratos/salmao.jpg',
        badge: '',
        badgeClass: '',
        tag: 'Prato principal',
        desc: 'Filé de salmão selado com crosta de ervas frescas, sobre risoto cremoso de limão-siciliano e aspargos. Leve, elegante e cheio de personalidade.',
        harmonizacao: 'Uma Saison de Flores realça os cítricos do prato.',
        meta: 'Serve 1 pessoa'
    },
    {
        id: 'batata-rustica',
        nome: 'Batata Rústica ao Alecrim',
        emoji: '🍟',
        img: 'images/pratos/batata.jpg',
        badge: 'Acompanhamento',
        badgeClass: '',
        tag: 'Porção',
        desc: 'Batatas rústicas com casca, assadas com alecrim fresco, alho confitado e flor de sal. Crocantes por fora, macias por dentro. Acompanha maionese de ervas da casa.',
        harmonizacao: 'Qualquer chopp da casa — é a companheira fiel da mesa.',
        meta: 'Porção grande'
    },
    {
        id: 'stroopwafel-sobremesa',
        nome: 'Stroopwafel com Sorvete Artesanal',
        emoji: '🧇',
        img: 'images/pratos/stroopwafel.jpg',
        badge: 'Sobremesa',
        badgeClass: 'badge-sobremesa',
        tag: 'Sobremesa',
        desc: 'O doce mais famoso da Holanda: waffle fino recheado de caramelo (stroop), servido morno com sorvete artesanal de baunilha e calda de caramelo salgado.',
        harmonizacao: 'Finaliza perfeitamente com uma Weiss de banana e cravo.',
        meta: '1 porção'
    }
];

/* ===== DADOS: DESTAQUES DA CERVEJARIA =====
   Nossa régua de degustação traz estilos rotativos —
   a carta completa tem ainda mais opções no hubt.com.br. */
const BEBIDAS = [
    {
        id: 'weiss',
        nome: 'Weiss Tradicional',
        emoji: '🌾',
        img: 'images/bebidas/weiss.jpg',
        badge: 'Clássico',
        badgeClass: '',
        tag: 'Trigo — 5,2% ABV',
        desc: 'Cerveja de trigo alemã, turbida e cremosa, com aromas intensos de banana e cravo. Corpo leve e refrescante, espuma generosa e final suave.',
        harmonizacao: 'Saladas, frutos do mar e nosso Gouda Empanado.',
        meta: '300ml · 500ml · 1L'
    },
    {
        id: 'ipa-citrica',
        nome: 'IPA Cítrica',
        emoji: '🍊',
        img: 'images/bebidas/ipa.jpg',
        badge: 'Mais pedido',
        badgeClass: '',
        tag: 'India Pale Ale — 6,5% ABV',
        desc: 'Dry hopping generoso com Citra e Mosaic: explosão de maracujá, laranja e resina. Amargor firme, equilibrado por um malte discretíssimo.',
        harmonizacao: 'Hambúrguer artesanal, costela defumada e queijos intensos.',
        meta: '300ml · 500ml'
    },
    {
        id: 'lager-holandesa',
        nome: 'Lager Holandesa',
        emoji: '🇳🇱',
        img: 'images/bebidas/lager.jpg',
        badge: 'Puro malte',
        badgeClass: 'badge-casa',
        tag: 'Lager — 4,9% ABV',
        desc: 'Homenagem às escolas holandesas: dourada, cristalina e gelada, com amargor delicado e final seco. A cerveja que agrada a todos os paladares.',
        harmonizacao: 'Petiscos, pizzas e a Picanha na Tábua.',
        meta: '300ml · 500ml · 1L'
    },
    {
        id: 'stout-cafe',
        nome: 'Stout Café',
        emoji: '☕',
        img: 'images/bebidas/stout.jpg',
        badge: '',
        badgeClass: '',
        tag: 'Stout — 6,8% ABV',
        desc: 'Escura e aveludada, com café torrado na hora, chocolate amargo e um toque de aveia. Encorpada, perfeita para fins de noite mais fresquinhos.',
        harmonizacao: 'Sobremesas de chocolate e a Fraldinha na Cerveja Preta.',
        meta: '300ml · 500ml'
    },
    {
        id: 'amber-ale',
        nome: 'Amber Ale',
        emoji: '🍯',
        img: 'images/bebidas/amber.jpg',
        badge: '',
        badgeClass: '',
        tag: 'Amber — 5,5% ABV',
        desc: 'Cor de âmbar profundo, notas de caramelo, biscoito e frutas vermelhas. Maltuda e acolhedora, com lúpulo apenas no bastidor.',
        harmonizacao: 'Carnes defumadas e queijos maduros.',
        meta: '300ml · 500ml'
    },
    {
        id: 'witbier-laranja',
        nome: 'Witbier de Laranja',
        emoji: '🍊',
        img: 'images/bebidas/witbier.jpg',
        badge: 'Toque holandês',
        badgeClass: 'badge-novidade',
        tag: 'Trigo belga — 5,0% ABV',
        desc: 'Casca de laranja e sementes de coentro no mosto: cítrica, especiada e super refrescante. Uma homenagem à Casa de Orange, a família real holandesa.',
        harmonizacao: 'Peixes, frutos do mar e o Kroket Holandês.',
        meta: '300ml · 500ml · 1L'
    },
    {
        id: 'saison-flores',
        nome: 'Saison de Flores',
        emoji: '🌷',
        img: 'images/bebidas/saison.jpg',
        badge: 'Edição Holambra',
        badgeClass: 'badge-casa',
        tag: 'Saison — 6,0% ABV',
        desc: 'Edição especial da casa: fermentação belga com pétalas de calêndula e casca de tangerina. Floral, seca e efervescente — a cidade das flores em um copo.',
        harmonizacao: 'Salmão em crosta de ervas e pratos leves.',
        meta: 'Edição limitada'
    },
    {
        id: 'regua-degustacao',
        nome: 'Régua de Degustação',
        emoji: '🍺',
        img: 'images/bebidas/regua.jpg',
        badge: 'Escolha da casa',
        badgeClass: 'badge-casa',
        tag: 'Experiência — 4 estilos',
        desc: 'Prove 4 chopps da casa em copos de degustação, escolhidos pelo nosso cervejeiro. A melhor forma de conhecer a variedade da nossa fábrica — e descobrir seu favorito.',
        harmonizacao: 'Você escolhe os estilos na hora, com nossa orientação.',
        meta: '4 × 150ml'
    }
];

/* ===== UTIL ===== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ===== GERAÇÃO DOS CARDS ===== */
function cardTemplate(item) {
    const badge = item.badge
        ? `<span class="card-badge ${item.badgeClass}">${item.badge}</span>`
        : '';
    const emoji = item.emojiFix || item.emoji || '🍽️';

    return `
        <article class="menu-card" data-id="${item.id}" tabindex="0" role="button"
                 aria-label="Ver detalhes de ${item.nome}">
            <div class="card-media">
                ${badge}
                <img src="${item.img}" alt="${item.nome}" loading="lazy"
                     data-fallback-emoji="${emoji}">
                <span class="card-emoji">${emoji}</span>
            </div>
            <div class="card-content">
                <span class="card-tag">${item.tag}</span>
                <h3 class="card-title">${item.nome}</h3>
                <p class="card-desc">${item.desc}</p>
                <div class="card-footer">
                    <span class="card-meta"><i class="fas fa-circle-info"></i>${item.meta}</span>
                    <span class="card-cta">Detalhes <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        </article>
    `;
}

function renderGrids() {
    const pratosGrid = $('#pratosGrid');
    const bebidasGrid = $('#bebidasGrid');

    if (pratosGrid) pratosGrid.innerHTML = PRATOS.map(cardTemplate).join('');
    if (bebidasGrid) bebidasGrid.innerHTML = BEBIDAS.map(cardTemplate).join('');
}

/* ===== MODAL DE DETALHES ===== */
function openModal(item) {
    const overlay = $('#modalOverlay');
    if (!overlay) return;

    const img = $('#modalImg');
    img.style.display = '';
    img.src = item.img;
    img.alt = item.nome;
    img.dataset.fallbackEmoji = item.emojiFix || item.emoji || '🍽️';

    // Se a imagem não existir, o handler global de erro a esconde
    // e o fallback (emoji) aparece por trás.

    $('#modalTitle').textContent = item.nome;

    const badgeBox = $('#modalBadge');
    badgeBox.innerHTML = item.badge
        ? `<span class="modal-badge">${item.badge}</span>`
        : '';

    $('#modalDesc').textContent = item.desc;

    // Bloco de harmonização
    let harm = $('.modal-harmonizacao', overlay);
    if (!harm) {
        harm = document.createElement('div');
        harm.className = 'modal-harmonizacao';
        $('#modalDesc').after(harm);
    }
    harm.innerHTML = `<strong>🍺 Dica de harmonização</strong>${item.harmonizacao || ''}`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = $('#modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function bindCards() {
    const all = [...PRATOS, ...BEBIDAS];

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.menu-card');
        if (card) {
            const item = all.find((i) => i.id === card.dataset.id);
            if (item) openModal(item);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const card = e.target.closest?.('.menu-card');
            if (card) {
                const item = all.find((i) => i.id === card.dataset.id);
                if (item) openModal(item);
            }
        }
    });

    const overlay = $('#modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.id === 'modalClose') closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }
}

/* ===== MENU MOBILE (HAMBURGER) ===== */
function bindHamburger() {
    const header = $('header');
    const burger = $('.hamburger');
    if (!header || !burger) return;

    burger.addEventListener('click', () => header.classList.toggle('nav-open'));

    $$('.nav-menu a').forEach((a) =>
        a.addEventListener('click', () => header.classList.remove('nav-open'))
    );
}

/* ===== BANNER DE COOKIES ===== */
function initCookies() {
    const banner = $('#cookieBanner');
    if (!banner) return;

    const aceitou = localStorage.getItem('holambier_cookies');
    if (!aceitou) {
        setTimeout(() => banner.classList.add('visible'), 1200);
    }

    $('#acceptCookies')?.addEventListener('click', () => {
        localStorage.setItem('holambier_cookies', 'aceito');
        banner.classList.remove('visible');
    });

    $('#refuseCookies')?.addEventListener('click', () => {
        localStorage.setItem('holambier_cookies', 'recusado');
        banner.classList.remove('visible');
    });
}

/* ===== FALLBACK GLOBAL DE IMAGENS =====
   Substitui imagens ausentes por um placeholder bonito,
   para o site nunca aparecer "quebrado" enquanto as fotos
   reais não são adicionadas às pastas de imagens. */
function initImageFallbacks() {
    document.addEventListener('error', (e) => {
        const img = e.target;
        if (!(img instanceof HTMLImageElement)) return;

        const emoji = img.dataset.fallbackEmoji;

        // Card de prato/bebida: esconde a foto e deixa o emoji aparecer
        if (img.closest('.card-media')) {
            img.style.display = 'none';
            return;
        }
        if (img.id === 'modalImg') {
            img.style.display = 'none';
            return;
        }

        // Logo do hero: troca por logotipo em texto
        if (img.classList.contains('hero-logo')) {
            const div = document.createElement('div');
            div.className = 'hero-logo-fallback';
            div.innerHTML = 'Holambier<small>Cervejaria &amp; Restaurante</small>';
            img.replaceWith(div);
            return;
        }

        // Logos do TripAdvisor: selo em texto
        if ((img.src || '').toLowerCase().includes('tripadvisor') ||
            img.classList.contains('tripadvisor-logo-header') ||
            img.classList.contains('tripadvisor-logo-social')) {
            const span = document.createElement('span');
            span.className = 'img-fallback tripadvisor-fallback';
            span.innerHTML = '<span class="fb-emoji">🦉</span> TripAdvisor';
            img.replaceWith(span);
            return;
        }

        // Genérico: placeholder com emoji
        const div = document.createElement('div');
        div.className = 'img-fallback';
        div.innerHTML = `<span class="fb-emoji">${emoji || '📷'}</span>`;
        img.replaceWith(div);
    }, true);
}

/* ===== ANO NO RODAPÉ ===== */
function initYear() {
    const el = $('#currentYear');
    if (el) el.textContent = new Date().getFullYear();
}

/* ===== DATA DA POLÍTICA DE PRIVACIDADE ===== */
function initPoliticaData() {
    const el = $('#dataAtualizacao');
    if (!el) return;
    const meses = ['janeiro','fevereiro','março','abril','maio','junho',
                   'julho','agosto','setembro','outubro','novembro','dezembro'];
    const d = new Date();
    el.textContent = `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
    initImageFallbacks();
    renderGrids();
    bindCards();
    bindHamburger();
    initCookies();
    initYear();
    initPoliticaData();
});
