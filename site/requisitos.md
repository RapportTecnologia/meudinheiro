---
title: Requisitos
description: Requisitos funcionais, de segurança e de qualidade do Meu Dinheiro.
permalink: /requisitos/
---

<header class="doc-hero">
  <div class="shell">
    <p class="section-kicker">Especificação</p>
    <h1>Requisitos do produto</h1>
    <p>Contrato verificável entre regras de negócio, experiência do usuário, segurança mobile e comportamento on-chain.</p>
    <div class="doc-meta"><span>Documento evolutivo</span><span>TDD</span><span>Android</span><span>Web3 mobile</span></div>
  </div>
</header>

<div class="shell document">
  <aside class="doc-aside">
    <strong>Nesta página</strong>
    <a href="#funcionais">Funcionais</a>
    <a href="#transacoes">Transações</a>
    <a href="#contatos">Contatos</a>
    <a href="#seguranca">Segurança</a>
    <a href="#aceite">Aceite</a>
  </aside>
  <article class="doc-content">
    <section id="funcionais" class="content-card highlight">
      <h2>Capacidades funcionais</h2>
      <ul>
        <li>Calculadora com operações básicas e parser restrito.</li>
        <li>Até duas EOAs proprietárias e suas Smart Accounts ERC-4337.</li>
        <li>Token Oficial ERC-20 fixado por configuração confiável.</li>
        <li>Entrada em BRL convertida por cotação válida.</li>
        <li>Leitura e geração de solicitações EIP-681.</li>
      </ul>
    </section>

    <section id="transacoes" class="content-card">
      <h2>Transações</h2>
      <ul>
        <li>O ativo de pagamento é sempre o Token Oficial.</li>
        <li>O Paymaster paga POL em operações elegíveis.</li>
        <li>O usuário final paga 0 POL pelo gás patrocinado.</li>
        <li>Toda operação exibe revisão, patrocinador e destino.</li>
        <li>Biometria, PIN ou padrão são obrigatórios para movimentar fundos.</li>
      </ul>
    </section>

    <section id="contatos" class="content-card">
      <h2>Agenda</h2>
      <p>Destinatários são ordenados por favorito, frequência e recência. Nomes normalizados e endereços EVM devem ser únicos.</p>
      <div class="callout">Ao enviar para endereço desconhecido, o usuário escolhe salvar ou não. O contato só é criado depois da confirmação da transferência.</div>
    </section>

    <section id="seguranca" class="content-card">
      <h2>Segurança</h2>
      <ul>
        <li>Nenhum segredo em Zustand, AsyncStorage, logs ou analytics.</li>
        <li>Autenticação vinculada a uma operação concreta e temporária.</li>
        <li>Valores on-chain representados por inteiros <code>bigint</code>.</li>
        <li>Falha de RPC, cotação ou patrocínio produz bloqueio seguro.</li>
        <li>Não existe fallback silencioso para transação EOA paga pelo usuário.</li>
        <li>Produção depende de auditoria, threat model e pentest.</li>
      </ul>
    </section>

    <section id="aceite" class="content-card">
      <h2>Critérios essenciais</h2>
      <p>A terceira conta é rejeitada; QR inválido não altera destino; autenticação precede acesso à chave; patrocínio recusado não cobra POL; calldata adulterada é rejeitada; nome ou endereço duplicado bloqueia o contato.</p>
      <a href="https://github.com/RapportTecnologia/meudinheiro/blob/main/docs/REQUIREMENTS.md">Consultar requisitos completos no GitHub ↗</a>
    </section>
  </article>
</div>
