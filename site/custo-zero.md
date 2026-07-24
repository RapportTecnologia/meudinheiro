---
title: Custo zero
description: Como Smart Accounts, Bundler e Paymaster ERC-4337 removem a exigência de POL do usuário.
permalink: /custo-zero/
---

<header class="doc-hero">
  <div class="shell">
    <p class="section-kicker">Account Abstraction</p>
    <h1>O usuário assina. A plataforma paga o gás.</h1>
    <p>Uma experiência simples de pagamento sobre uma arquitetura ERC-4337 verificável e protegida contra abuso.</p>
    <div class="doc-meta"><span>Smart Account</span><span>Bundler</span><span>EntryPoint v0.7</span><span>Paymaster</span></div>
  </div>
</header>

<div class="shell document">
  <aside class="doc-aside">
    <strong>Nesta página</strong>
    <a href="#conceito">Conceito</a>
    <a href="#fluxo">Fluxo</a>
    <a href="#validacao">Validação</a>
    <a href="#falhas">Falhas</a>
    <a href="#producao">Produção</a>
  </aside>
  <article class="doc-content">
    <section id="conceito" class="content-card highlight">
      <h2>Custo zero no ponto de uso</h2>
      <p>Cada EOA controla uma Smart Account na Polygon. O usuário mantém apenas o Token Oficial. A UserOperation é assinada no dispositivo e o Paymaster paga o gás em POL.</p>
      <div class="callout">A rede ainda cobra gás. O custo é assumido e contabilizado pela plataforma, não debitado do usuário.</div>
    </section>

    <section id="fluxo" class="content-card">
      <h2>Do toque ao bloco</h2>
      <ol>
        <li>O usuário revisa Token Oficial, destino e quantidade.</li>
        <li>Biometria, PIN ou padrão autoriza a operação concreta.</li>
        <li>O Gateway prepara e patrocina uma UserOperation.</li>
        <li>O app confere a operação e assina o hash localmente.</li>
        <li>Bundler envia ao EntryPoint; Smart Account executa.</li>
        <li>Paymaster paga POL e o app concilia o recibo.</li>
      </ol>
    </section>

    <section id="validacao" class="content-card">
      <h2>Confiança mínima no Gateway</h2>
      <p>Antes de assinar, o app decodifica <code>callData</code>, compara Smart Account, Token Oficial, destino, quantidade e valor nativo zero. Também verifica EntryPoint, validade, limites de gás, Paymaster e reproduz <code>getUserOpHash</code>.</p>
      <p>O backend repete essas regras, simula e aplica cotas. A chave privada nunca sai do aparelho.</p>
    </section>

    <section id="falhas" class="content-card">
      <h2>Falha segura</h2>
      <ul>
        <li>Patrocínio recusado: não assinar e não cobrar POL.</li>
        <li>Gateway indisponível: não usar transação EOA como fallback.</li>
        <li>Hash ou calldata divergente: descartar a operação.</li>
        <li>Operação pendente: conciliar pelo <code>userOpHash</code>.</li>
      </ul>
    </section>

    <section id="producao" class="content-card">
      <h2>Requisitos de produção</h2>
      <p>Factory e Paymaster auditados, KMS/HSM, depósito e stake, rate limit, idempotência, proteção contra replay/griefing, alertas financeiros e testes em Amoy/fork são pré-requisitos.</p>
      <a href="https://github.com/RapportTecnologia/meudinheiro/blob/main/docs/ACCOUNT_ABSTRACTION.md">Consultar arquitetura ERC-4337 completa no GitHub ↗</a>
    </section>
  </article>
</div>
