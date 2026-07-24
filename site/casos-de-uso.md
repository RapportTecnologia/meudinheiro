---
title: Casos de uso
description: Histórias e fluxos operacionais do Meu Dinheiro.
permalink: /casos-de-uso/
---

<header class="doc-hero">
  <div class="shell">
    <p class="section-kicker">Experiência do usuário</p>
    <h1>Histórias e casos de uso</h1>
    <p>Como clientes, comerciantes e amigos usam o mesmo modelo de solicitação para diferentes acordos de pagamento.</p>
    <div class="doc-meta"><span>Abastecimento</span><span>Compra</span><span>Transferência</span><span>Agenda</span></div>
  </div>
</header>

<div class="shell document">
  <aside class="doc-aside">
    <strong>Nesta página</strong>
    <a href="#abastecer">Abastecer</a>
    <a href="#pagar">Pagar compra</a>
    <a href="#transferir">Transferir</a>
    <a href="#compartilhar">Compartilhar</a>
    <a href="#novo-contato">Novo contato</a>
  </aside>
  <article class="doc-content">
    <section id="abastecer" class="content-card highlight">
      <h2>Abastecer em estabelecimento</h2>
      <ol>
        <li>O cliente solicita um valor em reais.</li>
        <li>O app aplica a paridade bruta de R$ 1,00 por Token Oficial.</li>
        <li>O cliente apresenta QR com endereço e quantidade.</li>
        <li>O comerciante verifica contraprestação e estoque.</li>
        <li>Após autenticação, envia o Token Oficial com gás patrocinado.</li>
      </ol>
    </section>

    <section id="pagar" class="content-card">
      <h2>Pagar uma compra</h2>
      <ol>
        <li>O caixa informa o preço em BRL e gera a cobrança.</li>
        <li>O cliente lê o QR e revisa paridade, tokens e destino.</li>
        <li>O app verifica saldo do Token Oficial e elegibilidade do Paymaster.</li>
        <li>O cliente autentica; a plataforma paga o gás; todos acompanham a confirmação.</li>
      </ol>
    </section>

    <section id="transferir" class="content-card">
      <h2>Transferir para um amigo</h2>
      <p>O destinatário pode apresentar QR, copiar uma URI EIP-681 ou já estar na agenda. O emissor sempre chega à mesma revisão e vê custo de gás 0 POL antes da autenticação.</p>
    </section>

    <section class="content-card">
      <h2>Carga via Pix</h2>
      <p>Um depósito de R$ 100 liquidado na reserva emite exatamente 100 tokens. Operação e referência Pix são únicas; repetição não altera a oferta.</p>
    </section>

    <section class="content-card">
      <h2>Resgate para Pix</h2>
      <p>Os tokens são bloqueados antes do pagamento bancário. A tela mostra bruto, taxa de 0,5% a 1% e líquido. Após o Pix confirmado ocorre o Burn; em falha, o valor integral é estornado.</p>
    </section>

    <section id="compartilhar" class="content-card">
      <h2>Compartilhar solicitação</h2>
      <p>O código contém contrato, Polygon, destino e quantidade proposta. O pagador escolhe explicitamente colar, valida o conteúdo e só então revisa a intenção.</p>
    </section>

    <section id="novo-contato" class="content-card">
      <h2>Salvar novo destinatário</h2>
      <p>Quando o endereço não existe na agenda, o app pergunta se deve salvá-lo. Nome e endereço passam por verificação de conflitos antes da autenticação, mas a persistência só ocorre após o recibo confirmado.</p>
      <a href="https://github.com/RapportTecnologia/meudinheiro/blob/main/docs/USE_CASES.md">Consultar histórias completas no GitHub ↗</a>
    </section>
  </article>
</div>
