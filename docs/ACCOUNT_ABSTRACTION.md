<div align="center">
  <h1>Meu Dinheiro — Account Abstraction</h1>
  <p>Smart Accounts, Bundler e patrocínio de gás com Paymaster na Polygon.</p>

  <img alt="Documento Account Abstraction" src="https://img.shields.io/badge/documento-ERC--4337-f97316?style=flat-square">
  <a href="https://github.com/RapportTecnologia/meudinheiro"><img alt="Repositório público" src="https://img.shields.io/badge/repositório-público-111827?style=flat-square&logo=github"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/commits/main/docs/ACCOUNT_ABSTRACTION.md"><img alt="Última atualização" src="https://img.shields.io/github/last-commit/RapportTecnologia/meudinheiro?style=flat-square&color=f97316&label=atualização"></a>
  <img alt="Rede Polygon" src="https://img.shields.io/badge/rede-Polygon-8247E5?style=flat-square&logo=polygon">
  <img alt="Visitantes" src="https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-erc4337&label=VISITANTES&labelColor=%23111827&countColor=%23F97316">

  <p><a href="../README.md">Início</a> · <a href="ARCHITECTURE.md">Arquitetura</a> · <a href="REQUIREMENTS.md">Requisitos</a> · <a href="ECONOMIC_MODEL.md">Modelo econômico</a></p>
</div>

## 1. Decisão arquitetural

O usuário final não precisa manter POL para realizar pagamentos do Token
Oficial. Cada conta importada atua como **proprietária** de uma Smart Account
ERC-4337 na Polygon. A chave da EOA permanece no dispositivo e assina uma
`UserOperation`; um Bundler envia a operação ao `EntryPoint`; o Paymaster da
plataforma paga o gás em POL em segundo plano.

“Custo zero para o usuário” significa **zero POL debitado da carteira do
usuário na operação patrocinada**. A rede continua cobrando gás, pago pelo
depósito da plataforma no `EntryPoint`. Esse custo deve aparecer na
contabilidade, nos limites e no orçamento operacional da RapportTecnologia.

Esta base fixa a integração no **EntryPoint v0.7**
`0x0000000071727De22E5E9d8BAf0edAc6f37da032`. Uma migração de versão exige
revisão de ABI, formato da UserOperation, assinatura, Bundler, Paymaster,
factory, auditorias e endereços implantados.

Referências primárias:

