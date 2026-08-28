# Holambier

Site institucional estático (HTML + CSS + JS), pronto para publicação em GitHub Pages,
Netlify, Vercel ou qualquer servidor web comum.

## Estrutura de pastas

```
holambier/
├── index.html                    # Página inicial (raiz — obrigatório na raiz)
├── quem-somos.html               # Página "Quem somos"
├── politica-privacidade.html     # Política de privacidade
├── robots.txt                    # Regras para crawlers (obrigatório na raiz)
├── sitemap.xml                   # Mapa do site (obrigatório na raiz)
│
├── assets/                       # Todos os recursos estáticos
│   ├── css/                      # Folhas de estilo (style.css, etc.)
│   ├── js/                       # Scripts (main.js, etc.)
│   ├── img/                      # Imagens
│   │   ├── logo/                 # Logotipos e variações
│   │   ├── produtos/             # Fotos de produtos/rótulos
│   │   └── banners/              # Banners e imagens de destaque
│   ├── icons/                    # Favicons, ícones PWA, SVGs
│   └── fonts/                    # Fontes locais (woff2, woff)
│
├── docs/                         # Documentação do projeto
├── .gitignore
└── README.md
```

### Por que os HTML ficam na raiz?

`robots.txt` e `sitemap.xml` **precisam** estar na raiz do domínio para serem lidos
pelos buscadores. As páginas HTML também foram mantidas na raiz para que as URLs
fiquem limpas (`/quem-somos.html`) e para não quebrar os links internos e as URLs
já declaradas no `sitemap.xml`.

> Se preferir URLs sem extensão (`/quem-somos`), converta cada página para
> `quem-somos/index.html` e atualize os links internos e o `sitemap.xml`.

## Convenções

- Caminhos de recursos sempre relativos à raiz: `assets/css/style.css`.
- Nomes de arquivos em minúsculas, sem acentos, separados por hífen.
- Imagens otimizadas (preferir `.webp` com fallback quando possível).

## Como rodar localmente

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Publicação

**GitHub Pages:** Settings → Pages → Source: `Deploy from a branch` → branch `main` / `root`.
