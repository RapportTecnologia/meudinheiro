---
title: Meu Dinheiro
description: Carteira autocustodial Polygon com calculadora, QR Code e Token Oficial.
permalink: /
---

<section class="hero">
  <div class="shell hero-grid">
    <div>
      <p class="eyebrow">Carteira autocustodial • Polygon PoS</p>
      <h1>Seu dinheiro.<em>Uma interface familiar.</em></h1>
      <p class="hero-copy">
        O Meu Dinheiro transforma uma calculadora funcional na porta de entrada
        para pagamentos com o Token Oficial, mantendo revisão clara,
        autenticação por transação e controle local das contas.
      </p>
      <div class="hero-actions">
        <a class="button" href="{{ '/casos-de-uso/' | relative_url }}">Conhecer os fluxos <span aria-hidden="true">→</span></a>
        <a class="button secondary" href="https://github.com/RapportTecnologia/meudinheiro">Ver código no GitHub <span aria-hidden="true">↗</span></a>
      </div>
    </div>

    <div class="calculator" aria-label="Representação da calculadora do aplicativo">
      <div class="calculator-top">
        <span>Token Oficial</span>
        <span class="network-pill">Polygon</span>
      </div>
      <div class="calculator-display">
        <small>Valor proposto</small>
        <strong>R$ 10,00</strong>
      </div>
      <div class="calculator-actions">
        <span>Enviar</span><span>Receber</span><span>Scan QR</span>
      </div>
      <div class="calculator-keys" aria-hidden="true">
        <span>7</span><span>8</span><span>9</span><span>÷</span>
        <span>4</span><span>5</span><span>6</span><span>×</span>
        <span>1</span><span>2</span><span>3</span><span>−</span>
        <span>0</span><span>,</span><span>=</span><span>+</span>
      </div>
    </div>
  </div>
</section>

<section class="trust-strip" aria-label="Características principais">
  <div class="shell trust-grid">
    <div><strong>Polygon PoS</strong><span>Rede EVM, chainId 137</span></div>
    <div><strong>2 contas</strong><span>Limite local da primeira versão</span></div>
    <div><strong>Token Oficial</strong><span>Único ativo de pagamento</span></div>
    <div><strong>POL</strong><span>Reservado ao pagamento do gás</span></div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="section-heading">
      <div>
        <p class="section-kicker">Proposta do produto</p>
        <h2>Simples na superfície.<br>Rigoroso por dentro.</h2>
      </div>
      <p>
        A calculadora prepara a intenção. Nenhum cálculo, QR Code ou contato
        autoriza sozinho uma movimentação blockchain.
      </p>
    </div>

    <div class="card-grid">
      <article class="feature-card">
        <h3>Calcule em reais</h3>
        <p>
          O valor em BRL é convertido para a quantidade adequada do Token
          Oficial por uma cotação identificada e com validade.
        </p>
      </article>
      <article class="feature-card">
        <h3>Escolha o destinatário</h3>
        <p>
          Use QR Code, solicitação copiada ou agenda local com favoritos,
          frequência, recência e proteção contra duplicidades.
        </p>
      </article>
      <article class="feature-card">
        <h3>Revise e autentique</h3>
        <p>
          Destino, token, quantidade, cotação e gás são revisados antes da
          biometria, PIN ou padrão do dispositivo.
        </p>
      </article>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="shell">
    <div class="section-heading">
      <div>
        <p class="section-kicker">Jornada de pagamento</p>
        <h2>Da calculadora à Polygon.</h2>
      </div>
      <p>Um fluxo previsível para compras, abastecimentos e transferências pessoais.</p>
    </div>

    <div class="flow-grid">
      <article class="flow-card"><h3>Informe</h3><p>Digite o valor em BRL ou em unidades do Token Oficial.</p></article>
      <article class="flow-card"><h3>Resolva</h3><p>Selecione contato, leia QR ou cole uma solicitação EIP-681.</p></article>
      <article class="flow-card"><h3>Confira</h3><p>Valide destino, cotação, saldo do token e POL para gás.</p></article>
      <article class="flow-card"><h3>Autorize</h3><p>Autentique a operação concreta e acompanhe sua confirmação.</p></article>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <div class="section-heading">
      <div>
        <p class="section-kicker">Documentação viva</p>
        <h2>Entenda cada decisão.</h2>
      </div>
      <p>O projeto publica requisitos, arquitetura e regras operacionais de forma transparente.</p>
    </div>

    <div class="card-grid">
      <a class="doc-card" href="{{ '/arquitetura/' | relative_url }}"><div><p class="section-kicker">Engenharia</p><h3>Arquitetura</h3><p>Camadas, domínio, infraestrutura, segurança e decisões técnicas.</p></div><span>Explorar →</span></a>
      <a class="doc-card" href="{{ '/requisitos/' | relative_url }}"><div><p class="section-kicker">Especificação</p><h3>Requisitos</h3><p>Regras funcionais, não funcionais e critérios de aceite.</p></div><span>Explorar →</span></a>
      <a class="doc-card" href="{{ '/casos-de-uso/' | relative_url }}"><div><p class="section-kicker">Experiência</p><h3>Casos de uso</h3><p>Abastecimento, compra, transferência, agenda e clipboard.</p></div><span>Explorar →</span></a>
      <a class="doc-card" href="{{ '/modelo-economico/' | relative_url }}"><div><p class="section-kicker">Operação</p><h3>Token e gás</h3><p>Cotação em BRL, papel do POL e responsabilidades dos comerciantes.</p></div><span>Explorar →</span></a>
      <a class="doc-card" href="{{ '/agenda/' | relative_url }}"><div><p class="section-kicker">Destinatários</p><h3>Agenda segura</h3><p>Contatos frequentes, conflitos, edição e solicitações compartilhadas.</p></div><span>Explorar →</span></a>
      <a class="doc-card" href="https://github.com/RapportTecnologia/meudinheiro"><div><p class="section-kicker">Código aberto</p><h3>Repositório</h3><p>React Native, Expo, ethers.js, testes e histórico de implementação.</p></div><span>Abrir GitHub ↗</span></a>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell safety-panel">
    <div>
      <p class="section-kicker">Segurança por padrão</p>
      <h2>Uma intenção nunca é uma autorização.</h2>
      <p>
        Chaves não pertencem ao estado público. O QR e o clipboard são entradas
        não confiáveis. Toda movimentação exige revisão e autenticação local.
      </p>
      <div class="button-row">
        <a class="button secondary" href="{{ '/requisitos/' | relative_url }}">Ler requisitos de segurança</a>
      </div>
    </div>
    <div class="safety-list">
      <div><strong>Segredos isolados</strong><span>Chaves privadas ficam no armazenamento seguro do dispositivo.</span></div>
      <div><strong>Rede verificada</strong><span>As operações devem confirmar Polygon PoS, chainId 137.</span></div>
      <div><strong>Gás independente</strong><span>Saldo do token e saldo POL são condições separadas.</span></div>
      <div><strong>Protótipo responsável</strong><span>Fundos reais exigem auditoria, testes de integração e threat model.</span></div>
    </div>
  </div>
</section>

