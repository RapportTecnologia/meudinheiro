# Meu Dinheiro — agenda e compartilhamento de solicitações

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
7. Verifica saldo do token e POL para gás.
8. Mostra a revisão e solicita biometria, PIN ou padrão.
9. Somente após autorização transmite a transferência.

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
8. O pagador confere saldo do Token Oficial e POL.
9. O pagador autentica e transmite.

## 5. Arquitetura sugerida

- `Contact`: entidade de domínio sem segredo.
- `ContactRepository`: porta para persistência local.
- `ContactRankingService`: ordenação por favorito, frequência e recência.
- `PaymentRequestCodec`: gera e interpreta a URI EIP-681.
- `ClipboardPaymentAdapter`: copia e lê somente sob ação explícita.
- `SelectRecipientScreen`: agenda, QR, clipboard e endereço manual.
- `SendReviewScreen`: única porta para autorizar e transmitir.

Metadados da agenda devem permanecer locais, com backup desabilitado ou
protegido conforme a política do produto. Caso seja adotada sincronização, ela
exigirá consentimento, criptografia e uma especificação separada.

## 6. Estado da implementação

A base implementa:

- entidade e regras puras de contato em `domain/contacts`;
- persistência pública local da agenda pelo store, sem chaves ou seeds;
- ordenação por favorito, frequência e recência;
- inclusão, remoção e marcação de favoritos;
- seleção de contato como destinatário de uma intenção;
- incremento do uso somente após confirmação da transação;
- cópia e limpeza da URI EIP-681 na tela Receber;
- leitura do clipboard somente após toque em **Colar solicitação**;
- validação do conteúdo colado pelo mesmo parser usado pelo QR;
- encaminhamento obrigatório para a tela de revisão e autenticação.

Edição do nome/endereço de um contato e sincronização permanecem fora deste
incremento. Alterar um endereço deverá usar confirmação explícita quando esse
fluxo for implementado.
