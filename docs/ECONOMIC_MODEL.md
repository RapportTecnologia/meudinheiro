<div align="center">
  <h1>Meu Dinheiro — Modelo econômico</h1>
  <p>Token Oficial, cotação em reais e gás patrocinado pela plataforma.</p>

  <img alt="Documento Modelo econômico" src="https://img.shields.io/badge/documento-Modelo%20econômico-f97316?style=flat-square">
  <a href="https://github.com/RapportTecnologia/meudinheiro"><img alt="Repositório público" src="https://img.shields.io/badge/repositório-público-111827?style=flat-square&logo=github"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/commits/main/docs/ECONOMIC_MODEL.md"><img alt="Última atualização" src="https://img.shields.io/github/last-commit/RapportTecnologia/meudinheiro?style=flat-square&color=f97316&label=atualização"></a>
  <img alt="Rede Polygon" src="https://img.shields.io/badge/rede-Polygon-8247E5?style=flat-square&logo=polygon">
  <img alt="Visitantes do modelo econômico" src="https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-economic-model&label=VISITANTES&labelColor=%23111827&countColor=%23F97316">

  <p><a href="../README.md">Início</a> · <a href="REQUIREMENTS.md">Requisitos</a> · <a href="ARCHITECTURE.md">Arquitetura</a> · <a href="USE_CASES.md">Casos de uso</a> · <a href="ACCOUNT_ABSTRACTION.md">ERC-4337</a> · <a href="CONTACTS_AND_SHARING.md">Agenda</a></p>
</div>

## 1. Decisões principais

Todas as transferências de valor do Meu Dinheiro usam exclusivamente o
**Token Oficial Meu Dinheiro**, um ERC-20 na Polygon. POL não é ativo de
pagamento da interface.

Nas transferências elegíveis, o usuário final também não precisa manter POL:
a conta operacional é uma Smart Account ERC-4337 e o Paymaster da plataforma
paga o gás. A tela informa **custo de gás para o usuário: 0 POL**.

O contrato oficial deve ser definido por ambiente em configuração assinada ou
compilada no aplicativo. Usuários não podem substituí-lo. Endereço, `chainId`,
nome, símbolo, decimais e bytecode precisam ser verificados.

## 2. Entrada em reais e cotação

O usuário pode expressar o valor em BRL ou em quantidade direta do Token
Oficial. Mesmo quando a entrada é BRL, a liquidação on-chain ocorre no token.

```text
quantidadeToken = valorBRL / precoTokenEmBRL
```

Exemplo apenas matemático: a R$ 2,00 por token, uma cobrança de R$ 10,00
solicita 5 tokens. A interface mostra valor em BRL, tokens, fonte, horário e
validade da cotação.

Uma cotação deve conter contrato, chainId, preço, quantidade em menor unidade,
fonte, data, expiração, identificador, regra de arredondamento e evidência de
integridade. O cálculo usa aritmética decimal/integer, nunca ponto flutuante.
Cotação ausente, vencida ou inconsistente bloqueia o fluxo em BRL.

## 3. Custo zero para o usuário

### 3.1 Quem paga

A rede Polygon continua cobrando gás em POL. A diferença é quem assume o custo:

| Item | Responsável |
| --- | --- |
| Token Oficial transferido | Smart Account do usuário |
| Assinatura da intenção | EOA proprietária no dispositivo |
| Gás em POL | Depósito do Paymaster da plataforma |
| Envio ao EntryPoint | Bundler |
| Custo de gás debitado do usuário | **0 POL** |

Logo, “custo zero” é uma experiência subsidiada, não uma transação sem custo
econômico. A RapportTecnologia deve contabilizar o POL gasto como custo
operacional por aquisição, retenção e circulação regional.

### 3.2 Elegibilidade

O patrocínio padrão cobre somente:

- Polygon `chainId` 137;
- Smart Accounts e factory auditadas;
- Token Oficial configurado;
- uma chamada `transfer(address,uint256)`;
- valor nativo zero;
- limite de valor e gás dentro da política;
- usuário/dispositivo/conta dentro das cotas;
- operação válida, simulada, não repetida e não expirada.

Swap, aprovação ilimitada, transferência de POL, contrato arbitrário, batch não
permitido e chamadas administrativas não entram automaticamente no subsídio.
Políticas adicionais exigem revisão de segurança e orçamento específico.

### 3.3 Recusa ou indisponibilidade

Se Gateway, Bundler ou Paymaster recusarem ou estiverem indisponíveis, o app:

1. não assina uma transação EOA alternativa;
2. não debita POL do usuário;
3. informa que o patrocínio está indisponível;
4. permite tentar novamente;
5. conserva uma operação já enviada como pendente até conciliação.

Não há fallback silencioso para uma taxa paga pelo usuário.

