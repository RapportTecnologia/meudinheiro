<div align="center">
  <h1>Meu Dinheiro — Site Jekyll</h1>
  <p>Fonte, compilação, publicação e operação do site documental.</p>

  <img alt="Documento Site" src="https://img.shields.io/badge/documento-Site%20Jekyll-f97316?style=flat-square">
  <a href="https://github.com/RapportTecnologia/meudinheiro/actions/workflows/site.yml"><img alt="Build do site" src="https://img.shields.io/github/actions/workflow/status/RapportTecnologia/meudinheiro/site.yml?branch=main&style=flat-square&label=site"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/tree/site"><img alt="Branch site" src="https://img.shields.io/badge/saída-branch%20site-111827?style=flat-square&logo=git"></a>
  <img alt="Visitantes do documento" src="https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-site-doc&label=VISITANTES&labelColor=%23111827&countColor=%23F97316">

  <p><a href="../README.md">Início</a> · <a href="REQUIREMENTS.md">Requisitos</a> · <a href="ARCHITECTURE.md">Arquitetura</a> · <a href="USE_CASES.md">Casos de uso</a></p>
</div>

## 1. Organização

- `site/`: fonte Jekyll versionado na `main`;
- `site/_layouts/`: estrutura HTML compartilhada;
- `site/_data/`: dados de navegação;
- `site/assets/`: estilos e JavaScript;
- `.github/workflows/site.yml`: build, validação e publicação;
- branch `site`: somente o resultado estático compilado.

O branch `site` é uma saída gerada. Alterações manuais nele serão substituídas
pelo próximo build e não devem ser usadas como fonte.

## 2. Pipeline

O workflow é executado quando há alteração em `site/**`, no próprio workflow ou
por acionamento manual.

1. Faz checkout com histórico completo.
2. Compila `site/` para `_site/` com Jekyll.
3. Verifica os arquivos essenciais gerados.
4. Atualiza o branch `site` com o conteúdo compilado.
5. Configura os metadados do GitHub Pages.
6. Envia o mesmo conteúdo como artefato do Pages.
7. Publica o artefato no ambiente `github-pages`.

A publicação no branch ocorre antes da configuração do Pages. Com isso, uma
configuração inicial pendente no repositório não impede que o resultado
compilado seja criado e auditado no branch `site`.

O workflow concede somente as permissões necessárias:

- `contents: write` para atualizar o branch `site`;
- `pages: write` para publicar o site;
- `id-token: write` para autenticação do deployment Pages.

## 3. Estratégia de publicação

O site é publicado diretamente pelo GitHub Actions usando o artefato já
compilado. O branch `site` funciona como cópia auditável do resultado final.

Essa arquitetura evita depender de um segundo build do GitHub Pages após o
push automatizado. O arquivo `.nojekyll` no branch de saída também impede que
o conteúdo compilado seja processado novamente.

URL esperada:

```text
https://rapporttecnologia.github.io/meudinheiro/
```

No repositório, a fonte do Pages deve ser configurada como **GitHub Actions**.

## 4. Desenvolvimento local

Em um ambiente com Ruby e Bundler:

```bash
cd site
bundle install
bundle exec jekyll serve --livereload
```

O site estará disponível no endereço informado pelo Jekyll. O `baseurl`
configurado para produção é `/meudinheiro`.

## 5. Controles

- O pipeline não recebe nem publica chaves privadas ou arquivos `.env`.
- Toda action usada no deployment pertence ao ecossistema oficial do GitHub.
- O job valida páginas essenciais antes de publicar.
- Execuções concorrentes do site são canceladas para evitar ordem incorreta.
- O push para o branch `site` não dispara novamente o workflow.
