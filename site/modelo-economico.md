---
title: Token e gás
description: Token Oficial, cotação em BRL e gás patrocinado pelo Paymaster.
permalink: /modelo-economico/
---

<header class="doc-hero">
  <div class="shell">
    <p class="section-kicker">Modelo operacional</p>
    <h1>Token Oficial, BRL e gás patrocinado</h1>
    <p>O usuário movimenta o Token Oficial. A plataforma assume o gás elegível em POL por meio do Paymaster.</p>
    <div class="doc-meta"><span>ERC-20</span><span>BRL</span><span>ERC-4337</span><span>0 POL para o usuário</span></div>
  </div>
</header>

<div class="shell document">
  <aside class="doc-aside">
    <strong>Nesta página</strong>
    <a href="#token">Token Oficial</a>
    <a href="#cotacao">Cotação</a>
    <a href="#gas">Custo zero</a>
    <a href="#orcamento">Orçamento</a>
    <a href="#conformidade">Conformidade</a>
  </aside>
  <article class="doc-content">
    <section id="token" class="content-card highlight">
      <h2>Único ativo de pagamento</h2>
      <p>Todas as transferências de valor usam o Token Oficial Meu Dinheiro na Polygon. O contrato é definido por ambiente e não pode ser substituído pelo usuário.</p>
    </section>

    <section id="cotacao" class="content-card">
      <h2>Entrada em reais</h2>
      <p>BRL é uma unidade de entrada. A quantidade on-chain é calculada pela relação:</p>
      <p><span class="code-line">quantidadeToken = valorBRL ÷ preçoTokenEmBRL</span></p>
      <p>A cotação informa fonte, horário, validade, identificador e regra de arredondamento.</p>
    </section>

    <section id="gas" class="content-card">
      <h2>Custo de gás: 0 POL para o usuário</h2>
      <p>A Polygon continua cobrando gás. O Paymaster da plataforma paga usando seu depósito no EntryPoint; a Smart Account do usuário transfere somente o Token Oficial.</p>
      <div class="callout">Patrocínio indisponível bloqueia a operação. O app não cria uma cobrança silenciosa de POL como fallback.</div>
    </section>

    <section id="orcamento" class="content-card">
      <h2>Sustentabilidade do Paymaster</h2>
      <p>A plataforma mantém depósito, stake, cotas, teto diário e conciliação de custo por UserOperation. Operações revertidas também podem consumir gás, por isso simulação e proteção contra abuso são obrigatórias.</p>
      <p>“Zero para o usuário” é subsídio operacional, não ausência de custo da rede.</p>
    </section>

    <section id="conformidade" class="content-card">
      <h2>Conformidade</h2>
      <p>Emissão, venda, conversão e subsídio de transações podem gerar obrigações legais, fiscais, contábeis e de prevenção à lavagem de dinheiro. O modelo exige avaliação jurídica antes da operação pública.</p>
      <a href="https://github.com/RapportTecnologia/meudinheiro/blob/main/docs/ECONOMIC_MODEL.md">Consultar modelo completo no GitHub ↗</a>
    </section>
  </article>
</div>
