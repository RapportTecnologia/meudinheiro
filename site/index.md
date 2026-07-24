---
title: Meu Dinheiro
description: Meu Dinheiro fortalece a região com pagamentos no Token Oficial, calculadora, QR Code e segurança na Polygon.
permalink: /
---

<section class="hero brand-hero">
  <picture class="hero-art" aria-hidden="true">
    <source srcset="{{ '/assets/images/hero-regiao.webp' | relative_url }}" type="image/webp">
    <img
      src="{{ '/assets/images/social-card.jpg' | relative_url }}"
      width="1672"
      height="941"
      alt=""
      fetchpriority="high"
    >
  </picture>
  <div class="hero-scrim" aria-hidden="true"></div>
  <div class="shell hero-grid">
    <div class="hero-content">
      <p class="eyebrow">Tecnologia que circula valor perto de você</p>
      <h1>Meu Dinheiro.<em>Fortalece minha região.</em></h1>
      <p class="hero-copy">
        Uma carteira Polygon com a simplicidade de uma calculadora, criada para
        tornar pagamentos locais mais acessíveis, seguros e conectados à
        comunidade.
      </p>
      <div class="hero-actions">
        <a class="button" href="{{ '/casos-de-uso/' | relative_url }}">Conhecer os fluxos <span aria-hidden="true">→</span></a>
        <a class="button secondary" href="https://github.com/RapportTecnologia/meudinheiro">Ver código no GitHub <span aria-hidden="true">↗</span></a>
      </div>
      <div class="brand-signature" aria-label="Princípios da marca">
        <span>Simples para usar</span>
        <span>Local por propósito</span>
        <span>Seguro por padrão</span>
      </div>
    </div>
  </div>
</section>

<section class="trust-strip" aria-label="Características principais">
  <div class="shell trust-grid">
    <div><strong>Polygon PoS</strong><span>Rede EVM, chainId 137</span></div>
    <div><strong>2 contas</strong><span>Limite local da primeira versão</span></div>
    <div><strong>Token Oficial</strong><span>Único ativo de pagamento</span></div>
    <div><strong>0 POL</strong><span>Gás patrocinado para o usuário</span></div>
  </div>
</section>

<section class="section product-section">
  <div class="shell product-grid">
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
    <div class="product-copy">
      <p class="section-kicker">Familiar desde o primeiro toque</p>
      <h2>A calculadora prepara. Você revisa e autoriza.</h2>
      <p>
        O valor digitado se transforma em uma intenção de pagamento. Antes de
        qualquer transferência, o aplicativo mostra destino, cotação, saldo do
        Token Oficial e patrocínio do gás pela plataforma.
      </p>
      <ul class="brand-values">
        <li><strong>Clareza</strong><span>O usuário entende quanto e para quem está enviando.</span></li>
        <li><strong>Proximidade</strong><span>Agenda, QR Code e comerciantes conectam a economia da região.</span></li>
        <li><strong>Proteção</strong><span>Toda transação exige biometria, PIN ou padrão.</span></li>
      </ul>
    </div>
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
          Destino, token, quantidade, cotação e UserOperation patrocinada são
          revisados antes da biometria, PIN ou padrão do dispositivo.
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
      <article class="flow-card"><h3>Confira</h3><p>Valide destino, cotação, saldo do token e custo de gás 0 POL.</p></article>
      <article class="flow-card"><h3>Autorize</h3><p>Assine a UserOperation; o Paymaster paga o gás.</p></article>
    </div>
  </div>
</section>

<section class="section regional-section">
  <div class="shell regional-grid">
    <figure class="regional-art">
      <img
        src="{{ '/assets/images/ecossistema-local.webp' | relative_url }}"
        width="1448"
        height="1086"
        loading="lazy"
        alt="Ilustração de moradores e pequenos comércios conectados por pagamentos digitais seguros na mesma região"
      >
    </figure>
    <div class="regional-copy">
      <p class="section-kicker">Fortalece minha região</p>
      <h2>Quando o valor circula perto, a comunidade avança junto.</h2>
      <p>
        O Meu Dinheiro aproxima pessoas e pequenos negócios com uma experiência
        comum de pagamento. A tecnologia fica nos bastidores; na frente,
        permanecem confiança, autonomia e relações locais.
      </p>
      <div class="impact-grid">
        <div><strong>Moradores</strong><span>Pagam e transferem o Token Oficial com revisão simples.</span></div>
        <div><strong>Comerciantes</strong><span>Abastecem a circulação regional sem exigir POL do cliente.</span></div>
        <div><strong>Comunidade</strong><span>Constrói uma rede transparente, aberta e interoperável.</span></div>
      </div>
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
      <a class="doc-card" href="{{ '/modelo-economico/' | relative_url }}"><div><p class="section-kicker">Operação</p><h3>Token e gás</h3><p>Cotação em BRL, orçamento do Paymaster e sustentabilidade.</p></div><span>Explorar →</span></a>
      <a class="doc-card" href="{{ '/custo-zero/' | relative_url }}"><div><p class="section-kicker">ERC-4337</p><h3>Custo zero</h3><p>Smart Account, Bundler, Paymaster e validação defensiva.</p></div><span>Explorar →</span></a>
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
      <div><strong>Gás patrocinado</strong><span>O Paymaster paga POL; a operação custa 0 POL ao usuário.</span></div>
      <div><strong>Protótipo responsável</strong><span>Fundos reais exigem auditoria, testes de integração e threat model.</span></div>
    </div>
  </div>
</section>
