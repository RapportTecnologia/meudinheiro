# Meu Dinheiro — modelo operacional do token e do gás

## 1. Decisão principal

Todas as transferências de valor realizadas pelo Meu Dinheiro usam
exclusivamente o **Token Oficial Meu Dinheiro**, um ERC-20 implantado na
Polygon. POL não é moeda de pagamento do aplicativo: sua única função no fluxo
do usuário é pagar o gás necessário para registrar a transferência do ERC-20.

O contrato oficial deve ser definido por ambiente em configuração assinada ou
compilada no aplicativo. Usuários não podem substituir o contrato por outro
token. Endereço, `chainId`, nome, símbolo e decimais precisam ser verificados
antes de qualquer operação.

## 2. Entrada em reais e cotação do token

O usuário pode expressar o valor em:

- **BRL:** valor comercial conhecido, como R$ 10,00;
- **Token Oficial:** quantidade direta do ERC-20.

Mesmo quando a entrada é BRL, a transferência on-chain continua sendo feita no
Token Oficial. Antes de gerar o QR ou a transação, o aplicativo consulta um
`QuoteProvider` para obter a cotação atual:

```text
quantidadeToken = valorBRL / precoTokenEmBRL
```

Exemplo meramente matemático: se um token estiver cotado a R$ 2,00, uma cobrança
de R$ 10,00 solicitará 5 tokens. A interface deve mostrar simultaneamente o
valor em BRL, a quantidade calculada de tokens, a cotação utilizada e o horário
de validade.

### Requisitos da cotação

Uma cotação deve conter:

- contrato e `chainId` do Token Oficial;
- preço do token em BRL;
- quantidade final nas menores unidades do ERC-20;
- fonte ou conjunto de fontes;
- data e hora da consulta;
- prazo de expiração;
- identificador único;
- assinatura ou evidência de integridade, quando fornecida por backend;
- regra de arredondamento e valor efetivo em BRL.

O cálculo deve usar aritmética decimal/integer, nunca `number` de ponto
flutuante. O arredondamento ocorre apenas na menor unidade do token e deve ser
exibido antes da autorização.

Se a cotação estiver ausente, vencida, inconsistente ou indisponível, o
aplicativo não pode criar uma cobrança em BRL nem transmitir o pagamento. O
usuário poderá tentar novamente ou informar diretamente uma quantidade do
Token Oficial.

## 3. Pré-requisito de gás em POL

Quem envia o Token Oficial paga o gás da Polygon em POL. Antes de solicitar
biometria, PIN ou padrão, o app deve:

1. estimar o gás da chamada ERC-20 `transfer(address,uint256)`;
2. consultar `maxFeePerGas` ou a política de taxa aplicável;
3. calcular o custo máximo estimado;
4. aplicar uma margem de segurança configurável;
5. conferir o saldo POL do remetente.

Regra:

```text
saldoPOL >= gasEstimado × taxaMaxima × margemSeguranca
```

Saldo do Token Oficial e saldo de POL são verificações independentes. Ter
tokens suficientes não significa ter gás suficiente.

### POL insuficiente

Quando não houver POL suficiente, o aplicativo deve bloquear a transferência e
explicar:

- quanto POL existe;
- quanto POL é estimado para a transação;
- que o Token Oficial não pode pagar diretamente o gás sem uma solução
  adicional de patrocínio;
- que o usuário precisa receber ou adquirir POL antes de tentar novamente.

As opções previstas pelo modelo operacional são:

- receber POL de um estabelecimento participante;
- adquirir POL por uma carteira ou serviço externo compatível, como MetaMask,
  observando disponibilidade, termos e requisitos do provedor;
- para comerciantes autorizados, converter parte do estoque do Token Oficial
  em POL por um mecanismo de swap previamente auditado.

O aplicativo nunca deve declarar sucesso quando a estimativa ou o saldo de gás
não puderem ser confirmados.

## 4. Papéis operacionais

### 4.1 Usuário comum

O usuário comum pode:

- manter o Token Oficial;
- enviar e receber o Token Oficial;
- digitar valores em BRL e receber uma cotação;
- manter POL apenas para pagar gás;
- receber Token Oficial ou POL em um estabelecimento participante.

Na interface comum não são oferecidos:

- seleção de outros ERC-20;
- pagamento direto em POL;
- gestão de estoque comercial;
- swap de liquidez;
- definição manual do contrato oficial.

### 4.2 Comerciante

O comerciante atua como ponto regional de distribuição e liquidez. Ele pode:

- manter estoque do Token Oficial;
- vender ou transferir Token Oficial aos clientes;
- manter reserva operacional de POL;
- fornecer pequenas recargas de POL para gás;
- receber pagamentos no Token Oficial;
- converter estoque entre Token Oficial e POL por um fluxo separado,
  autenticado, cotado e auditado.

O modo comerciante deve exigir cadastro e autorização próprios. Estoque, caixa,
limites, cotação, conciliação e permissões não devem ser misturados ao estado da
carteira pessoal.

## 5. Fluxos consolidados

### Abastecimento do Token Oficial

1. O cliente solicita determinado valor em BRL.
2. O comerciante informa ou confirma o valor.
3. O sistema consulta a cotação Token Oficial/BRL.
4. O cliente visualiza quanto receberá em tokens.
5. O cliente apresenta o QR com sua carteira, token e quantidade.
6. O comerciante confere a contraprestação externa e o pedido.
7. O comerciante verifica estoque do token e POL para gás.
8. O comerciante autentica e envia o Token Oficial.

### Pagamento de compra

1. O comerciante informa o preço em BRL.
2. O sistema consulta a cotação e calcula o Token Oficial.
3. O QR contém contrato oficial, destinatário e quantidade.
4. O cliente lê e revisa BRL, cotação, tokens e destinatário.
5. O app verifica saldo do token e POL.
6. O cliente autentica e transmite.

### Recarga de POL

1. O app detecta POL insuficiente e bloqueia o pagamento.
2. O usuário procura um comerciante participante ou serviço externo
   compatível.
3. O usuário informa seu endereço de carteira.
4. O fornecedor transfere POL após seus próprios controles.
5. O app confirma o novo saldo antes de liberar outra tentativa.

## 6. Controles de segurança

- Toda transferência, swap ou aprovação exige biometria, PIN ou padrão.
- O QR apenas transporta uma solicitação; nunca autoriza a transação.
- A tela de revisão mostra valor BRL, cotação, tokens, contrato, rede,
  destinatário, gás estimado e saldo POL.
- Cotação e pedido devem expirar.
- O contrato oficial é comparado por endereço, não somente por símbolo.
- O modo comerciante requer limites e trilha de auditoria.
- Não registrar chaves, saldos completos ou dados pessoais em telemetria.
- Falhas de RPC, cotação ou estimativa resultam em bloqueio seguro.

## 7. Conformidade e responsabilidades

Comerciantes que vendem tokens, fornecem POL, operam estoque ou realizam
conversões podem assumir obrigações legais, fiscais, contábeis, de proteção ao
consumidor e de prevenção à lavagem de dinheiro. Antes da operação pública, o
modelo deve passar por avaliação jurídica específica para o Brasil, incluindo
papéis do emissor, dos comerciantes e dos provedores de cotação/liquidez.

O aplicativo não deve prometer estabilidade, valorização, liquidez ou
conversibilidade. Taxas, preço, spread e riscos precisam ser apresentados antes
da autorização.

## 8. Impacto sobre o protótipo atual

Esta decisão substitui requisitos anteriores que permitiam:

- escolher POL como ativo de pagamento;
- configurar livremente uma Moeda Base arbitrária;
- assumir proporção nominal 1:1 entre BRL e o ERC-20.

O protótipo ainda contém parte desses comportamentos. Uma próxima alteração de
código deverá fixar o Token Oficial, remover POL da seleção de pagamento e
implementar `QuoteProvider`, validade da cotação e verificação preventiva do
saldo de gás.

