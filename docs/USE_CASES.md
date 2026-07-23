# Meu Dinheiro — histórias e casos de uso

## Premissas comuns

- A rede é Polygon PoS (`chainId` 137).
- A pessoa que paga controla uma conta com saldo e POL suficiente para gás.
- A pessoa que recebe possui uma conta ativa no Meu Dinheiro.
- O Token Oficial Meu Dinheiro é o único ativo de pagamento.
- BRL é uma unidade de entrada convertida pela cotação vigente do Token Oficial.
- POL é usado exclusivamente para pagar gás.
- O QR Code segue EIP-681 e contém rede, destinatário, contrato oficial e a
  quantidade calculada de tokens.
- O QR nunca autoriza nem executa uma transação sozinho.
- Toda aprovação, transferência ou swap exige biometria, PIN ou padrão do
  dispositivo pagador.
- Dinheiro físico, cartão ou Pix não são processados pelo aplicativo. Quando
  existem, são conferidos fora da blockchain pelas partes.

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
5. O app consulta a cotação Token Oficial/BRL e exibe a quantidade de tokens,
   fonte, horário e expiração.
6. O cliente aceita a cotação e toca em **Receber**.
7. O app exibe uma solicitação contendo Polygon, contrato oficial, endereço da
   carteira e quantidade ERC-20 calculada.
8. O caixa lê o QR Code e verifica estoque do token e POL para gás.
9. O aplicativo do caixa mostra BRL, cotação, tokens, rede e destinatário.
10. O caixa confirma e autentica com biometria, PIN ou padrão.
11. A carteira do caixa transmite o Token Oficial.
12. As partes conferem o hash e a confirmação na Polygon.

### Exceções

- Cotação indisponível ou vencida: não gerar cobrança em BRL.
- Token diferente do configurado: rejeitar a solicitação.
- Caixa não confirma o recebimento externo: não transferir.
- Falta de saldo ou POL para gás: informar sem simular sucesso.
- Autenticação cancelada: encerrar sem transmitir.

### Observação de negócio

O app não assume paridade de R$ 1 por token. O QuoteProvider calcula quantos
tokens correspondem aos R$ 10 e a cotação deve permanecer válida até a
autorização. O comerciante é responsável por manter estoque do Token Oficial e
POL suficiente para realizar a operação.

## UC-02 — pagar uma compra no caixa

### História

Como caixa, quero digitar o preço da compra e gerar uma cobrança QR com o valor
exato, para que o cliente revise e autorize o pagamento na própria carteira.

### Fluxo principal

1. O caixa digita o preço da compra em BRL.
2. O app consulta a cotação e apresenta a quantidade do Token Oficial.
3. O caixa aceita a cotação e toca em **Receber**.
4. O app gera um QR EIP-681 com destinatário, contrato oficial e tokens.
5. O cliente toca em **Enviar** ou **Scan QR**.
6. O app valida rede, destinatário, contrato, cotação e quantidade.
7. A tela de revisão mostra BRL, cotação, tokens, gás e endereço.
8. O app confere saldo do Token Oficial e POL.
9. O cliente autentica com biometria, PIN ou padrão.
10. O app transmite o Token Oficial e ambos conferem a confirmação.

### Exceções

- QR adulterado ou malformado: rejeitar.
- Rede diferente ou token desconhecido: rejeitar.
- Token ou POL insuficiente: não assinar e orientar o abastecimento.
- Duplo toque: manter somente uma tentativa em andamento.

## UC-03 — transferência entre amigos

### História

Como pessoa que deseja receber de um amigo, quero informar o valor e apresentar
um QR Code de cobrança, para que meu amigo possa conferir e autorizar a
transferência.

### Fluxo principal

1. O destinatário informa BRL ou quantidade direta do Token Oficial.
2. Em BRL, o app consulta a cotação.
3. O destinatário toca em **Receber** e apresenta o QR do Token Oficial.
4. O emissor toca em **Enviar** ou **Scan QR** e faz a leitura.
5. O emissor confere BRL, cotação, tokens, gás, rede e destinatário.
6. O app verifica Token Oficial e POL suficientes.
7. O emissor autoriza com biometria, PIN ou padrão.
8. O app transmite e ambos conferem a confirmação.

### Exceções

- Origem e destinatário iguais: bloquear.
- Pedido sem valor: usar o valor digitado pelo emissor e exigir nova revisão.
- Pedido expirado, quando esse campo for adotado: solicitar novo QR.
- Falha ou cancelamento de autenticação: não transmitir.

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
5. O app obtém a cotação, quando necessária, e monta a intenção.
6. Verifica saldo do Token Oficial e POL para gás.
7. A tela de revisão mostra contato, endereço, tokens, BRL, cotação e gás.
8. O remetente autentica e transmite.

## UC-05 — solicitar transferência pelo clipboard

### História

Como destinatário, quero copiar um código com minha carteira e o valor proposto,
para enviá-lo ao pagador por um canal escolhido.

### Fluxo principal

1. O destinatário informa o valor e toca em **Receber**.
2. Em BRL, o app consulta e fixa uma cotação válida.
3. A tela mostra QR e **Copiar solicitação**.
4. O app copia a URI EIP-681 com contrato oficial, Polygon, endereço e tokens.
5. O destinatário compartilha o texto pelo canal de sua escolha.
6. O pagador abre o app e toca em **Colar solicitação**.
7. O app lê somente após o toque, valida o conteúdo e abre a revisão.
8. O pagador confere Token Oficial e POL, autentica e transmite.

## Critérios de aceite dos casos

- O botão **Receber** utiliza o resultado atual da calculadora.
- A seleção de BRL exige cotação válida do Token Oficial.
- A cobrança ERC-20 usa `transfer(address,uint256)` no URI EIP-681.
- POL nunca é solicitado como ativo de pagamento.
- O scanner aceita cobrança com valor ou endereço simples.
- Endereço simples herda o valor e o ativo selecionados pelo pagador.
- Cobrança com valor prevalece sobre o valor local do pagador.
- O app exibe revisão antes de acessar a chave.
- A chave é acessada somente após autenticação bem-sucedida.
- Saldo do Token Oficial e POL para gás são verificados antes da transmissão.
- A interface bloqueia novas submissões enquanto a transação estiver em curso.
- Agenda, QR e clipboard convergem para a mesma revisão.
- O app não lê o clipboard em segundo plano.
- O payload copiado contém destino e quantidade proposta do Token Oficial.
