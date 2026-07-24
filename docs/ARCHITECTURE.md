<div align="center">
  <h1>Meu Dinheiro — Arquitetura</h1>
  <p>Visão técnica, camadas, dependências e decisões arquiteturais.</p>

  <img alt="Documento Arquitetura" src="https://img.shields.io/badge/documento-Arquitetura-f97316?style=flat-square">
  <a href="https://github.com/RapportTecnologia/meudinheiro"><img alt="Repositório público" src="https://img.shields.io/badge/repositório-público-111827?style=flat-square&logo=github"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/commits/main/docs/ARCHITECTURE.md"><img alt="Última atualização" src="https://img.shields.io/github/last-commit/RapportTecnologia/meudinheiro?style=flat-square&color=f97316&label=atualização"></a>
  <img alt="Branch principal" src="https://img.shields.io/badge/branch-main-111827?style=flat-square&logo=git">
  <img alt="Visitantes da arquitetura" src="https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-architecture&label=VISITANTES&labelColor=%23111827&countColor=%23F97316">

  <p><a href="../README.md">Início</a> · <a href="REQUIREMENTS.md">Requisitos</a> · <a href="USE_CASES.md">Casos de uso</a> · <a href="ECONOMIC_MODEL.md">Modelo econômico</a> · <a href="ACCOUNT_ABSTRACTION.md">ERC-4337</a> · <a href="CONTACTS_AND_SHARING.md">Agenda</a></p>
</div>

## 1. Escopo

Carteira autocustodial Android para Polygon (chainId 137), com uma calculadora
funcional como Home. O resultado matemático é apenas uma intenção de valor:
nenhuma operação acontece sem revisão, endereço completo, rede, token, valor,
patrocinador e autenticação do dispositivo. A conta operacional é uma Smart
Account ERC-4337; o Paymaster da plataforma paga o gás, sem debitar POL do
usuário final.

O produto deve ser apresentado de forma transparente como carteira. A calculadora é uma interface funcional, não um mecanismo para ocultar permissões ou comportamento financeiro.

## 2. Requisitos funcionais

- RF01: realizar operações `+`, `-`, `×`, `÷` sem `eval` irrestrito;
- RF02: importar no máximo duas EOAs proprietárias e vincular uma Smart Account
  ERC-4337 determinística a cada uma;
- RF03: selecionar uma conta ativa;
- RF04: carregar o contrato do Token Oficial por configuração confiável;
- RF05: impedir que o usuário substitua o Token Oficial;
- RF06: enviar exclusivamente o Token Oficial; o Paymaster paga o gás em POL;
- RF07: ler endereço `0x...` ou URI `ethereum:` por QR;
- RF08: exibir QR interoperável EIP-681;
- RF09: cotar Token Oficial/BRL e reservar swap Token Oficial ↔ POL ao
  comerciante;
- RF10: autenticar cada assinatura, aprovação, swap, envio e exportação;
- RF11: manter o swap bloqueado até que configuração e cotação tenham sido validadas;
- RF12: validar e assinar `UserOperation` localmente após autenticação;
- RF13: impedir fallback silencioso para uma transação EOA paga pelo usuário.

## 3. Requisitos não funcionais

- Chave privada somente em SecureStore; nunca em Zustand, AsyncStorage, logs, telemetria ou crash reports.
- AsyncStorage contém apenas estado público.
- Não persistir o valor revelado da chave; alertar e limpar a área de transferência quando possível.
- `bigint`/`parseUnits` para valores on-chain; nunca `number`.
- RPC e endereços por ambiente; confirmar `eth_chainId === 137`.
- Gateway, EntryPoint, factory e Paymaster devem ser fixados por ambiente.
- Credenciais de Bundler/Paymaster e chave de patrocínio permanecem no backend.
- Lista de tokens e roteadores assinada ou compilada no app; não confiar em símbolo.
- Slippage, deadline, allowance e `amountOutMinimum` obrigatórios.
- Bloqueio contra toque duplo, simulação da UserOperation e estado idempotente.
- Testes unitários de domínio, integração em Amoy/fork e E2E em development build.

## 4. Camadas (DDD pragmático)

- `domain`: entidades e invariantes puras (contas, cálculo, pagamento e cotação).
- `domain/payment`: criação e interpretação de pedidos EIP-681.
- `domain/contacts`: contatos, invariantes e ranking de frequentes.
- `domain/accountAbstraction`: tipos e política defensiva de patrocínio.
- `application`: casos de uso/hooks e portas.
- `infrastructure`: RPC, Gateway ERC-4337, contratos, armazenamento e autenticação.
- `presentation`: telas, navegação e componentes.

Dependências apontam para dentro: UI → application → domain. Infrastructure implementa portas e é injetada nos casos de uso.

## 5. Fluxo de transação

