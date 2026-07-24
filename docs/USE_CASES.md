<div align="center">
  <h1>Meu Dinheiro — Histórias e casos de uso</h1>
  <p>Fluxos de abastecimento, pagamento, transferência e agenda.</p>

  <img alt="Documento Casos de uso" src="https://img.shields.io/badge/documento-Casos%20de%20uso-f97316?style=flat-square">
  <a href="https://github.com/RapportTecnologia/meudinheiro"><img alt="Repositório público" src="https://img.shields.io/badge/repositório-público-111827?style=flat-square&logo=github"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/commits/main/docs/USE_CASES.md"><img alt="Última atualização" src="https://img.shields.io/github/last-commit/RapportTecnologia/meudinheiro?style=flat-square&color=f97316&label=atualização"></a>
  <img alt="Formato BDD" src="https://img.shields.io/badge/formato-Histórias%20e%20fluxos-111827?style=flat-square">
  <img alt="Visitantes dos casos de uso" src="https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-use-cases&label=VISITANTES&labelColor=%23111827&countColor=%23F97316">

  <p><a href="../README.md">Início</a> · <a href="REQUIREMENTS.md">Requisitos</a> · <a href="ARCHITECTURE.md">Arquitetura</a> · <a href="ECONOMIC_MODEL.md">Modelo econômico</a> · <a href="ACCOUNT_ABSTRACTION.md">ERC-4337</a> · <a href="CONTACTS_AND_SHARING.md">Agenda</a></p>
</div>

## Premissas comuns

- A rede é Polygon PoS (`chainId` 137).
- A pessoa que paga controla uma Smart Account com saldo do Token Oficial.
- A pessoa que recebe possui uma conta ativa no Meu Dinheiro.
- O Token Oficial Meu Dinheiro é o único ativo de pagamento.
- Em pagamentos, carga e resgate, 1 Token Oficial corresponde a R$ 1,00 bruto.
- O Paymaster da plataforma paga o gás; o usuário final paga `0 POL`.
- O QR Code segue EIP-681 e contém rede, destinatário, contrato oficial e a
  quantidade calculada de tokens.
- O QR nunca autoriza nem executa uma transação sozinho.
- Toda aprovação, transferência ou swap exige biometria, PIN ou padrão do
  dispositivo pagador.
- O Pix é processado por banco/PSP integrado ao Gateway fiduciário; o smart
  contract nunca acessa a rede bancária.
- Novos tokens só são emitidos após Pix liquidado na reserva segregada.

## UC-01 — abastecer a carteira em um estabelecimento

### História

Como cliente, quero entregar R$ 10 ao caixa e receber a quantidade equivalente
do Token Oficial, calculada pela cotação vigente, para abastecer minha carteira
após o caixa conferir o dinheiro.

### Fluxo principal

1. O cliente informa ao caixa que deseja abastecer a carteira com R$ 10.
2. O caixa confere e aceita o meio de pagamento externo.
3. No Meu Dinheiro, o cliente seleciona BRL como unidade de entrada.
4. O cliente digita `10` na calculadora.
5. O app exibe 10 tokens pela paridade bruta de R$ 1,00 e toca em **Receber**.
6. O cliente aceita o valor e toca em **Receber**.
7. O app exibe uma solicitação contendo Polygon, contrato oficial, endereço da
   carteira e quantidade ERC-20 calculada.
8. O caixa lê o QR Code e verifica o estoque do token.
9. O aplicativo do caixa mostra BRL, tokens, rede e destinatário.
10. O caixa confirma e autentica com biometria, PIN ou padrão.
11. O app valida e assina uma UserOperation; o Paymaster paga o gás.
12. As partes conferem o `userOpHash`, a transação e a confirmação na Polygon.

### Exceções

- Cotação indisponível ou vencida: não gerar cobrança em BRL.
- Token diferente do configurado: rejeitar a solicitação.
- Caixa não confirma o recebimento externo: não transferir.
- Falta de token: informar sem simular sucesso.
- Patrocínio indisponível: bloquear sem cobrar POL da conta do caixa.
- Autenticação cancelada: encerrar sem transmitir.

### Observação de negócio

O fluxo de balcão é uma transferência de estoque já emitido. Ele não cria
oferta. A entrada primária de novos tokens ocorre pelo caso Pix/Mint, sempre
lastreada na reserva.

## UC-02 — pagar uma compra no caixa

### História

Como caixa, quero digitar o preço da compra e gerar uma cobrança QR com o valor
exato, para que o cliente revise e autorize o pagamento na própria carteira.

### Fluxo principal

1. O caixa digita o preço da compra em BRL.
2. O app apresenta a mesma quantidade bruta do Token Oficial.
3. O caixa aceita o valor e toca em **Receber**.
4. O app gera um QR EIP-681 com destinatário, contrato oficial e tokens.
5. O cliente toca em **Enviar** ou **Scan QR**.
6. O app valida rede, destinatário, contrato e quantidade.
7. A tela de revisão mostra BRL, tokens, endereço, patrocinador e
   custo `0 POL`.
