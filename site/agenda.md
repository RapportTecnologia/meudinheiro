---
title: Agenda e compartilhamento
description: Agenda segura, QR Code e solicitações pela área de transferência.
permalink: /agenda/
---

<header class="doc-hero">
  <div class="shell">
    <p class="section-kicker">Destinatários</p>
    <h1>Agenda e compartilhamento</h1>
    <p>Conveniência sem transformar um contato frequente, QR Code ou conteúdo copiado em autorização automática.</p>
    <div class="doc-meta"><span>Contatos locais</span><span>EIP-681</span><span>QR Code</span><span>Clipboard</span></div>
  </div>
</header>

<div class="shell document">
  <aside class="doc-aside">
    <strong>Nesta página</strong>
    <a href="#agenda">Agenda local</a>
    <a href="#conflitos">Conflitos</a>
    <a href="#novo">Novo endereço</a>
    <a href="#clipboard">Clipboard</a>
    <a href="#protecao">Proteção</a>
  </aside>
  <article class="doc-content">
    <section id="agenda" class="content-card highlight">
      <h2>Agenda interna</h2>
      <p>A agenda não depende dos contatos do Android. Armazena nome, endereço público, favorito, criação, último uso e contador — nunca chave privada ou seed.</p>
      <p>A ordem combina favoritos, frequência e recência.</p>
    </section>

    <section id="conflitos" class="content-card">
      <h2>Nomes e endereços únicos</h2>
      <p>Nomes são normalizados por Unicode, espaços e caixa. Endereços passam por normalização EVM. Conflitos orientam escolher outro nome ou editar o contato existente.</p>
      <p>Alterar endereço mostra o valor completo e exige confirmação explícita.</p>
    </section>

    <section id="novo" class="content-card">
      <h2>Novo destinatário</h2>
      <ol>
        <li>A revisão identifica que o endereço não está na agenda.</li>
        <li>O usuário escolhe salvar ou não salvar.</li>
        <li>Ao salvar, informa um nome único.</li>
        <li>O contato é persistido somente após confirmação on-chain.</li>
      </ol>
    </section>

    <section id="clipboard" class="content-card">
      <h2>Solicitação compartilhável</h2>
      <p>QR e clipboard reutilizam a mesma URI EIP-681, contendo contrato oficial, chainId 137, destino e quantidade nas menores unidades.</p>
      <p>O app só lê a área de transferência após ação explícita e nunca envia automaticamente.</p>
    </section>

    <section id="protecao" class="content-card">
      <h2>Proteção contra address poisoning</h2>
      <ul>
        <li>Mostrar endereço abreviado e oferecer visualização completa.</li>
        <li>Nunca atualizar contato automaticamente por QR ou clipboard.</li>
        <li>Manter destino completo na revisão.</li>
        <li>Registrar uso somente depois da confirmação da transação.</li>
      </ul>
      <a href="https://github.com/RapportTecnologia/meudinheiro/blob/main/docs/CONTACTS_AND_SHARING.md">Consultar especificação completa no GitHub ↗</a>
    </section>
  </article>
</div>

