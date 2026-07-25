---
layout: default
title: Pagamentos off-line
description: Layer 3 regional para pagamentos locais temporariamente sem internet, com liquidação posterior na Polygon.
permalink: /offline/
---

<section class="page-hero compact-hero">
  <div class="shell narrow">
    <p class="eyebrow">Layer 3 regional</p>
    <h1>Valor local mesmo quando a conexão falha.</h1>
    <p class="lead">Notas pré-financiadas circulam por QR, ficam pendentes no dispositivo e são liquidadas na Polygon quando a internet volta.</p>
  </div>
</section>

<section class="section">
  <div class="shell narrow prose">
    <h2>Como funciona</h2>
    <ol>
      <li>Com internet, a Smart Account bloqueia Token Oficial numa reserva regional.</li>
      <li>A API confere a reserva e assina notas até o saldo bloqueado.</li>
      <li>Sem internet, o pagador autentica e mostra um QR ao recebedor.</li>
      <li>O recebedor valida assinaturas e guarda o pagamento como <strong>pendente off-line</strong>.</li>
      <li>Ao reconectar, a API rejeita gasto repetido e o worker liquida o lote na Polygon.</li>
    </ol>

    <div class="callout warning">
      <h2>Pendente não é liquidado</h2>
      <p>Sem conexão, o recebedor não consulta a lista global de notas gastas. Existe risco de gasto duplo até a sincronização. O produto usa limites baixos, validade curta, pré-financiamento e avisos explícitos.</p>
    </div>

    <h2>Segurança por desenho</h2>
    <ul>
      <li>biometria, PIN ou padrão em emissão, envio, aceitação e sincronização;</li>
      <li>segredos no SecureStore, fora de Zustand, logs e telemetria;</li>
      <li>região, Token Oficial, emissor, valor, destinatário e prazo assinados;</li>
      <li>gasto único transacional no PostgreSQL e replay bloqueado no Diamond;</li>
      <li>saldo não usado só retorna após a janela de sincronização.</li>
    </ul>

    <h2>Inspiração responsável</h2>
    <p>O recurso foi inspirado conceitualmente no <a href="https://github.com/minibits-cash/minibits_wallet">Minibits Wallet</a> e no <a href="https://docs.cashu.space/protocol">protocolo Cashu</a>. O protocolo Meu Dinheiro v1 é independente: não copia código, não usa assinaturas cegas e não declara interoperabilidade Cashu.</p>
    <p>É uma base experimental. Fundos reais exigem auditoria independente, piloto limitado e validações jurídica, regulatória, contábil e de privacidade.</p>
    <p><a class="button primary" href="https://github.com/RapportTecnologia/meudinheiro/blob/main/docs/OFFLINE_LAYER3.md">Ler a especificação técnica</a></p>
  </div>
</section>