8. O app confere saldo do Token Oficial e elegibilidade do patrocínio.
9. O cliente autentica com biometria, PIN ou padrão.
10. O app assina a UserOperation, o Paymaster paga o gás e ambos conferem a
    confirmação.

### Exceções

- QR adulterado ou malformado: rejeitar.
- Rede diferente ou token desconhecido: rejeitar.
- Token insuficiente: não assinar e orientar o abastecimento.
- Paymaster recusou ou está indisponível: não assinar e não cobrar POL.
- Duplo toque: manter somente uma tentativa em andamento.

## UC-03 — transferência entre amigos

### História

Como pessoa que deseja receber de um amigo, quero informar o valor e apresentar
um QR Code de cobrança, para que meu amigo possa conferir e autorizar a
transferência.

### Fluxo principal

1. O destinatário informa BRL ou quantidade direta do Token Oficial.
2. Em BRL, o app aplica a paridade bruta.
3. O destinatário toca em **Receber** e apresenta o QR do Token Oficial.
4. O emissor toca em **Enviar** ou **Scan QR** e faz a leitura.
5. O emissor confere BRL, tokens, patrocinador, rede e destinatário.
6. O app verifica Token Oficial e prepara o patrocínio.
7. O emissor autoriza com biometria, PIN ou padrão.
8. O app transmite a UserOperation patrocinada e ambos conferem a confirmação.

### Exceções

- Origem e destinatário iguais: bloquear.
- Pedido sem valor: usar o valor digitado pelo emissor e exigir nova revisão.
- Pedido expirado, quando esse campo for adotado: solicitar novo QR.
- Falha ou cancelamento de autenticação: não transmitir.
- Patrocínio recusado: bloquear sem usar uma transação EOA paga pelo emissor.

## UC-04 — enviar para um contato frequente

### História

Como usuário, quero selecionar um destinatário usado com frequência, para não
precisar ler o QR ou digitar o endereço em cada transferência.

### Fluxo principal

1. O remetente informa o valor em BRL ou Token Oficial.
2. Toca em **Enviar** e abre **Agenda**.
3. A agenda apresenta favoritos e contatos ordenados por uso recente e
   frequência.
4. O remetente seleciona um contato e confere o endereço.
5. O app aplica a paridade BRL quando necessária e monta a intenção.
6. Verifica saldo do Token Oficial e elegibilidade do Paymaster.
7. A tela de revisão mostra contato, endereço, tokens, BRL e custo de
   gás `0 POL`.
8. O remetente autentica e transmite a UserOperation patrocinada.

## UC-05 — solicitar transferência pelo clipboard

### História

Como destinatário, quero copiar um código com minha carteira e o valor proposto,
para enviá-lo ao pagador por um canal escolhido.

### Fluxo principal

1. O destinatário informa o valor e toca em **Receber**.
2. Em BRL, o app aplica a paridade bruta.
3. A tela mostra QR e **Copiar solicitação**.
4. O app copia a URI EIP-681 com contrato oficial, Polygon, endereço e tokens.
5. O destinatário compartilha o texto pelo canal de sua escolha.
6. O pagador abre o app e toca em **Colar solicitação**.
7. O app lê somente após o toque, valida o conteúdo e abre a revisão.
8. O pagador confere Token Oficial e patrocínio, autentica e transmite.

## UC-06 — salvar novo destinatário após transferência

### História

Como usuário, quero ser consultado ao enviar para um endereço ainda não salvo,
para poder identificá-lo por um nome e reutilizá-lo com segurança.

### Fluxo principal

1. QR, clipboard ou entrada manual resolve o endereço de destino.
2. A tela de revisão constata que o endereço não está na agenda.
3. O app pergunta **Salvar** ou **Agora não**.
4. O usuário escolhe **Salvar** e informa um nome.
5. O domínio valida nome e endereço contra toda a agenda.
6. O usuário revisa o pagamento e autentica.
7. O app transmite e aguarda a confirmação.
8. Após a confirmação, salva o contato e registra o primeiro uso.

### Fluxo alternativo

- **Agora não:** a transferência pode continuar, mas não cria contato.
- **Nome repetido:** bloquear o salvamento e orientar outro nome ou edição do
  contato existente.
- **Endereço repetido:** mostrar a qual contato pertence e orientar a edição.
- **Transação falhou ou foi cancelada:** não criar contato.
- **Pagamento confirmado e persistência falhou:** manter o pagamento como
  confirmado e avisar separadamente que o contato não foi salvo.

## UC-07 — editar contato

1. O usuário abre a Agenda e escolhe **Editar**.
2. Altera nome, endereço ou ambos.
3. Se o endereço mudou, o app mostra o novo endereço completo.
4. O usuário confirma explicitamente a alteração.
5. O domínio verifica conflitos, excluindo o próprio registro.
6. A agenda salva os novos dados preservando favorito e métricas.

## UC-08 — ativar uma Smart Account de custo zero

### História

Como usuário, quero ativar uma Smart Account controlada pela minha chave local,
para enviar o Token Oficial sem precisar comprar ou manter POL.

