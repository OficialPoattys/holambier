# Onde colocar cada arquivo

| Arquivo                      | Caminho no repositório         | Observação |
|------------------------------|--------------------------------|------------|
| `index.html`                 | `/index.html`                  | Raiz obrigatória (página inicial) |
| `quem-somos.html`            | `/quem-somos.html`             | Raiz, para manter as URLs do sitemap |
| `politica-privacidade.html`  | `/politica-privacidade.html`   | Raiz, para manter as URLs do sitemap |
| `robots.txt`                 | `/robots.txt`                  | Raiz obrigatória (padrão do protocolo) |
| `sitemap.xml`                | `/sitemap.xml`                 | Raiz obrigatória |
| CSS                          | `/assets/css/`                 | ex.: `assets/css/style.css` |
| JS                           | `/assets/js/`                  | ex.: `assets/js/main.js` |
| Logotipos                    | `/assets/img/logo/`            | |
| Fotos de produto             | `/assets/img/produtos/`        | |
| Banners / hero               | `/assets/img/banners/`         | |
| Favicon e ícones             | `/assets/icons/`               | `favicon.ico`, `apple-touch-icon.png` |
| Fontes locais                | `/assets/fonts/`               | `.woff2` de preferência |

## Checklist ao mover CSS/JS para dentro de `assets/`

1. Trocar `<link rel="stylesheet" href="style.css">` por `href="assets/css/style.css"`.
2. Trocar `<script src="main.js">` por `src="assets/js/main.js"`.
3. Conferir os `src` das imagens (`assets/img/...`).
4. Conferir `<link rel="icon" href="assets/icons/favicon.ico">`.
5. Validar que todas as URLs do `sitemap.xml` respondem 200.
