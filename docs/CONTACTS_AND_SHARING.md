<div align="center">
  <h1>Meu Dinheiro — Agenda e compartilhamento</h1>
  <p>Contatos frequentes, QR Code, clipboard e proteção de destinatários.</p>

  <img alt="Documento Agenda e compartilhamento" src="https://img.shields.io/badge/documento-Agenda%20e%20compartilhamento-f97316?style=flat-square">
  <a href="https://github.com/RapportTecnologia/meudinheiro"><img alt="Repositório público" src="https://img.shields.io/badge/repositório-público-111827?style=flat-square&logo=github"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/commits/main/docs/CONTACTS_AND_SHARING.md"><img alt="Última atualização" src="https://img.shields.io/github/last-commit/RapportTecnologia/meudinheiro?style=flat-square&color=f97316&label=atualização"></a>
  <img alt="Branch principal" src="https://img.shields.io/badge/branch-main-111827?style=flat-square&logo=git">
  <img alt="Visitantes da agenda" src="https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-contacts&label=VISITANTES&labelColor=%23111827&countColor=%23F97316">

  <p><a href="../README.md">Início</a> · <a href="REQUIREMENTS.md">Requisitos</a> · <a href="ARCHITECTURE.md">Arquitetura</a> · <a href="USE_CASES.md">Casos de uso</a> · <a href="ECONOMIC_MODEL.md">Modelo econômico</a></p>
</div>

## 1. Agenda interna

O aplicativo mantém uma agenda própria de destinatários frequentes. Ela não
depende da agenda telefônica e não solicita acesso aos contatos do Android por
padrão.

Cada contato contém:

- identificador local;
- nome ou apelido informado pelo usuário;
- endereço EVM com checksum;
- data da criação;
- data da última utilização;
- quantidade de utilizações;
- indicação de favorito;
- observação opcional, sem dados sensíveis.

A ordenação padrão combina favoritos, frequência e uso recente. O usuário pode
adicionar, editar e remover contatos. A chave privada, seed, saldo e histórico
completo nunca fazem parte da agenda.

### Proteção contra address poisoning

- Sempre exibir o endereço abreviado e permitir ver o endereço completo.
- Validar checksum antes de salvar ou usar.
- Ao alterar um endereço existente, exigir confirmação explícita.
- Nomes são únicos após remoção de espaços excedentes e comparação sem
  diferença entre maiúsculas e minúsculas.
- Endereços são únicos após normalização EVM.
- Nunca atualizar silenciosamente um contato com base em QR ou clipboard.
- Contatos frequentes são sugestões, não autorização de pagamento.
- A tela de revisão continua mostrando o destinatário completo.

## 2. Envio para um contato

1. O remetente digita um valor em BRL ou em Token Oficial.
2. Em BRL, o QuoteProvider calcula a quantidade do Token Oficial.
3. O remetente toca em **Enviar**.
4. Escolhe **Agenda**, **Ler QR** ou **Colar solicitação**.
5. Ao usar a agenda, seleciona o contato.
6. O app monta a intenção com Token Oficial, valor e endereço.
7. Verifica saldo do token e elegibilidade do patrocínio ERC-4337.
8. Mostra custo de gás `0 POL`, revisão e solicita biometria, PIN ou padrão.
9. Somente após autorização transmite a UserOperation patrocinada.

### Novo destinatário

Quando o endereço resolvido por QR, clipboard ou entrada manual não estiver na
agenda, a tela de revisão deve perguntar se o usuário deseja salvá-lo.

1. O usuário escolhe **Salvar** ou **Agora não** antes de autorizar.
2. Ao escolher salvar, informa um nome único.
3. O domínio valida o nome e o endereço antes de acessar a chave.
4. Se o nome já existir, o app orienta usar outro nome ou editar o contato
   existente.
5. Se o endereço já existir, o app identifica o contato correspondente e
   orienta editar o registro existente.
6. O contato é persistido somente depois que a transferência for confirmada.
7. Uma transferência rejeitada ou não confirmada não cria o contato.

Falha local ao salvar o contato depois de uma confirmação on-chain nunca pode
alterar o estado financeiro para “pagamento não realizado”. O app mostra
**Pagamento confirmado** e acrescenta um aviso de que o contato não foi salvo.

