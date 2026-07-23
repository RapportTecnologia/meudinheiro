# Meu Dinheiro — especificação de requisitos

## 1. Visão do produto

O Meu Dinheiro é um aplicativo Android de carteira autocustodial para a rede
Polygon. A tela principal oferece uma calculadora funcional, cujo resultado
pode ser usado como valor inicial de uma intenção de envio ou swap.

A calculadora é uma interface de entrada, não uma forma de ocultar o
comportamento financeiro. Permissões, confirmações, política de privacidade e
publicação nas lojas devem identificar claramente o aplicativo como carteira.

## 2. Escopo da primeira versão

- Aplicativo React Native com Expo, inicialmente voltado ao Android.
- Interação EVM por ethers.js na Polygon PoS, `chainId` 137.
- Até duas contas EOA importadas no mesmo dispositivo.
- Um contrato ERC-20 configurável como Moeda Base.
- Calculadora, leitura e exibição de QR Code.
- Preparação dos fluxos de envio e swap.
- Autenticação do dispositivo para qualquer operação sensível.

Não fazem parte da primeira base:

- custódia de chaves em servidor;
- compra de cripto com moeda fiduciária;
- bridge entre blockchains;
- recuperação social;
- suporte a redes diferentes da Polygon;
- execução de swap ou envio sem tela de revisão;
- promessa de rentabilidade, cotação ou liquidez.

## 3. Atores

| Ator | Responsabilidade |
| --- | --- |
| Usuário | Controlar as contas, revisar e autorizar operações |
| Caixa/recebedor | Criar uma solicitação de pagamento com ativo e valor |
| Aplicativo | Calcular, validar, montar e transmitir transações |
| Dispositivo | Proteger segredos e autenticar operações |
| RPC Polygon | Consultar a rede e transmitir transações assinadas |
| Contrato ERC-20 | Representar a Moeda Base ou outro token |
| Roteador de swap | Executar uma rota previamente cotada e validada |

## 4. Requisitos funcionais

### 4.1 Calculadora

- **RF-CAL-01:** a Home deve permitir dígitos, separador decimal, soma,
  subtração, multiplicação e divisão.
- **RF-CAL-02:** deve haver comandos para limpar, apagar e calcular.
- **RF-CAL-03:** a expressão deve ser validada por um parser restrito.
- **RF-CAL-04:** resultados não finitos, zero ou negativos não podem iniciar
  uma transferência.
- **RF-CAL-05:** o resultado deve ser convertido para unidades on-chain apenas
  com `parseUnits`, considerando os decimais do ativo.

### 4.2 Contas

- **RF-ACC-01:** o aplicativo deve aceitar no máximo duas contas.
- **RF-ACC-02:** uma conta não pode ser cadastrada duas vezes.
- **RF-ACC-03:** o endereço público pode ser persistido no estado público.
- **RF-ACC-04:** a chave privada deve permanecer somente no armazenamento
  seguro do dispositivo.
- **RF-ACC-05:** deve existir uma conta ativa para consultas e transações.
- **RF-ACC-06:** remover uma conta deve apagar sua chave do armazenamento
  seguro depois de confirmação explícita.
- **RF-ACC-07:** importar uma conta deve validar a chave e derivar o endereço,
  sem registrar o segredo em logs.

### 4.3 Moeda Base

- **RF-TKN-01:** o usuário deve informar um endereço de contrato ERC-20.
- **RF-TKN-02:** o app deve validar checksum, bytecode, `name`, `symbol` e
  `decimals` na Polygon.
- **RF-TKN-03:** o token configurado não pode ser editado.
- **RF-TKN-04:** para trocar a Moeda Base, o usuário deve removê-la e cadastrar
  uma nova.
- **RF-TKN-05:** a remoção deve exigir confirmação e não pode apagar contas.
- **RF-TKN-06:** decisões de segurança não podem confiar somente no símbolo do
  token; o endereço do contrato é sua identidade.
- **RF-TKN-07:** a vinculação nominal ao BRL deve ser uma opção explícita da
  configuração da Moeda Base.
- **RF-TKN-08:** uma configuração antiga sem referência BRL deve ser removida e
  cadastrada novamente para habilitar cobranças em R$.

### 4.4 Saldos

- **RF-BAL-01:** consultar saldo de POL e ERC-20 para a conta ativa.
- **RF-BAL-02:** indicar horário/bloco da última atualização.
- **RF-BAL-03:** tratar RPC indisponível sem substituir o saldo por zero.
- **RF-BAL-04:** atualizar saldos após confirmação de transação.

### 4.5 QR Code

- **RF-QR-01:** solicitar permissão de câmera apenas ao abrir o scanner.
- **RF-QR-02:** aceitar endereço EVM `0x...` e URI compatível com `ethereum:`.
- **RF-QR-03:** rejeitar rede, formato ou checksum inválidos.
- **RF-QR-04:** exibir o endereço da conta ativa como QR Code.
- **RF-QR-05:** mostrar também o endereço em texto selecionável para
  conferência.
