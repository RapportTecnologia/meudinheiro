---
title: Arquitetura
description: Arquitetura em camadas e decisões técnicas do Meu Dinheiro.
permalink: /arquitetura/
---

<header class="doc-hero">
  <div class="shell">
    <p class="section-kicker">Documento técnico</p>
    <h1>Arquitetura do Meu Dinheiro</h1>
    <p>Separação entre domínio, casos de uso, infraestrutura e apresentação para reduzir o acoplamento de regras financeiras à interface mobile.</p>
    <div class="doc-meta"><span>React Native + Expo</span><span>TypeScript</span><span>ethers.js</span><span>Polygon 137</span></div>
  </div>
</header>

<div class="shell document">
  <aside class="doc-aside">
    <strong>Nesta página</strong>
    <a href="#camadas">Camadas</a>
    <a href="#fluxo">Fluxo transacional</a>
    <a href="#pagamentos">Pedidos de pagamento</a>
    <a href="#agenda">Agenda e clipboard</a>
    <a href="#seguranca">Segurança</a>
  </aside>
  <article class="doc-content">
    <section id="camadas" class="content-card highlight">
      <h2>Arquitetura em camadas</h2>
      <ul>
        <li><strong>Domain:</strong> entidades e invariantes puras de contas, contatos, pagamentos e cotação.</li>
        <li><strong>Application:</strong> casos de uso, estado global e portas substituíveis.</li>
        <li><strong>Infrastructure:</strong> RPC, contratos, SecureStore, autenticação e clipboard.</li>
        <li><strong>Presentation:</strong> navegação, telas e componentes React Native.</li>
      </ul>
      <p>As dependências apontam para dentro: apresentação → aplicação → domínio. Adaptadores de infraestrutura implementam as portas definidas pela aplicação.</p>
    </section>

    <section id="fluxo" class="content-card">
      <h2>Fluxo transacional</h2>
      <ol>
        <li>A calculadora produz uma intenção em BRL ou Token Oficial.</li>
        <li>O cotador transforma BRL em quantidade inteira do token.</li>
        <li>Agenda, QR ou clipboard resolve o destinatário.</li>
        <li>A revisão valida contrato, rede, saldo e gás.</li>
        <li>A autenticação libera apenas aquela operação.</li>
        <li>Um signer efêmero assina, transmite e aguarda o recibo.</li>
      </ol>
    </section>

    <section id="pagamentos" class="content-card">
      <h2>Pedido de pagamento</h2>
      <p>O value object <code>PaymentRequest</code> representa uma solicitação EIP-681. O contrato-alvo é o Token Oficial e a chamada descreve <code>transfer(address,uint256)</code>.</p>
      <div class="callout">QR Code e texto copiado carregam uma intenção. Nenhum dos dois assina ou transmite transações.</div>
    </section>

    <section id="agenda" class="content-card">
      <h2>Agenda e clipboard</h2>
      <p><code>validateContactDraft</code> centraliza nomes e endereços únicos. Um destinatário novo só é salvo após confirmação on-chain; falha de persistência nunca altera o resultado financeiro confirmado.</p>
      <p>O mesmo parser valida QR e clipboard, sempre encaminhando o conteúdo para a tela de revisão.</p>
    </section>

    <section id="seguranca" class="content-card">
      <h2>Fronteiras de segurança</h2>
      <ul>
        <li>Chaves privadas permanecem no armazenamento seguro.</li>
        <li>AsyncStorage contém somente estado público.</li>
        <li>Dados de RPC, QR, contrato e clipboard são não confiáveis.</li>
        <li>Swap e contratos de produção permanecem bloqueados até auditoria.</li>
      </ul>
      <a href="https://github.com/RapportTecnologia/meudinheiro/blob/main/docs/ARCHITECTURE.md">Consultar especificação completa no GitHub ↗</a>
    </section>
  </article>
</div>