1. Home calcula e seleciona a unidade de entrada: BRL ou Token Oficial.
2. Em BRL, QuoteProvider calcula a quantidade final do Token Oficial.
3. Receber gera um QR/clipboard EIP-681 com contrato, destinatário e tokens.
4. Scanner, agenda ou clipboard resolvem o destinatário sem executar ações.
5. SendReview valida rede, contrato, endereço, cotação, tokens, Smart Account e
   custo de gás `0 POL` para o usuário.
6. No modo comerciante, o swap de estoque possui fluxo separado.
7. `requireDeviceAuth` autoriza a operação específica por biometria, PIN ou
   padrão do dispositivo.
8. A chave é lida somente nesse momento e cria um signer efêmero da EOA
   proprietária.
9. O Gateway prepara uma UserOperation patrocinada; o app decodifica e confere
   token, destinatário, valor, EntryPoint, Paymaster, validade e limites de gás.
10. O app reproduz `getUserOpHash`, assina localmente e envia apenas a
    assinatura ao Gateway.
11. Bundler, EntryPoint e Smart Account executam a transferência; o Paymaster
    paga o POL.
12. `userOpHash`, `transactionHash` e recibo são acompanhados; objetos sensíveis
    saem de escopo.

### Pedidos de pagamento

`PaymentRequest` é um value object do domínio. O endereço-alvo da URI é o
contrato do Token Oficial e a operação descreve `transfer(address,uint256)`.
O parser aceita somente Polygon e o contrato oficial. POL não aparece no pedido
de pagamento.

O mesmo objeto atende abastecimento em estabelecimento, cobrança comercial e
transferência entre pessoas. A diferença é o acordo externo entre as partes,
não o mecanismo blockchain.

### Agenda e clipboard

`ContactRepository` persiste somente nomes, endereços públicos e métricas de
uso. `ContactRankingService` ordena favoritos, frequência e recência. O acesso
à agenda telefônica não é necessário.

`ClipboardPaymentAdapter` reutiliza o mesmo `PaymentRequestCodec` do QR. A
leitura ocorre somente após toque em Colar, e qualquer entrada converge para
`SendReviewScreen`. Agenda e clipboard nunca acessam a chave privada nem
autorizam uma transferência.

`validateContactDraft` concentra as invariantes de unicidade para inclusão e
edição. A comparação de nome normaliza Unicode, espaços e caixa; o endereço é
normalizado por ethers. A edição exclui o próprio identificador da busca por
conflitos e preserva métricas.

Ao receber um destinatário desconhecido, `SendReviewScreen` obtém uma decisão
explícita: salvar com nome ou não salvar. A validação ocorre antes da
autenticação, mas a persistência ocorre somente depois do recibo confirmado.
Erros posteriores de armazenamento são tratados separadamente do resultado
on-chain para impedir um falso estado de falha financeira.

### Cotação e patrocínio de gás

`QuoteProvider` converte BRL para Token Oficial e retorna preço, quantidade
inteira, fonte, horário, expiração e evidência de integridade. Uma cotação
inválida bloqueia o fluxo em BRL.

`SponsorshipPolicy` aceita apenas `execute` com valor nativo zero e
`transfer(address,uint256)` do Token Oficial. O app rejeita divergências de
conta, token, destino, quantidade, EntryPoint, validade, hash ou limites de gás.
O backend repete a política, simula a UserOperation, aplica cotas e obtém a
autorização do Paymaster. Se o patrocínio falhar, a operação é bloqueada sem
usar o POL do usuário como fallback.

Detalhes, API e controles operacionais estão em
[Account Abstraction](ACCOUNT_ABSTRACTION.md).

## 6. Swap comercial

O adaptador `UniswapV3SwapGateway` é reservado ao modo comerciante para gestão
de estoque Token Oficial ↔ POL. O fluxo normaliza POL/WPOL, valida pools,
liquidez, fee tier, slippage e contratos. A interface comum não oferece swap.

## 7. TDD

Ordem por feature: escrever teste de regra → implementar domínio → teste do caso de uso com portas falsas → infraestrutura em testnet → teste de componente → E2E. Critérios mínimos: limite de duas contas, imutabilidade do token, parser, QR inválido, slippage, cotação expirada, chainId incorreto, autenticação cancelada e envio duplicado.

## 8. Pendências antes de produção

- revisão de segurança e testes de integração da tela de envio;
- expiração e identificador único opcional para pedidos de pagamento;
- QuoteProvider Token Oficial/BRL com integridade e expiração;
- Gateway ERC-4337, factory e Paymaster implantados e auditados;
- KMS/HSM, cotas, idempotência e observabilidade do patrocínio;
- depósito/stake do Paymaster com alertas e orçamento operacional;
- substituição da Moeda Base configurável pelo contrato oficial;
- seleção de conta ativa;
- provider de cotações auditado;
- contrato do Token Oficial, WPOL e roteador comercial verificados;
- política de backup/recuperação;
- PIN interno com derivação forte, se realmente necessário;
- auditoria independente, threat model, pentest e publicação com política de privacidade;
- testes com valores pequenos em Amoy e depois Polygon.