- **RF-QR-06:** um QR Code nunca deve disparar uma transação automaticamente.
- **RF-QR-07:** o botão Receber deve gerar uma solicitação EIP-681 contendo
  `chainId`, destinatário, ativo e valor.
- **RF-QR-08:** uma solicitação ERC-20 deve representar
  `transfer(address,uint256)`.
- **RF-QR-09:** uma solicitação POL deve expressar a quantidade em wei no
  parâmetro `value`.
- **RF-QR-10:** uma cobrança com valor deve prevalecer sobre o valor previamente
  digitado pelo pagador.
- **RF-QR-11:** um QR com somente endereço pode herdar o valor e ativo
  selecionados pelo pagador, mas ainda deve passar pela revisão.

### 4.6 Envio

- **RF-SEND-01:** receber da Home o valor calculado como intenção inicial.
- **RF-SEND-02:** permitir selecionar POL ou Moeda Base quando aplicável.
- **RF-SEND-03:** validar destinatário, saldo, decimais e valor.
- **RF-SEND-04:** exibir tela de revisão com rede, conta, destinatário, ativo,
  valor e estimativa de gás.
- **RF-SEND-05:** exigir autenticação do dispositivo depois da revisão.
- **RF-SEND-06:** simular e estimar a transação antes de assinar.
- **RF-SEND-07:** impedir submissão duplicada enquanto uma tentativa estiver
  em andamento.
- **RF-SEND-08:** acompanhar hash, recibo e estado final.
- **RF-SEND-09:** bloquear transferência para a mesma conta de origem.
- **RF-SEND-10:** para POL, validar saldo para o valor e a estimativa de gás.
- **RF-SEND-11:** para ERC-20, validar saldo do token e estimar a chamada
  `transfer`.

### 4.7 Pedido de pagamento e abastecimento

- **RF-PAY-01:** permitir selecionar `R$ • Moeda Base` ou POL antes de informar
  o valor.
- **RF-PAY-02:** em BRL, exigir Moeda Base configurada.
- **RF-PAY-03:** BRL é unidade de exibição; a liquidação on-chain ocorre no
  token da Moeda Base.
- **RF-PAY-04:** o app não deve afirmar paridade com o real sem uma política de
  representação ou cotação configurada.
- **RF-PAY-05:** o botão Receber deve usar o resultado validado da calculadora.
- **RF-PAY-06:** o recebedor deve visualizar valor, símbolo, rede e endereço
  junto ao QR.
- **RF-PAY-07:** recebimento de dinheiro físico é confirmado externamente e
  nunca prova, por si só, uma transferência on-chain.
- **RF-PAY-08:** o pagador deve revisar valor, ativo, rede e destinatário antes
  da autenticação.
- **RF-PAY-09:** pagamentos em estabelecimento e entre pessoas devem usar o
  mesmo modelo de solicitação.

### 4.8 Swap

- **RF-SWP-01:** suportar Moeda Base ↔ POL, USDC ou BRLA.
- **RF-SWP-02:** resolver POL nativo e WPOL explicitamente.
- **RF-SWP-03:** obter cotação de um provedor validado.
- **RF-SWP-04:** exibir rota, preço, impacto, taxa, gás, slippage e mínimo a
  receber.
- **RF-SWP-05:** a cotação deve ter prazo de validade.
- **RF-SWP-06:** calcular e enviar `amountOutMinimum`; nunca usar zero em
  produção.
- **RF-SWP-07:** validar endereço do roteador, pool, fee tier e liquidez.
- **RF-SWP-08:** aprovação ERC-20 deve ser separada do swap e claramente
  apresentada.
- **RF-SWP-09:** aprovação exata deve ser o padrão; aprovação ilimitada deve
  exigir escolha consciente.
- **RF-SWP-10:** cada aprovação e cada swap devem exigir autenticação.
- **RF-SWP-11:** swap deve permanecer desabilitado enquanto contratos e
  cotador não estiverem configurados e auditados.

### 4.9 Exportação de chave

- **RF-KEY-01:** exibir aviso de alto risco antes da exportação.
- **RF-KEY-02:** exigir autenticação biométrica ou credencial do dispositivo.
- **RF-KEY-03:** revelar somente a chave da conta escolhida.
- **RF-KEY-04:** nunca persistir a chave revelada no estado da interface.
- **RF-KEY-05:** alertar sobre a área de transferência e recomendar sua
  limpeza imediata.
- **RF-KEY-06:** não permitir captura ou telemetria da tela sensível quando a
  plataforma oferecer bloqueio apropriado.

## 5. Requisitos de segurança

- **RS-01:** nenhuma chave, seed ou segredo pode entrar em AsyncStorage,
  Zustand, logs, analytics ou relatórios de falha.
- **RS-02:** segredos devem usar SecureStore/Keystore e proteção vinculada ao
  dispositivo.
- **RS-03:** toda operação que possa movimentar fundos deve autenticar o
  usuário por biometria, PIN ou padrão do dispositivo.
- **RS-04:** a autenticação deve autorizar uma operação concreta e expirar ao
  término dela.
