<div align="center">
  <h1>Meu Dinheiro — Site Jekyll</h1>
  <p>Fonte, compilação e publicação do site documental.</p>

  <img alt="Documento Site" src="https://img.shields.io/badge/documento-Site%20Jekyll-f97316?style=flat-square">
  <a href="https://github.com/RapportTecnologia/meudinheiro/actions/workflows/jekyll-gh-pages.yml"><img alt="Build do site" src="https://img.shields.io/github/actions/workflow/status/RapportTecnologia/meudinheiro/jekyll-gh-pages.yml?branch=main&style=flat-square&label=pages"></a>
  <img alt="Estratégia" src="https://img.shields.io/badge/deploy-GitHub%20Pages-222222?style=flat-square&logo=github">
  <img alt="Visitantes do documento" src="https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-site-doc&label=VISITANTES&labelColor=%23111827&countColor=%23F97316">

  <p><a href="../README.md">Início</a> · <a href="REQUIREMENTS.md">Requisitos</a> · <a href="ARCHITECTURE.md">Arquitetura</a> · <a href="USE_CASES.md">Casos de uso</a></p>
</div>

## 1. Organização

- `site/`: fonte Jekyll versionado na `main`;
- `site/_layouts/`: estrutura HTML compartilhada;
- `site/_data/`: dados de navegação;
- `site/assets/`: estilos, JavaScript e imagens;
- `.github/workflows/jekyll-gh-pages.yml`: único workflow do site;
- `_site/`: resultado temporário gerado durante o job de build;
- artefato `github-pages`: pacote entregue ao job oficial de deployment.

## 2. Decisão de CI/CD

O projeto usa exclusivamente o padrão de GitHub Pages baseado em artefato.
Não existe um segundo workflow para Jekyll e o branch `site` não participa da
publicação.

Essa decisão elimina a disputa entre dois workflows que tentavam publicar no
mesmo ambiente `github-pages`:

- o workflow padrão compilava por engano a raiz `./`;
- o workflow customizado compilava `./site` e gravava o resultado em um branch;
- ambos possuíam jobs de deploy para o mesmo ambiente.

O workflow consolidado mantém a estrutura do template oficial, mas configura
corretamente `source: ./site` e `destination: ./_site`.

## 3. Pipeline

O workflow é executado quando há alteração em `site/**`, no próprio workflow ou
por acionamento manual.

1. Faz checkout da `main`.
2. Configura os metadados do GitHub Pages.
3. Compila `site/` para `_site/` com Jekyll.
4. Verifica páginas, estilos, imagens da marca e sitemap.
5. Envia `_site/` com `actions/upload-pages-artifact`.
6. Publica o artefato com `actions/deploy-pages`.

Actions utilizadas:

- `actions/checkout@v7`;
- `actions/configure-pages@v6`;
- `actions/jekyll-build-pages@v1`;
- `actions/upload-pages-artifact@v5`;
- `actions/deploy-pages@v5`.

## 4. Permissões e concorrência

O workflow declara somente:

- `contents: read` para ler o repositório;
- `pages: write` para criar o deployment;
- `id-token: write` para autenticação federada do Pages.

O grupo de concorrência é `pages` e uma publicação em andamento não é
cancelada. Isso segue o comportamento conservador do template do GitHub para
deployments de produção.

## 5. URL

URL prevista:

```text
https://rapporttecnologia.github.io/meudinheiro/
```

Em **Settings → Pages**, a fonte de publicação deve permanecer configurada
como **GitHub Actions**.

## 6. Desenvolvimento local

Em um ambiente com Ruby e Bundler:

```bash
cd site
bundle install
bundle exec jekyll serve --livereload
```

O `baseurl` de produção é `/meudinheiro`.

## 7. Controles

- o pipeline não recebe chaves privadas nem arquivos `.env`;
- todas as actions de deployment pertencem ao GitHub;
- páginas essenciais, sitemap e imagens são verificados antes do deploy;
- a página `/custo-zero/` documenta Smart Account, Bundler e Paymaster;
- apenas um workflow possui permissão para publicar no ambiente Pages;
- o site novo, sua identidade visual e seus assets permanecem em `site/`.
