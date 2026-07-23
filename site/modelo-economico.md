---
title: Token e gás
description: Modelo do Token Oficial, cotação em BRL e uso de POL para gás.
permalink: /modelo-economico/
---

<header class="doc-hero">
  <div class="shell">
    <p class="section-kicker">Modelo operacional</p>
    <h1>Token Oficial, BRL e gás</h1>
    <p>Separação explícita entre o ativo que representa o pagamento e o ativo nativo necessário para registrar a transação.</p>
    <div class="doc-meta"><span>ERC-20</span><span>BRL</span><span>POL</span><span>Comerciantes</span></div>
  </div>
</header>

<div class="shell document">
  <aside class="doc-aside">
    <strong>Nesta página</strong>
    <a href="#token">Token Oficial</a>
    <a href="#cotacao">Cotação</a>
    <a href="#gas">Gás em POL</a>
    <a href="#papeis">Papéis</a>
    <a href="#conformidade">Conformidade</a>
  </aside>
  <article class="doc-content">
    <section id="token" class="content-card highlight">
      <h2>Único ativo de pagamento</h2>
      <p>Todas as transferências de valor usam o Token Oficial Meu Dinheiro na Polygon. O contrato deve ser definido por ambiente e não pode ser substituído pelo usuário.</p>
    </section>

    <section id="cotacao" class="content-card">
      <h2>Entrada em reais</h2>
      <p>BRL é uma unidade de entrada. A quantidade on-chain é calculada pela relação:</p>
      <p><span class="code-line">quantidadeToken = valorBRL ÷ preçoTokenEmBRL</span></p>
      <p>A cotação deve informar fonte, horário, validade, identificador e regra de arredondamento. Cálculos usam aritmética decimal ou inteira, nunca ponto flutuante monetário.</p>
    </section>

    <section id="gas" class="content-card">
      <h2>POL para gás</h2>
      <p>Quem envia o Token Oficial precisa de POL. O app estima a chamada ERC-20, aplica margem e compara o custo ao saldo nativo antes da autorização.</p>
      <div class="callout">Ter Token Oficial suficiente não significa ter POL suficiente para registrar a transferência.</div>
    </section>

    <section id="papeis" class="content-card">
      <h2>Usuário e comerciante</h2>
      <p>O usuário comum envia e recebe o Token Oficial e mantém POL para gás. Comerciantes autorizados operam estoque regional, fornecem token/POL e podem utilizar um fluxo separado de swap para gestão operacional.</p>
    </section>

    <section id="conformidade" class="content-card">
      <h2>Conformidade</h2>
      <p>Venda de tokens, fornecimento de POL, conversões e gestão de estoque podem gerar obrigações legais, fiscais, contábeis e de prevenção à lavagem de dinheiro. O modelo exige avaliação jurídica específica antes de operação pública.</p>
      <a href="https://github.com/RapportTecnologia/meudinheiro/blob/main/docs/ECONOMIC_MODEL.md">Consultar modelo completo no GitHub ↗</a>
    </section>
  </article>
</div>

