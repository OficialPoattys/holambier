# 🍺 Holambier — Cervejaria & Restaurante

Site institucional da Holambier (Holambra/SP) com **painel administrativo próprio
inspirado no WordPress** para gerenciar páginas do site **sem código**.

## 📁 Estrutura

```
holambier/
├── index.html                  # Home (destaques de pratos e chopps + cardápio)
├── quem-somos.html             # História, missão, visão e valores
├── politica-privacidade.html   # LGPD
├── pagina.html                 # Template das páginas criadas no painel (CMS)
├── admin.html                  # 🔐 Painel administrativo (simulação WordPress)
├── cms-conteudo.json           # Conteúdo PUBLISHED do CMS (visível p/ todos)
│
├── assets/favicon/             # Favicon e ícones (site.webmanifest)
├── css/
│   ├── style.css               # Estilo do site público
│   └── admin.css               # Estilo do painel
├── js/
│   ├── script.js               # Site: destaques, modal, cookies, menus
│   ├── cms.js                  # Núcleo do CMS: dados + renderização de blocos
│   └── admin.js                # Painel: SPA de gerenciamento
└── images/                     # Fotos do site
    ├── pratos/                 # (opcional) fotos dos pratos — ver js/script.js
    └── bebidas/                # (opcional) fotos dos chopps
```

## 🚀 Painel administrativo

Acesse **`admin.html`** e entre com:

| Usuário | Senha |
|---------|-------|
| `admin` | `holambier123` |

> ⚠️ Altere o usuário/senha em **Configurações** após o primeiro acesso.
> (Autenticação simulada no navegador — para produção real, recomenda-se um
> backend ou proteção da pasta via Netlify Identity/httpBasic.)

### O que dá para fazer sem código

- **Criar, editar e excluir páginas** do site com um editor de blocos
  (banner, textos, colunas, cartões, imagens, galerias e botões);
- **Status**: `Publicada` (visível) ou `Rascunho` (só aparece com link de preview);
- **Menu**: escolha se a página aparece no menu principal e em qual ordem;
- **Biblioteca de mídia**: envie fotos do computador (otimizadas para máx. 1100px)
  ou use URLs;
- **Permalink automático**: cada página ganha endereço `pagina.html?slug=…`;
- **Pré-visualizar** antes de publicar.

### Como publicar para todos os visitantes

O painel salva no navegador (localStorage). Para o mundo ver:

1. No painel, clique em **“Publicar p/ o site”** — o arquivo `cms-conteudo.json` é baixado;
2. Substitua o `cms-conteudo.json` na raiz do repositório (commit);
3. Pronto — todas as páginas do site leem esse arquivo e exibem o conteúdo novo.

## 🖼️ Fotos dos destaques (home)

Os cards da home usam emoji como plano de fundo até que fotos reais sejam
adicionadas. Para usar fotos, salve-as em:

- `images/pratos/costela-defumada.jpg`, `picanha.jpg`, `gouda.jpg`, `fraldinha.jpg`,
  `kroket.jpg`, `salmao.jpg`, `batata.jpg`, `stroopwafel.jpg`
- `images/bebidas/weiss.jpg`, `ipa.jpg`, `lager.jpg`, `stout.jpg`, `amber.jpg`,
  `witbier.jpg`, `saison.jpg`, `regua.jpg`

Os caminhos estão definidos no topo de `js/script.js` (arrays `PRATOS` e `BEBIDAS`).

## 🧪 Testes

Smoke tests com jsdom cobrem site e painel (renderização, login, CRUD de páginas,
mídia e configurações).

## 🛠️ Stack

HTML + CSS + JS puro, sem build e sem dependências externas obrigatórias
(Font Awesome e Roboto via CDN). Hospedado como site estático (Netlify).