### Edição e conflitos

- Nome e endereço podem ser editados na Agenda.
- A edição preserva favorito, contador, criação e data do último uso.
- Alterar endereço mostra o endereço completo e exige confirmação explícita.
- Um contato não pode assumir nome ou endereço pertencente a outro registro.
- Em conflito, o usuário permanece no formulário para escolher outro nome ou
  editar/remover o contato já existente.

## 3. Solicitação pela área de transferência

Quem deseja receber pode copiar uma solicitação e enviá-la por mensagem, e-mail
ou outro canal escolhido. O app não envia automaticamente e não acessa outras
aplicações.

O conteúdo canônico copiado é a mesma URI EIP-681 exibida no QR:

```text
ethereum:<CONTRATO_OFICIAL>@137/transfer?address=<DESTINATARIO>&uint256=<QUANTIDADE_TOKEN>
```

O payload contém:

- contrato do Token Oficial;
- Polygon (`chainId` 137);
- operação ERC-20 `transfer`;
- endereço de destino do depósito;
- quantidade proposta nas menores unidades do token.

Quando a entrada original for BRL, a quantidade copiada já é o resultado da
cotação aceita. A tela pode acompanhar o código com texto legível contendo BRL,
preço, tokens e validade, mas somente a URI validada define a transferência.

### Regras do clipboard

- Copiar uma solicitação não movimenta fundos e não exige acesso à chave.
- O app só lê a área de transferência após o usuário tocar em **Colar**.
- O conteúdo colado é tratado como dado não confiável.
- Rede, contrato, endereço, função e quantidade são validados.
- URI inválida, token diferente ou rede diferente são rejeitados.
- Colar nunca envia automaticamente.
- A solicitação abre a mesma tela de revisão usada pelo QR e pela agenda.
- O aplicativo deve oferecer botão para limpar o conteúdo copiado.
- Não copiar chave privada, seed, identificadores de autenticação ou dados
  pessoais desnecessários.

## 4. Receber por código compartilhável

1. O destinatário informa o valor.
2. O sistema obtém a cotação, quando o valor estiver em BRL.
3. O destinatário toca em **Receber**.
4. A tela mostra QR e botão **Copiar solicitação**.
5. O destinatário escolhe onde compartilhar o texto.
6. O pagador cola o código no Meu Dinheiro.
7. O app valida e apresenta o destino e o valor proposto.
8. O pagador confere saldo do Token Oficial e patrocínio do Paymaster.
9. O pagador autentica e transmite a UserOperation.

## 5. Arquitetura sugerida

- `Contact`: entidade de domínio sem segredo.
- `ContactRepository`: porta para persistência local.
- `ContactRankingService`: ordenação por favorito, frequência e recência.
- `PaymentRequestCodec`: gera e interpreta a URI EIP-681.
- `ClipboardPaymentAdapter`: copia e lê somente sob ação explícita.
- `SelectRecipientScreen`: agenda, QR, clipboard e endereço manual.
- `SendReviewScreen`: única porta para autorizar e transmitir.
- `SponsorshipPolicy`: valida localmente a UserOperation antes da assinatura.

Metadados da agenda devem permanecer locais, com backup desabilitado ou
protegido conforme a política do produto. Caso seja adotada sincronização, ela
exigirá consentimento, criptografia e uma especificação separada.

## 6. Estado da implementação

A base implementa:

- entidade e regras puras de contato em `domain/contacts`;
- persistência pública local da agenda pelo store, sem chaves ou seeds;
- ordenação por favorito, frequência e recência;
- inclusão, remoção e marcação de favoritos;
- edição de nome e endereço, com confirmação para mudança de endereço;
- unicidade de nomes normalizados e endereços EVM;
- seleção de contato como destinatário de uma intenção;
- consulta para salvar um destinatário desconhecido na tela de revisão;
- persistência do novo contato somente após confirmação da transferência;
- incremento do uso somente após confirmação da transação;
- cópia e limpeza da URI EIP-681 na tela Receber;
- leitura do clipboard somente após toque em **Colar solicitação**;
- validação do conteúdo colado pelo mesmo parser usado pelo QR;
- encaminhamento obrigatório para a tela de revisão e autenticação.

Sincronização entre dispositivos permanece fora deste incremento.
