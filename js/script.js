// ===== MENU HAMBÚRGUER =====
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

    if (!localStorage.getItem('cookieConsent')) {
        cookieBanner.style.display = 'flex';
    }

    acceptBtn.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'true');
        cookieBanner.style.display = 'none';
    });

    refuseBtn.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'false');
        cookieBanner.style.display = 'none';
    });

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
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function fecharModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', fecharModal);
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

    // ===== DADOS DOS PRATOS =====
    const pratos = [
        {
            id: 1,
            nome: 'Parmegiana',
            descricao: 'Parmegiana de filé mignon ou frango, com parmesão derretido e molho de tomate feito na casa, arroz branco e batata frita (individual e para 2 pessoas).',
            imagem: 'images/parmegiana.png',
            badge: 'Principal'
        },
        {
            id: 2,
            nome: 'Picanha À Moda',
            descricao: 'Bifes de picanha com arroz branco, farofa da casa, vinagrete e batata frita (individual e para 2 pessoas).',
            imagem: 'images/picanha.png',
            badge: 'Principal'
        },
        {
            id: 3,
            nome: 'Massa Holambier',
            descricao: 'Opção vegetariana. Escolha entre molho 4 Queijos ou Pomodoro. Massa fresca com toque especial.',
            imagem: 'images/massa.png',
            badge: 'Vegetariana'
        },
        {
            id: 4,
            nome: 'Croquete Holandês',
            descricao: 'Croquete típico da Holanda, recheado de frango e legumes. Porção.',
            imagem: 'images/croquete-holandes.jpg',
            badge: 'Porção'
        },
        {
            id: 5,
            nome: 'Salsichão Fatiado',
            descricao: 'Salsichão fatiado e grelhado com cebola, pãezinhos e mostarda. Porção.',
            imagem: 'images/salsichao-tipico.jpg',
            badge: 'Porção'
        },
        {
            id: 6,
            nome: 'Porção Família',
            descricao: '200g de isca de picanha, 200g de isca de frango, 200g de salsichão holandês, 200g de batata frita, molho de alho e de cerveja preta.',
            imagem: 'images/porcao-familia.jpg',
            badge: 'Porção'
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
                </div>
            `;
            card.addEventListener('click', function() {
                abrirModal(prato);
            });
            gridPratos.appendChild(card);
        });
    }

    // ===== DADOS DAS BEBIDAS =====
    const bebidas = [
        {
            id: 1,
            nome: 'Pilsen',
            descricao: 'ABV: 4,5% | IBU: 9 - Sabor maltado se destaca nessa lager, super leve e refrescante.',
            imagem: 'images/pilsen.jpg',
            badge: 'Suave'
        },
        {
            id: 2,
            nome: 'American IPA',
            descricao: 'ABV: 5,8% | IBU: 50 - Muito lupulada, sabor intenso de lúpulos cítricos e resinosos, um manifesto sobre o jeito americano de fazer cerveja.',
            imagem: 'images/ipa.jpg',
            badge: 'Cítrico'
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