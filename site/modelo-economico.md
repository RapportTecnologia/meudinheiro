---
title: Token, reservas e gás
description: Token Oficial lastreado, Mint & Burn, taxa de resgate e gás patrocinado.
permalink: /modelo-economico/
---

<header class="doc-hero">
  <div class="shell">
    <p class="section-kicker">Modelo operacional</p>
    <h1>Lastro em BRL, Mint & Burn e custo zero</h1>
    <p>Paridade bruta de R$ 1, reserva segregada e gás elegível pago pelo Paymaster.</p>
    <div class="doc-meta"><span>ERC-20</span><span>Pix</span><span>1:1 bruto</span><span>0 POL para o usuário</span></div>
  </div>
</header>

<div class="shell document">
  <aside class="doc-aside">
    <strong>Nesta página</strong>
    <a href="#paridade">Paridade</a>
    <a href="#mint">Mint</a>
    <a href="#burn">Resgate</a>
    <a href="#reservas">Reservas</a>
    <a href="#gas">Custo zero</a>
    <a href="#conformidade">Conformidade</a>
  </aside>
  <article class="doc-content">
    <section id="paridade" class="content-card highlight">
      <h2>1 Token Oficial = R$ 1,00 bruto</h2>
      <p>Cada emissão corresponde a um real efetivamente liquidado na conta segregada. A taxa existe apenas no resgate para Pix e não altera a paridade bruta.</p>
    </section>

    <section id="mint" class="content-card">
      <h2>Entrada via Pix e Mint</h2>
      <p>O Gateway cria a cobrança e aguarda o banco/PSP. Somente após a liquidação, uma operação idempotente emite exatamente a quantidade depositada para a Smart Account.</p>
      <div class="callout">Oferta inicial é zero. Webhook repetido ou referência Pix reutilizada não pode criar novos tokens.</div>
    </section>

    <section id="burn" class="content-card">
      <h2>Resgate seguro em duas fases</h2>
      <p>Os tokens são primeiro bloqueados no Diamond. Depois da confirmação do Pix ao usuário, o operador autorizado conclui o Burn. Se o Pix falhar, os tokens são estornados.</p>
      <p><span class="code-line">Pix líquido = valor bruto − taxa de 0,5% a 1%</span></p>
      <p>Em R$ 100,00 com taxa de 0,5%, o usuário recebe R$ 99,50. A interface mostra tudo antes da autenticação.</p>
    </section>

    <section id="reservas" class="content-card">
      <h2>Reserva integral e sustentabilidade</h2>
      <p><span class="code-line">reserva BRL ≥ circulação + resgates bloqueados ainda não pagos</span></p>
      <p>A sustentabilidade pode vir da taxa de resgate e, quando juridicamente permitido, do rendimento conservador da reserva. O lastro não financia a operação e nenhum rendimento é prometido ao portador.</p>
    </section>

    <section id="gas" class="content-card">
      <h2>Custo de gás: 0 POL para o usuário</h2>
      <p>O Paymaster da plataforma patrocina transferências e pedidos de resgate elegíveis. Se o patrocínio falhar, o app bloqueia sem cobrar POL silenciosamente.</p>
    </section>

    <section id="conformidade" class="content-card">
      <h2>Conformidade antes de fundos reais</h2>
      <p>O modelo exige banco/PSP regulado, KYC/KYB, AML/CFT, segregação patrimonial, conciliação, auditoria independente e parecer jurídico específico para o Brasil.</p>
      <a href="https://github.com/RapportTecnologia/meudinheiro/blob/main/docs/ECONOMIC_MODEL.md">Consultar modelo completo e referências oficiais ↗</a>
    </section>
  </article>
</div>