### Fluxo principal

1. O usuário importa uma EOA ou escolhe uma conta existente.
2. Em **Configurações**, toca em **Ativar custo zero**.
3. O app envia somente o endereço público ao Gateway ERC-4337.
4. O Gateway calcula o endereço contrafactual usando a factory auditada.
5. O app confere Polygon, EntryPoint e proprietário.
6. A tela separa o endereço proprietário da Smart Account operacional.
7. Receber, QR Code e saldo passam a usar a Smart Account.
8. Na primeira transferência, o Paymaster também patrocina a implantação.

### Exceções

- Gateway indisponível: manter a EOA cadastrada e não exibir endereço
  operacional não verificado.
- EntryPoint ou proprietário divergente: rejeitar a ativação.
- Fundos existentes na EOA: não migrar automaticamente.

## UC-09 — carregar a carteira via Pix com Mint

### História

Como usuário, quero depositar R$ 100 via Pix e receber exatamente 100 Tokens
Oficiais, para carregar minha carteira com lastro verificável.

### Fluxo principal

1. O usuário digita `100`, abre **Pix** e escolhe **Carregar carteira**.
2. O app mostra paridade bruta, carteira de destino e exige autenticação local.
3. O Gateway cria uma cobrança Pix e uma operação idempotente.
4. O usuário paga; banco/PSP confirma a liquidação na conta de reserva.
5. O reconciliador confere valor e duplicidade, sem colocar PII on-chain.
6. O operador chama `mintFromPix` com operação, destinatário, 100 tokens e hash
   opaco da referência Pix.
7. O contrato rejeita reuso e emite exatamente 100 tokens.
8. O app acompanha os estados `aguardando Pix`, `liquidado` e `emitido`.

### Exceções

- Pix expirado/cancelado: não emitir.
- Valor divergente: bloquear para conciliação manual.
- Webhook repetido: devolver o estado existente sem novo Mint.
- Reserva ou reconciliação divergente: pausar novas emissões.

## UC-10 — resgatar tokens para Pix com taxa

### História

Como comerciante ou usuário elegível, quero resgatar 100 tokens para Pix,
conhecendo antecipadamente a taxa e o valor líquido.

### Fluxo principal

1. O usuário digita `100`, abre **Pix** e escolhe **Resgatar para Pix**.
2. Com taxa de 0,5%, a tela mostra R$ 100,00 brutos, R$ 0,50 de taxa e
   R$ 99,50 líquidos.
3. O usuário revisa o destino Pix e autentica com biometria, PIN ou padrão.
4. A Smart Account envia `requestRedemption` por UserOperation patrocinada.
5. O Diamond bloqueia 100 tokens e emite o evento de solicitação.
6. O reconciliador confirma o bloqueio e o PSP envia R$ 99,50.
7. Após confirmação bancária, o operador finaliza e queima os 100 tokens.
8. A taxa é reconhecida somente após Pix, Burn e conciliação.

### Exceções

- Saldo insuficiente: não preparar a UserOperation.
- Pix falhou: estornar os 100 tokens, sem taxa.
- Operador indisponível: após o timeout, o usuário pode solicitar o estorno.
- Taxa acima de 1% ou diferente da revisão: rejeitar.
- Patrocínio indisponível: bloquear sem cobrar POL do usuário.

## Critérios de aceite dos casos

- O botão **Receber** utiliza o resultado atual da calculadora.
- A seleção de BRL aplica paridade bruta e aritmética inteira.
- A cobrança ERC-20 usa `transfer(address,uint256)` no URI EIP-681.
- POL nunca é solicitado como ativo de pagamento.
- O scanner aceita cobrança com valor ou endereço simples.
- Endereço simples herda o valor e o ativo selecionados pelo pagador.
- Cobrança com valor prevalece sobre o valor local do pagador.
- O app exibe revisão antes de acessar a chave.
- A chave é acessada somente após autenticação bem-sucedida.
- Saldo do Token Oficial e autorização do Paymaster são verificados antes da
  transmissão.
- O usuário final paga `0 POL` numa operação patrocinada.
- Falha do patrocínio não gera fallback silencioso pago pela EOA.
- O QR de recebimento usa a Smart Account.
- O app confere `callData` e reproduz `getUserOpHash` antes da assinatura.
- A interface bloqueia novas submissões enquanto a transação estiver em curso.
- Agenda, QR e clipboard convergem para a mesma revisão.
- O app não lê o clipboard em segundo plano.
- O payload copiado contém destino e quantidade proposta do Token Oficial.
- Um endereço desconhecido produz a pergunta de salvamento na revisão.
- Novo contato só é gravado depois de confirmação on-chain.
- Nome e endereço são únicos; conflitos oferecem orientação acionável.
- Edição de endereço exige confirmação explícita.
- Mint exige Pix liquidado e identificadores não reutilizados.
- Resgate informa bruto, taxa e líquido antes da autenticação.
- Burn só ocorre depois da confirmação bancária; falha produz estorno integral.
