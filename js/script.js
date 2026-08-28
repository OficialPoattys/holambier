// ===== MENU HAMBÚRGUER =====
// Guarda contra execução dupla (script incluído duas vezes na página)
if (!window.__holambierScriptBoot) {
    window.__holambierScriptBoot = true;

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active'); // anima os traços para "X"
        });
    }

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active'); // recolhe o ícone
        });
    });

    // ===== COOKIE BANNER =====
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const refuseBtn = document.getElementById('refuseCookies');

    if (cookieBanner && !localStorage.getItem('cookieConsent')) {
        cookieBanner.style.display = 'flex';
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'true');
            cookieBanner.style.display = 'none';
        });
    }

    if (refuseBtn) {
        refuseBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'false');
            cookieBanner.style.display = 'none';
        });
    }

    // ===== MODAL =====
    const modalOverlay = document.getElementById('modalOverlay');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalBadge = document.getElementById('modalBadge');
    const modalClose = document.getElementById('modalClose');

    function abrirModal(item) {
        modalImg.src = item.imagem;
        modalImg.alt = item.nome;
        modalTitle.textContent = item.nome;
        modalDesc.textContent = item.descricao;
        if (item.badge) {
            modalBadge.innerHTML = `<span class="badge" style="font-size: 1rem; padding: 4px 16px;">${item.badge}</span>`;
        } else {
            modalBadge.innerHTML = '';
        }

        // Bloco "sobre o item": tamanho da porção + dica de harmonização
        let extra = document.getElementById('modalExtra');
        if (!extra) {
            extra = document.createElement('div');
            extra.id = 'modalExtra';
            extra.className = 'modal-extra';
            modalBadge.parentElement.appendChild(extra);
        }
        extra.innerHTML = `
            ${item.meta ? `<p class="modal-meta"><i class="fas fa-users"></i> ${item.meta}</p>` : ''}
            ${item.harmonizacao ? `<div class="modal-harmonizacao"><strong>🍺 Dica de harmonização</strong>${item.harmonizacao}</div>` : ''}
        `;

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function fecharModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', fecharModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                fecharModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                fecharModal();
            }
        });
    }

    // ===== DADOS DOS PRATOS (DESTAQUES DA COZINHA) =====
    // Estes destaques são uma amostra — o cardápio completo (hubt.com.br)
    // tem dezenas de opções de pratos, porções e sobremesas.
    const pratos = [
        {
            id: 1,
            nome: 'Parmegiana',
            descricao: 'Parmegiana de filé mignon ou frango, com parmesão derretido e molho de tomate feito na casa, arroz branco e batata frita. Servida individual ou para 2 pessoas.',
            imagem: 'images/parmegiana.png',
            badge: 'Principal',
            meta: 'Individual ou para 2',
            harmonizacao: 'Combina com nossa Pilsen gelada — o amargor leve corta o molho e limpa o paladar.'
        },
        {
            id: 2,
            nome: 'Picanha À Moda',
            descricao: 'Bifes de picanha grelhados na hora com arroz branco, farofa da casa, vinagrete e batata frita. Servida individual ou para 2 pessoas.',
            imagem: 'images/picanha.png',
            badge: 'Principal',
            meta: 'Individual ou para 2',
            harmonizacao: 'Vai lindamente com a American IPA — o amargor cítrico realça o grelhado da carne.'
        },
        {
            id: 3,
            nome: 'Massa Holambier',
            descricao: 'Opção vegetariana. Escolha entre molho 4 Queijos ou Pomodoro. Massa fresca com toque especial da casa.',
            imagem: 'images/massa.png',
            badge: 'Vegetariana',
            meta: 'Serve 1 pessoa',
            harmonizacao: 'O molho 4 queijos pede uma Witbier de laranja: cítrica e refrescante.'
        },
        {
            id: 4,
            nome: 'Croquete Holandês',
            descricao: 'Croquete típico da Holanda, recheado de frango e legumes, crocante por fora e cremoso por dentro. Receita tradicional holandesa. Porção.',
            imagem: 'images/croquete-holandes.jpg',
            badge: 'Porção',
            meta: 'Porção para compartilhar',
            harmonizacao: 'Clássico com Pilsen — ou com a Witbier para um toque ainda mais holandês.'
        },
        {
            id: 5,
            nome: 'Salsichão Fatiado',
            descricao: 'Salsichão fatiado e grelhado com cebola caramelizada, pãezinhos fresquinhos e mostarda. O petisco perfeito para acompanhar o chopp. Porção.',
            imagem: 'images/salsichao-tipico.jpg',
            badge: 'Porção',
            meta: 'Porção para compartilhar',
            harmonizacao: 'Imbatível com Pilsen ou Amber Ale — malte e defumado de mãos dadas.'
        },
        {
            id: 6,
            nome: 'Porção Família',
            descricao: '200g de isca de picanha, 200g de isca de frango, 200g de salsichão holandês, 200g de batata frita, molho de alho e molho de cerveja preta. Para a mesa inteira!',
            imagem: 'images/porcao-familia.jpg',
            badge: 'Para compartilhar',
            meta: 'Serve 3 a 4 pessoas',
            harmonizacao: 'Peça a Régua de Degustação e cada um harmoniza com seu estilo favorito.'
        }
    ];

    const gridPratos = document.getElementById('pratosGrid');
    if (gridPratos) {
        pratos.forEach(prato => {
            const card = document.createElement('div');
            card.className = 'prato-card';
            card.innerHTML = `
                <img src="${prato.imagem}" alt="${prato.nome}" loading="lazy">
                <div class="info">
                    ${prato.badge ? `<span class="badge">${prato.badge}</span>` : ''}
                    <h3>${prato.nome}</h3>
                    <p>${prato.descricao.substring(0, 80)}...</p>
                    ${prato.meta ? `<span class="card-meta"><i class="fas fa-users"></i> ${prato.meta}</span>` : ''}
                </div>
            `;
            card.addEventListener('click', function() {
                abrirModal(prato);
            });
            gridPratos.appendChild(card);
        });
    }

    // ===== DADOS DAS BEBIDAS (DESTAQUES DA CERVEJARIA) =====
    // Nossa fábrica produz diversos estilos — a carta completa está no
    // cardápio digital, e a régua de degustação traz 4 estilos da casa.
    const bebidas = [
        {
            id: 1,
            nome: 'Pilsen',
            descricao: 'ABV: 4,5% | IBU: 9 - Sabor maltado se destaca nessa lager, super leve e refrescante.',
            imagem: 'images/pilsen.jpg',
            badge: 'Suave',
            meta: '300ml · 500ml · 1L',
            harmonizacao: 'A companheira de todos os pratos — leve e versátil.'
        },
        {
            id: 2,
            nome: 'American IPA',
            descricao: 'ABV: 5,8% | IBU: 50 - Muito lupulada, sabor intenso de lúpulos cítricos e resinosos, um manifesto sobre o jeito americano de fazer cerveja.',
            imagem: 'images/ipa.jpg',
            badge: 'Cítrico',
            meta: '300ml · 500ml',
            harmonizacao: 'Poderosa com carnes grelhadas e hambúrguer artesanal.'
        },
        {
            id: 3,
            nome: 'Weiss Tradicional',
            descricao: 'ABV: 5,2% | IBU: 12 - Cerveja de trigo alemã, turbida e cremosa, com aromas característicos de banana e cravo. Espuma generosa e final suave.',
            imagem: 'images/weiss.jpg',
            badge: 'Trigo',
            meta: '300ml · 500ml · 1L',
            harmonizacao: 'Saladas, frutos do mar e nosso Croquete Holandês.'
        },
        {
            id: 4,
            nome: 'Stout Café',
            descricao: 'ABV: 6,5% | IBU: 32 - Escura e aveludada, com notas de café torrado, chocolate amargo e um toque de aveia. Perfeita para o fim de noite.',
            imagem: 'images/stout.jpg',
            badge: 'Encorpada',
            meta: '300ml · 500ml',
            harmonizacao: 'Sobremesas de chocolate — e o molho de cerveja preta da Porção Família.'
        },
        {
            id: 5,
            nome: 'Amber Ale',
            descricao: 'ABV: 5,5% | IBU: 22 - Cor de âmbar profundo, notas de caramelo e biscoito. Maltuda e acolhedora, com lúpulo em segundo plano.',
            imagem: 'images/amber.jpg',
            badge: 'Maltada',
            meta: '300ml · 500ml',
            harmonizacao: 'Carnes defumadas, salsichão e queijos maduros.'
        },
        {
            id: 6,
            nome: 'Witbier de Laranja',
            descricao: 'ABV: 5,0% | IBU: 10 - Casca de laranja e coentro no mosto: cítrica, especiada e super refrescante. Uma homenagem à herança holandesa de Holambra.',
            imagem: 'images/witbier.jpg',
            badge: 'Cítrica',
            meta: '300ml · 500ml · 1L',
            harmonizacao: 'Peixes, frango e a Massa Holambier ao pomodoro.'
        },
        {
            id: 7,
            nome: 'Saison de Flores',
            descricao: 'ABV: 6,0% | IBU: 18 - Edição especial da casa com toque floral: fermentação belga, seca e efervescente. A cidade das flores em um copo.',
            imagem: 'images/saison.jpg',
            badge: 'Edição Holambra',
            meta: 'Edição limitada',
            harmonizacao: 'Pratos leves e massas — e as tardes de sol no Boulevard.'
        },
        {
            id: 8,
            nome: 'Régua de Degustação',
            descricao: 'Prove 4 chopps da casa em copos de degustação, escolhidos pelo nosso cervejeiro. A melhor forma de conhecer a variedade da nossa fábrica — e descobrir seu favorito.',
            imagem: 'images/regua.jpg',
            badge: 'Experiência',
            meta: '4 × 150ml',
            harmonizacao: 'Você escolhe os estilos na hora, com nossa orientação.'
        }
    ];

    const gridBebidas = document.getElementById('bebidasGrid');
    if (gridBebidas) {
        bebidas.forEach(bebida => {
            const card = document.createElement('div');
            card.className = 'bebida-card clickable';
            card.innerHTML = `
                <img src="${bebida.imagem}" alt="${bebida.nome}" loading="lazy">
                <div class="info">
                    ${bebida.badge ? `<span class="badge">${bebida.badge}</span>` : ''}
                    <h3>${bebida.nome}</h3>
                    <p>${bebida.descricao.substring(0, 80)}...</p>
                    ${bebida.meta ? `<span class="card-meta"><i class="fas fa-beer-mug-empty"></i> ${bebida.meta}</span>` : ''}
                </div>
            `;
            card.addEventListener('click', function() {
                abrirModal(bebida);
            });
            gridBebidas.appendChild(card);
        });
    }

    // ===== ANO AUTOMÁTICO NO COPYRIGHT =====
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

}
