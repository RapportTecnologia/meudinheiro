# Meu Dinheiro — histórias e casos de uso

## Premissas comuns

- A rede é Polygon PoS (`chainId` 137).
- A pessoa que paga controla uma conta com saldo e POL suficiente para gás.
- A pessoa que recebe possui uma conta ativa no Meu Dinheiro.
- “R$” é uma unidade de exibição vinculada à Moeda Base ERC-20 configurada.
- O QR Code segue EIP-681 e contém rede, destinatário, ativo e valor.
- O QR nunca autoriza nem executa uma transação sozinho.
- Toda aprovação, transferência ou swap exige biometria, PIN ou padrão do
  dispositivo pagador.
- Dinheiro físico, cartão ou Pix não são processados pelo aplicativo. Quando
  existem, são conferidos fora da blockchain pelas partes.

## UC-01 — abastecer a carteira em um estabelecimento

### História

Como cliente, quero entregar R$ 10 ao caixa e apresentar uma solicitação de
recebimento de 10 unidades da Moeda Base, para abastecer minha carteira após o
caixa conferir o dinheiro.

### Fluxo principal

1. O cliente informa ao caixa que deseja abastecer a carteira com R$ 10.
2. O caixa confere e aceita o meio de pagamento externo.
3. No Meu Dinheiro, o cliente seleciona `R$ • Moeda Base`.
4. O cliente digita `10` na calculadora e toca em **Receber**.
5. O app exibe uma solicitação contendo Polygon, contrato da Moeda Base,
   endereço da carteira e quantidade ERC-20.
6. O caixa lê o QR Code em uma carteira compatível.
7. O aplicativo do caixa mostra token, valor, rede e destinatário.
8. O caixa confirma e autentica com biometria, PIN ou padrão.
9. A carteira do caixa transmite a transferência.
10. As partes conferem o hash e a confirmação na Polygon.

### Exceções

- Sem Moeda Base configurada: não gerar cobrança em BRL.
- Token diferente do configurado: rejeitar a solicitação.
- Caixa não confirma o recebimento externo: não transferir.
- Falta de saldo ou POL para gás: informar sem simular sucesso.
- Autenticação cancelada: encerrar sem transmitir.

### Observação de negócio

O app não garante que um token vale R$ 1. A proporção nominal 1:1 só pode ser
usada quando a Moeda Base tiver uma política externa e verificável de
representação do real. Em qualquer outro caso, um serviço de cotação deve
calcular quantos tokens correspondem aos R$ 10 antes da geração do QR.

## UC-02 — pagar uma compra no caixa

### História

Como caixa, quero digitar o preço da compra e gerar uma cobrança QR com o valor
exato, para que o cliente revise e autorize o pagamento na própria carteira.

### Fluxo principal

1. O caixa seleciona o ativo aceito: Moeda Base ou POL.
2. O caixa digita o valor da compra na calculadora e toca em **Receber**.
3. O app do caixa gera um QR EIP-681 com destinatário, rede, ativo e valor.
4. O cliente toca em **Enviar** ou **Scan QR**.
5. O app do cliente valida rede, destinatário, token e valor.
6. A tela **Revisar pagamento** mostra valor, ativo, rede e endereço.
7. O cliente confere e autentica com biometria, PIN ou padrão.
8. O app estima gás, verifica saldo e transmite a transação.
9. Caixa e cliente conferem a confirmação.

### Exceções

- QR adulterado ou malformado: rejeitar.
- Rede diferente ou token desconhecido: rejeitar.
- Saldo insuficiente ou falha de gás: não assinar.
- Duplo toque: manter somente uma tentativa em andamento.

## UC-03 — transferência entre amigos

### História

Como pessoa que deseja receber de um amigo, quero informar o valor e apresentar
um QR Code de cobrança, para que meu amigo possa conferir e autorizar a
transferência.

### Fluxo principal

1. O destinatário seleciona Moeda Base ou POL e digita o valor.
2. Toca em **Receber** e apresenta o QR Code.
3. O emissor toca em **Enviar** ou **Scan QR** e faz a leitura.
4. O emissor confere valor, ativo, rede e destinatário.
5. O emissor autoriza com biometria, PIN ou padrão.
6. O app verifica saldo, estima o gás e transmite.
7. Ambos conferem a confirmação.

### Exceções

- Origem e destinatário iguais: bloquear.
- Pedido sem valor: usar o valor digitado pelo emissor e exigir nova revisão.
- Pedido expirado, quando esse campo for adotado: solicitar novo QR.
- Falha ou cancelamento de autenticação: não transmitir.

## Critérios de aceite dos casos

- O botão **Receber** utiliza o resultado atual da calculadora.
- A seleção de `R$` exige uma Moeda Base configurada.
- A cobrança ERC-20 usa `transfer(address,uint256)` no URI EIP-681.
- A cobrança POL usa o parâmetro `value` em wei.
- O scanner aceita cobrança com valor ou endereço simples.
- Endereço simples herda o valor e o ativo selecionados pelo pagador.
- Cobrança com valor prevalece sobre o valor local do pagador.
- O app exibe revisão antes de acessar a chave.
- A chave é acessada somente após autenticação bem-sucedida.
- Saldo e gás são verificados antes da transmissão.
- A interface bloqueia novas submissões enquanto a transação estiver em curso.