- [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337);
- [ERC-7677 — API de serviço de Paymaster](https://eips.ethereum.org/EIPS/eip-7677);
- [EIP-4337 na Polygon PoS](https://docs.polygon.technology/pos/concepts/transactions/eip-4337);
- [implementação de referência eth-infinitism](https://github.com/eth-infinitism/account-abstraction).

## 2. Componentes

| Componente | Responsabilidade |
| --- | --- |
| EOA proprietária | Assinar o hash da UserOperation após autenticação local |
| Smart Account | Manter o Token Oficial e executar `transfer` |
| App Android | Revisar intenção, autenticar, validar operação e assinar |
| Gateway ERC-4337 | Aplicar política, proteger credenciais e integrar provedores |
| Bundler | Simular, agrupar e enviar UserOperations ao EntryPoint |
| Paymaster | Autorizar o patrocínio e pagar o gás pelo depósito |
| EntryPoint v0.7 | Validar, executar e contabilizar a UserOperation |
| Observabilidade | Correlacionar `requestId`, `userOpHash` e `transactionHash` |

O APK contém apenas a URL pública do Gateway e o endereço esperado do
EntryPoint. Chaves de API de Bundler, chave administrativa do Paymaster,
signatário de patrocínio e credenciais RPC privadas ficam no backend ou em
KMS/HSM.

## 3. Fluxo de custo zero

```text
Usuário revisa Token Oficial, valor e destino
                 |
                 v
Biometria, PIN ou padrão do dispositivo
                 |
                 v
Gateway prepara UserOperation e aplica política
                 |
                 v
App decodifica callData, confere EntryPoint, conta,
token, destino, valor, validade, gás e Paymaster
                 |
                 v
App reproduz userOpHash no EntryPoint e assina localmente
                 |
                 v
Gateway envia ao Bundler -> EntryPoint -> Smart Account
                 |
                 v
Paymaster paga POL; usuário paga 0 POL; recibo é conciliado
```

O QR Code contém o endereço da **Smart Account**, não o endereço da EOA. Uma
Smart Account contrafactual pode receber ERC-20 antes do primeiro envio; seu
primeiro UserOperation inclui `initCode` e o Paymaster também patrocina sua
implantação. Factory, salt e código precisam ser imutáveis e auditados para que
o endereço calculado não mude.

## 4. Contrato do Gateway da plataforma

O cliente implementa estes endpoints:

### Resolver Smart Account

```http
GET /v1/erc4337/accounts/{ownerAddress}?chainId=137
```

Resposta: proprietário, Smart Account contrafactual, `factoryAddress`,
EntryPoint, chainId e versão `0.7`. O backend deve calcular o endereço por
`CREATE2`/factory auditada, sem receber chave ou assinatura. O app compara a
factory com `EXPO_PUBLIC_ERC4337_SIMPLE_ACCOUNT_FACTORY`.

### Preparar transferência

```http
POST /v1/erc4337/operations/prepare-transfer
Content-Type: application/json

{
  "chainId": 137,
  "ownerAddress": "0x...",
  "smartAccountAddress": "0x...",
  "tokenAddress": "0x...",
  "recipient": "0x...",
  "amountInSmallestUnit": "1000000"
}
```

A resposta contém `requestId`, `entryPoint`, `validUntil`,
`userOperationHash`, `PackedUserOperation` v0.7, esquema `personal_sign` e
identificação do patrocinador. A `signature` deve estar vazia.

### Assinar e submeter

Depois de conferir a operação, o app assina somente o `userOperationHash` e
envia:

```http
POST /v1/erc4337/operations/{requestId}/submit

{
  "userOperationHash": "0x...",
  "signature": "0x..."
}
```

O gateway não recebe chave privada. Ele recompõe a operação armazenada,
confere expiração e uso único, injeta a assinatura, chama
`eth_sendUserOperation` no Bundler e devolve o estado.

### Consultar estado

```http
GET /v1/erc4337/operations/{userOperationHash}
```

Estados: `pending`, `included` ou `reverted`. Uma inclusão deve informar
`transactionHash` e bloco. Timeout no aplicativo não significa falha
on-chain; a operação deve continuar disponível no histórico.

## 5. Política obrigatória do Paymaster

O backend e o contrato devem repetir as regras; validação somente no app não é
segurança:

- aceitar exclusivamente Polygon `chainId` 137 e EntryPoint permitido;
- permitir somente Smart Accounts/factory auditadas pela plataforma;
- decodificar `initCode`, conferir factory e garantir que `createAccount`
  atribua a propriedade à EOA autenticada;
- patrocinar apenas uma chamada `execute` com valor nativo zero;
- permitir somente `transfer(address,uint256)` do Token Oficial;
- comparar destinatário e quantidade com a intenção autenticada;
- exigir nonce, expiração curta e autorização de uso único;
- impor limite por operação, conta, dispositivo, IP, período e comerciante;
- limitar `callGasLimit`, `verificationGasLimit`, `preVerificationGas`,
  `paymasterVerificationGasLimit`, `paymasterPostOpGasLimit` e taxa máxima;
- simular a UserOperation completa antes de emitir o patrocínio;
- bloquear contratos, seletores, batches e `delegatecall` não permitidos;
- usar Play Integrity ou atestado equivalente como sinal adicional, nunca como
  única autenticação;
- manter chave de patrocínio em KMS/HSM e realizar rotação;
- manter depósito e stake do Paymaster separados da tesouraria;
- alertar para saldo baixo, aumento de falhas, abuso, latência e custo diário;
- registrar metadados mínimos, sem chave privada, seed ou dado biométrico.

Mesmo quando a chamada do usuário reverte, o Paymaster pode pagar gás. Por
isso, cotas, simulação e proteção contra griefing são requisitos de produção.

## 6. Falhas e comportamento seguro

- **Paymaster recusou:** bloquear e explicar que o patrocínio está
  indisponível; não debitar POL do usuário.
- **Gateway indisponível:** não assinar uma transação EOA como fallback.
- **Hash divergente:** descartar; o app reproduz `getUserOpHash` no EntryPoint.
- **Token, destino ou valor divergente:** descartar antes da assinatura.
- **Operação expirada:** solicitar outra preparação.
- **Bundler pendente:** mostrar como pendente e reconciliar depois.
- **Revertida:** informar falha, não salvar o contato como consequência da
  transferência e registrar custo operacional do Paymaster.
- **Paymaster sem depósito:** suspender patrocínios e alertar a operação.

## 7. Migração de contas existentes

1. O usuário atualiza o aplicativo.
2. Em Configurações, toca em **Ativar custo zero**.
3. O gateway calcula a Smart Account da EOA, sem acessar sua chave.
4. O app exibe separadamente endereço proprietário e endereço operacional.
5. Novos QR Codes usam a Smart Account.
6. Fundos já existentes na EOA não migram automaticamente.
7. Qualquer migração de token da EOA exige revisão e autenticação próprias; o
   patrocinador deve ter uma política específica e auditada para esse caso.

## 8. Checklist antes de produção

- implantar/auditar Smart Account factory e Paymaster na Polygon;
- confirmar bytecode e endereço do EntryPoint;
- implementar Gateway, KMS/HSM, rate limit e idempotência;
- financiar depósito e stake, com alertas e teto diário;
- definir token, limites, elegibilidade e retenção de logs;
- testar implantação contrafactual, replay, expiração, revert e griefing;
- testar Bundler e Paymaster redundantes sem criar assinatura incompatível;
- realizar testes em Amoy/fork, auditoria independente e pentest;
- medir custo médio por transferência e criar orçamento operacional;
- publicar termos claros: o patrocínio pode ter limites e disponibilidade, mas
  nunca produzir cobrança silenciosa de POL.