## 4. Orçamento e sustentabilidade do Paymaster

O orçamento mínimo deve considerar:

```text
custoMensalGas =
  operaçõesPatrocinadas
  × gásMédioPorOperação
  × preçoMédioDoGasEmPOL
  × preçoDoPOL
  × margemDeSegurança
```

Além do gás de transferências, devem ser previstos implantação inicial das
Smart Accounts, operações revertidas, picos de taxa, redundância de Bundler,
infraestrutura, observabilidade, auditoria e reserva.

Controles financeiros obrigatórios:

- teto diário/mensal global;
- cota por conta, dispositivo, comerciante e região;
- saldo mínimo e alertas do depósito do Paymaster;
- separação entre depósito, stake e tesouraria;
- conciliação `requestId` → `userOpHash` → `transactionHash` → custo;
- custo médio, p95, taxa de revert, abuso e sucesso;
- pausa de emergência e reposição com aprovação administrativa;
- centro de custo específico para subsídio de gás.

O preço, spread ou modelo comercial do Token Oficial pode absorver esse custo,
mas qualquer repasse deve ser transparente. “Gás zero” não pode esconder uma
taxa cobrada por outro nome na mesma operação.

## 5. Papéis operacionais

### Usuário comum

- mantém, envia e recebe o Token Oficial;
- usa BRL como unidade de entrada mediante cotação;
- não precisa comprar nem manter POL para pagamentos patrocinados;
- autentica toda UserOperation por biometria, PIN ou padrão;
- vê limites ou indisponibilidade antes de assinar.

### Comerciante

- mantém estoque regional do Token Oficial;
- abastece clientes e recebe pagamentos;
- utiliza as mesmas transferências ERC-4337 patrocinadas quando elegível;
- pode ter cotas operacionais próprias;
- opera swap e gestão de estoque em fluxo separado, sem presumir patrocínio.

### Plataforma

- financia e monitora o Paymaster;
- define política objetiva de elegibilidade e limites;
- protege chaves do patrocinador em KMS/HSM;
- mantém Gateway, Bundler e RPC redundantes;
- simula operações e previne replay, spam e griefing;
- publica condições e disponibilidade do benefício.

## 6. Fluxos consolidados

### Abastecimento

1. Cliente e comerciante acordam o valor externo.
2. O sistema converte BRL para Token Oficial.
3. O cliente apresenta o QR de sua Smart Account.
4. O comerciante revisa token, quantidade e destino.
5. O app solicita patrocínio, valida a UserOperation e autentica o comerciante.
6. O Paymaster paga o gás e a Smart Account do comerciante envia o token.

### Pagamento de compra

1. O comerciante gera a cobrança em BRL/token.
2. O cliente lê o QR e revisa destinatário, cotação e quantidade.
3. O app confere saldo do Token Oficial e autorização do Paymaster.
4. O cliente autentica e assina a UserOperation.
5. O Paymaster paga o gás; as partes conferem a confirmação.

### Transferência pessoal

Agenda, QR ou clipboard resolvem o destinatário. O pagador revisa, autentica e
assina. O mesmo fluxo de patrocínio é aplicado; novo contato só é salvo depois
da inclusão confirmada.

## 7. Controles de segurança

- Toda operação financeira exige autenticação local.
- O QR apenas transporta uma solicitação.
- O app valida e decodifica a UserOperation antes de assinar.
- O backend repete a política e nunca recebe a chave privada.
- Autorização do Paymaster possui nonce, validade curta e uso único.
- Limites de gás e valor são verificados no app, backend, Bundler e contrato.
- Falha de RPC, cotação, simulação ou patrocínio resulta em bloqueio seguro.
- Operação revertida pode consumir o depósito; por isso há cotas e
  monitoramento.

Detalhes técnicos estão em
[Account Abstraction](ACCOUNT_ABSTRACTION.md).

## 8. Conformidade e responsabilidades

Emissão, venda, distribuição, cotação, conversão e subsídio de transações podem
gerar obrigações legais, fiscais, contábeis, consumeristas e de prevenção à
lavagem de dinheiro. O modelo deve receber avaliação jurídica específica para
o Brasil antes da operação pública.

O aplicativo não promete estabilidade, valorização, liquidez, disponibilidade
ilimitada de patrocínio ou conversibilidade. Preço, spread, limites e riscos
devem ser informados antes da autorização.

## 9. Impacto sobre requisitos anteriores

Esta decisão substitui a regra anterior segundo a qual cada usuário precisava
manter POL ou procurar um comerciante para abastecer gás. A necessidade de POL
passa para a infraestrutura da plataforma. O swap Token Oficial ↔ POL continua
possível no modo comercial, mas serve à gestão de estoque/tesouraria e não é
pré-requisito para o usuário pagar.
