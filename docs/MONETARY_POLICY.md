# Regime monetário no aplicativo

O regime não é configurável pelo usuário. Ao cadastrar o Token Oficial, o app
consulta `/v1/region`, confirma o endereço do token e persiste o snapshot do
gestor monetário regional.

## Região lastreada

- Toda nova região começa lastreada na moeda fiduciária soberana de referência.
- No Brasil, o backend informa `BRL` e paridade nominal bruta 1:1.
- O app pode converter o valor em reais diretamente para unidades do token.
- A tela de recebimento identifica explicitamente que o pedido é lastreado.

## Região independente

- Somente o operador principal pode autorizar esse regime no contrato gestor,
  após a comprovação de reservas e capital para absorver variações de preço.
- O app não cria QR/pedido em moeda fiduciária sem cotação válida.
- O usuário pode informar diretamente a quantidade do Token Oficial.
- O fluxo fiduciário futuro deverá exibir preço, fonte, validade, spread/taxas e
  montante final, pedindo confirmação e autenticação novamente se mudar.

Configurações de Moeda Base criadas por versões antigas usando um toggle local
1:1 são removidas pela migração do storage e precisam ser revalidadas.