- **RS-05:** a conexão deve confirmar `chainId === 137`.
- **RS-06:** endereços de RPC, tokens e roteadores devem ser separados por
  ambiente.
- **RS-07:** valores monetários on-chain devem usar inteiros (`bigint`).
- **RS-08:** respostas de RPC e metadados de token são dados não confiáveis e
  devem ser validados.
- **RS-09:** não registrar calldata, chaves, mnemonics ou cabeçalhos sensíveis.
- **RS-10:** o build de produção deve desabilitar ferramentas de depuração e
  aplicar política de atualização e assinatura.
- **RS-11:** a aplicação deve ter threat model, auditoria independente e
  pentest antes de operar com fundos reais.
- **RS-12:** o aplicativo deve iniciar em modo seguro, com swap desabilitado.

## 6. Requisitos não funcionais

- **RNF-01 — Usabilidade:** fluxos financeiros devem usar linguagem clara e
  apresentar endereço completo sob demanda.
- **RNF-02 — Acessibilidade:** botões devem ter rótulos e contraste adequados.
- **RNF-03 — Desempenho:** interação da calculadora não deve depender da rede.
- **RNF-04 — Resiliência:** falhas de RPC devem ser recuperáveis e não podem
  simular sucesso.
- **RNF-05 — Testabilidade:** domínio e casos de uso devem depender de portas
  substituíveis por fakes.
- **RNF-06 — Manutenibilidade:** dependências devem apontar para dentro,
  conforme a arquitetura documentada.
- **RNF-07 — Observabilidade:** eventos técnicos podem ser coletados sem
  endereço completo, saldo, chave ou dados transacionais sensíveis.
- **RNF-08 — Compatibilidade:** o primeiro alvo é Android em development build
  do Expo.
- **RNF-09 — Transparência:** o app deve ser identificado como carteira nas
  permissões, confirmações, documentação e publicação.

## 7. Regras de negócio

- **RN-01:** duas contas é um limite absoluto da versão inicial.
- **RN-02:** Moeda Base configurada é imutável até remoção explícita.
- **RN-03:** resultado da calculadora é uma intenção; nunca uma autorização.
- **RN-04:** QR Code é dado de entrada; nunca confirmação.
- **RN-05:** nenhuma transação ocorre sem revisão e autenticação.
- **RN-06:** símbolos iguais não significam tokens iguais.
- **RN-07:** cotação expirada não pode ser executada.
- **RN-08:** falha ou cancelamento de autenticação encerra a operação.
- **RN-09:** o app não garante preço, liquidez, conclusão nem rentabilidade.
- **RN-10:** gerar ou mostrar um QR não movimenta fundos e não exige assinatura;
  o dispositivo pagador autentica cada transação.
- **RN-11:** para abastecimento em estabelecimento, o caixa só deve transferir
  após conferir a contraprestação externa.
- **RN-12:** uma Moeda Base arbitrária não deve ser apresentada como equivalente
  a BRL sem cotação ou política de paridade verificável.

## 8. Critérios de aceite da base

- `npm install` conclui usando o lockfile versionado.
- `npm run typecheck` termina sem erro.
- `npm test -- --runInBand` aprova todos os testes.
- A Home executa as quatro operações básicas.
- A terceira conta é rejeitada.
- Uma Moeda Base configurada não pode ser substituída diretamente.
- QR inválido não altera o destinatário.
- A chave não aparece no estado persistido.
- Exportação chama a autenticação antes de acessar o segredo.
- O swap informa que está bloqueado até a configuração de produção.
- Receber R$ 10 gera URI ERC-20 com 10 unidades da Moeda Base.
- Receber POL gera URI nativa com `value` em wei.
- Ler uma cobrança abre a revisão, sem transmitir automaticamente.
- Confirmar um pagamento exige biometria, PIN ou padrão.

## 9. Estratégia de testes

1. Teste unitário das regras de domínio.
2. Teste dos casos de uso com armazenamento, autenticação e blockchain falsos.
3. Teste de componentes com React Native Testing Library.
4. Teste de integração em Amoy ou fork controlado da Polygon.
5. Teste E2E em development build Android.
6. Auditoria de contrato/ABI, threat modeling e testes de segurança.

Casos obrigatórios incluem limite de contas, token duplicado, token sem
bytecode, decimais extremos, QR inválido, chainId incorreto, autenticação
cancelada, saldo insuficiente, slippage, cotação expirada, allowance, nonce e
duplo toque.

## 10. Definition of Done para produção

- Tela completa de envio e revisão implementada.
- QuoteProvider e lista de contratos oficiais verificados.
- Endereços de USDC, BRLA, WPOL e roteador confirmados na Polygon.
- Tratamento de POL nativo implementado e testado.
- Slippage, deadline, aprovação, gás e simulação cobertos por testes.
- Política de backup e recuperação definida.
- Threat model e auditoria independente concluídos.
- Política de privacidade, termos e avisos revisados.
- Testes com valores reduzidos em ambiente controlado aprovados.
- Processo de build, assinatura, atualização e resposta a incidentes definido.
