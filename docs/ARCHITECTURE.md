# Meu Dinheiro — arquitetura e requisitos

## 1. Escopo

Carteira autocustodial Android para Polygon (chainId 137), com uma calculadora funcional como Home. O resultado matemático é apenas uma intenção de valor: nenhuma transação acontece sem uma tela de revisão, estimativa de gás, endereço abreviado e completo, rede, token, valor, slippage e autenticação do dispositivo.

O produto deve ser apresentado de forma transparente como carteira. A calculadora é uma interface funcional, não um mecanismo para ocultar permissões ou comportamento financeiro.

## 2. Requisitos funcionais

- RF01: realizar operações `+`, `-`, `×`, `÷` sem `eval` irrestrito;
- RF02: importar no máximo duas EOAs da Polygon;
- RF03: selecionar uma conta ativa;
- RF04: cadastrar um ERC-20 como Moeda Base após validar código, `name`, `symbol` e `decimals`;
- RF05: impedir edição da Moeda Base; trocar somente pelo fluxo remover → cadastrar;
- RF06: enviar ERC-20/POL usando o valor calculado;
- RF07: ler endereço `0x...` ou URI `ethereum:` por QR;
- RF08: exibir QR interoperável EIP-681;
- RF09: cotar e trocar Moeda Base ↔ POL/USDC/BRLA;
- RF10: autenticar cada assinatura, aprovação, swap, envio e exportação;
- RF11: manter o swap bloqueado até que configuração e cotação tenham sido validadas.

## 3. Requisitos não funcionais

- Chave privada somente em SecureStore; nunca em Zustand, AsyncStorage, logs, telemetria ou crash reports.
- AsyncStorage contém apenas estado público.
- Não persistir o valor revelado da chave; alertar e limpar a área de transferência quando possível.
- `bigint`/`parseUnits` para valores on-chain; nunca `number`.
- RPC e endereços por ambiente; confirmar `eth_chainId === 137`.
- Lista de tokens e roteadores assinada ou compilada no app; não confiar em símbolo.
- Slippage, deadline, allowance e `amountOutMinimum` obrigatórios.
- Bloqueio contra toque duplo, simulação `eth_call`, estimativa de gás e estado idempotente.
- Testes unitários de domínio, integração em Amoy/fork e E2E em development build.

## 4. Camadas (DDD pragmático)

- `domain`: entidades e invariantes puras (contas, cálculo, cotação).
- `application`: casos de uso/hooks e portas.
- `infrastructure`: RPC, contratos, armazenamento e autenticação.
- `presentation`: telas, navegação e componentes.

Dependências apontam para dentro: UI → application → domain. Infrastructure implementa portas e é injetada nos casos de uso.

## 5. Fluxo de transação

1. Home calcula e registra a intenção.
2. Scanner/formulário resolve destinatário.
3. Review valida rede, endereço, token, saldo, valor e gás.
4. Para swap: QuoteProvider retorna rota; app calcula `minimumAmountOut`.
5. `requireDeviceAuth` autoriza a operação específica.
6. A chave é lida somente nesse momento e cria um signer efêmero.
7. Simulação/estimativa; assinatura; transmissão; acompanhamento do recibo.
8. Referências à chave e objetos sensíveis saem de escopo.

## 6. Swap

O adaptador `UniswapV3SwapGateway` contém o esqueleto de `exactInputSingle`. POL nativo exige tratamento separado via WPOL e `value`; o fluxo recomendado normaliza POL↔WPOL antes/depois da rota. O app não deve inventar pools. O cotador precisa confirmar liquidez, fee tier e endereço oficial dos tokens na Polygon. Aprovação ilimitada é conveniente, porém produção deve oferecer aprovação exata como padrão.

## 7. TDD

Ordem por feature: escrever teste de regra → implementar domínio → teste do caso de uso com portas falsas → infraestrutura em testnet → teste de componente → E2E. Critérios mínimos: limite de duas contas, imutabilidade do token, parser, QR inválido, slippage, cotação expirada, chainId incorreto, autenticação cancelada e envio duplicado.

## 8. Pendências antes de produção

- Tela de revisão e envio completa;
- seleção de conta ativa;
- provider de cotações auditado;
- endereços oficiais verificados de USDC, BRLA, WPOL e roteador;
- política de backup/recuperação;
- PIN interno com derivação forte, se realmente necessário;
- auditoria independente, threat model, pentest e publicação com política de privacidade;
- testes com valores pequenos em Amoy e depois Polygon.
