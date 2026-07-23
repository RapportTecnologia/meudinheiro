<div align="center">
  <h1>Meu Dinheiro — Requisitos</h1>
  <p>Requisitos funcionais, segurança, regras de negócio e critérios de aceite.</p>

  <img alt="Documento Requisitos" src="https://img.shields.io/badge/documento-Requisitos-f97316?style=flat-square">
  <a href="https://github.com/RapportTecnologia/meudinheiro"><img alt="Repositório público" src="https://img.shields.io/badge/repositório-público-111827?style=flat-square&logo=github"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/commits/main/docs/REQUIREMENTS.md"><img alt="Última atualização" src="https://img.shields.io/github/last-commit/RapportTecnologia/meudinheiro?style=flat-square&color=f97316&label=atualização"></a>
  <img alt="Status do documento" src="https://img.shields.io/badge/status-evolutivo-111827?style=flat-square">
  <img alt="Visitantes dos requisitos" src="https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-requirements&label=VISITANTES&labelColor=%23111827&countColor=%23F97316">

  <p><a href="../README.md">Início</a> · <a href="ARCHITECTURE.md">Arquitetura</a> · <a href="USE_CASES.md">Casos de uso</a> · <a href="ECONOMIC_MODEL.md">Modelo econômico</a> · <a href="CONTACTS_AND_SHARING.md">Agenda</a></p>
</div>

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
- Um Token Oficial Meu Dinheiro ERC-20 fixado por ambiente.
- Cotação Token Oficial/BRL por provedor validado.
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
| Usuário comum | Enviar e receber o Token Oficial e manter POL para gás |
| Comerciante | Distribuir o Token Oficial e POL, operar estoque e receber pagamentos |
| Aplicativo | Calcular, validar, montar e transmitir transações |
| Dispositivo | Proteger segredos e autenticar operações |
| RPC Polygon | Consultar a rede e transmitir transações assinadas |
| Token Oficial ERC-20 | Único ativo de pagamento do aplicativo |
| QuoteProvider | Cotar o Token Oficial em BRL com prazo de validade |
| Roteador de swap | Converter estoque do comerciante entre Token Oficial e POL |

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

### 4.3 Token Oficial

- **RF-TKN-01:** todas as transferências de valor do app devem usar o Token
  Oficial Meu Dinheiro ERC-20.
- **RF-TKN-02:** o contrato oficial deve vir de configuração compilada ou
  assinada para cada ambiente; o usuário não pode substituí-lo.
- **RF-TKN-03:** o app deve validar `chainId`, checksum, bytecode, `name`,
  `symbol` e `decimals`.
- **RF-TKN-04:** a identidade do token é o contrato, não o símbolo.
- **RF-TKN-05:** POL não pode ser selecionado como ativo de pagamento.
- **RF-TKN-06:** POL deve ser tratado exclusivamente como moeda de gás.
- **RF-TKN-07:** a interface deve exibir saldo do Token Oficial e saldo de POL
  separadamente.

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
- **RF-QR-09:** o contrato presente no QR deve ser exatamente o Token Oficial.
- **RF-QR-10:** uma cobrança com valor deve prevalecer sobre o valor previamente
  digitado pelo pagador.
- **RF-QR-11:** um QR com somente endereço pode herdar o valor e ativo
  selecionados pelo pagador, mas ainda deve passar pela revisão.

### 4.6 Envio

- **RF-SEND-01:** receber da Home o valor calculado como intenção inicial.
- **RF-SEND-02:** o ativo transmitido deve ser sempre o Token Oficial.
- **RF-SEND-03:** validar destinatário, saldo, decimais e valor.
- **RF-SEND-04:** exibir tela de revisão com rede, conta, destinatário, ativo,
  valor e estimativa de gás.
- **RF-SEND-05:** exigir autenticação do dispositivo depois da revisão.
- **RF-SEND-06:** simular e estimar a transação antes de assinar.
- **RF-SEND-07:** impedir submissão duplicada enquanto uma tentativa estiver
  em andamento.
- **RF-SEND-08:** acompanhar hash, recibo e estado final.
- **RF-SEND-09:** bloquear transferência para a mesma conta de origem.
- **RF-SEND-10:** validar saldo do Token Oficial para o pagamento.
- **RF-SEND-11:** estimar a chamada ERC-20 `transfer` e verificar POL suficiente
  para gás antes da autenticação.
- **RF-SEND-12:** saldo POL insuficiente deve bloquear a transação e informar
  saldo atual, necessidade estimada e opções de abastecimento.

### 4.7 Pedido de pagamento e abastecimento

- **RF-PAY-01:** permitir informar o valor em BRL ou diretamente em unidades do
  Token Oficial.
- **RF-PAY-02:** a liquidação on-chain deve ocorrer sempre no Token Oficial.
- **RF-PAY-03:** ao receber um valor em BRL, consultar o QuoteProvider antes de
  gerar o QR ou a transação.
- **RF-PAY-04:** exibir BRL, preço do token, quantidade final de tokens, fonte,
  horário e expiração.
- **RF-PAY-05:** o botão Receber deve usar o resultado validado da calculadora.
- **RF-PAY-06:** o recebedor deve visualizar valor, símbolo, rede e endereço
  junto ao QR.
- **RF-PAY-07:** recebimento de dinheiro físico é confirmado externamente e
  nunca prova, por si só, uma transferência on-chain.
- **RF-PAY-08:** o pagador deve revisar valor, ativo, rede e destinatário antes
  da autenticação.
- **RF-PAY-09:** pagamentos em estabelecimento e entre pessoas devem usar o
  mesmo modelo de solicitação.
- **RF-PAY-10:** cotação ausente, expirada ou inconsistente deve bloquear o
  fluxo em BRL.
- **RF-PAY-11:** cálculos de conversão devem usar decimal/integer e arredondar
  somente na menor unidade do token.
- **RF-PAY-12:** o QR deve transportar a quantidade final do Token Oficial, não
  apenas o valor original em BRL.

### 4.8 Swap

- **RF-SWP-01:** o swap Token Oficial ↔ POL é reservado ao modo comerciante
  autorizado para gestão de estoque e gás.
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
- **RF-SWP-12:** a interface do usuário comum não deve oferecer swap nem
  seleção de outros tokens.

### 4.9 Exportação de chave

- **RF-KEY-01:** exibir aviso de alto risco antes da exportação.
- **RF-KEY-02:** exigir autenticação biométrica ou credencial do dispositivo.
- **RF-KEY-03:** revelar somente a chave da conta escolhida.
- **RF-KEY-04:** nunca persistir a chave revelada no estado da interface.
- **RF-KEY-05:** alertar sobre a área de transferência e recomendar sua
  limpeza imediata.
- **RF-KEY-06:** não permitir captura ou telemetria da tela sensível quando a
  plataforma oferecer bloqueio apropriado.

### 4.10 Agenda de destinatários

- **RF-CON-01:** manter uma agenda interna de destinatários frequentes.
- **RF-CON-02:** cada contato deve possuir nome, endereço com checksum,
  favorito, data do último uso e contador de uso.
- **RF-CON-03:** ordenar por favorito, frequência e recência.
- **RF-CON-04:** permitir adicionar, editar, visualizar e remover contatos.
- **RF-CON-05:** alteração de endereço deve exigir confirmação explícita.
- **RF-CON-06:** QR ou clipboard não podem atualizar um contato
  automaticamente.
- **RF-CON-07:** selecionar um contato somente preenche o destinatário; revisão
  e autenticação continuam obrigatórias.
- **RF-CON-08:** não solicitar acesso à agenda do Android por padrão.
- **RF-CON-09:** nunca armazenar chave, seed ou segredo em um contato.
- **RF-CON-10:** ao revisar uma transferência para endereço desconhecido, o app
  deve perguntar se o usuário deseja salvá-lo.
- **RF-CON-11:** escolher salvar deve exigir um nome antes da autenticação da
  transferência.
- **RF-CON-12:** nomes devem ser únicos após normalização de espaços, Unicode e
  maiúsculas/minúsculas.
- **RF-CON-13:** endereços devem ser únicos após normalização EVM.
- **RF-CON-14:** conflito de nome deve orientar o usuário a escolher outro nome
  ou editar o contato existente.
- **RF-CON-15:** conflito de endereço deve identificar o contato existente e
  orientar sua edição.
- **RF-CON-16:** um novo destinatário deve ser persistido somente após
  confirmação da transferência.
- **RF-CON-17:** transação cancelada, rejeitada ou sem confirmação não deve
  criar o contato.
- **RF-CON-18:** editar nome ou endereço deve preservar favoritos e métricas de
  uso.
- **RF-CON-19:** mudar o endereço de um contato deve mostrar o endereço completo
  e exigir confirmação explícita.
- **RF-CON-20:** falha ao salvar um contato após confirmação on-chain não pode
  fazer o app declarar que o pagamento falhou.

### 4.11 Área de transferência

- **RF-CLP-01:** a tela Receber deve permitir copiar a solicitação EIP-681.
- **RF-CLP-02:** o código deve conter contrato oficial, `chainId` 137,
  operação `transfer`, destino e quantidade proposta.
- **RF-CLP-03:** quando a entrada for BRL, a quantidade deve ser calculada pela
  cotação antes da cópia.
- **RF-CLP-04:** o app só pode ler o clipboard após ação explícita do usuário.
- **RF-CLP-05:** conteúdo colado deve passar pelas mesmas validações do QR.
- **RF-CLP-06:** colar uma solicitação nunca pode enviar automaticamente.
- **RF-CLP-07:** disponibilizar ação para limpar o conteúdo copiado.
- **RF-CLP-08:** nunca copiar chaves, seeds ou credenciais.
- **RF-CLP-09:** agenda, QR, clipboard e endereço manual devem convergir para a
  mesma tela de revisão.

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
- **RN-02:** o contrato do Token Oficial é fixado pelo aplicativo e não pode ser
  alterado pelo usuário.
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
- **RN-12:** todo valor em BRL deve ser convertido pela cotação vigente para a
  quantidade adequada do Token Oficial.
- **RN-13:** POL é reservado ao gás e não constitui ativo de pagamento.
- **RN-14:** saldo do Token Oficial e POL suficiente são condições cumulativas
  para transmitir.
- **RN-15:** o usuário comum somente envia e recebe o Token Oficial; operações
  de estoque e swap pertencem ao modo comerciante.
- **RN-16:** comerciantes são pontos regionais de distribuição do Token Oficial
  e POL e devem possuir reservas compatíveis com suas operações.

## 8. Critérios de aceite da base

- `npm install` conclui usando o lockfile versionado.
- `npm run typecheck` termina sem erro.
- `npm test -- --runInBand` aprova todos os testes.
- A Home executa as quatro operações básicas.
- A terceira conta é rejeitada.
- O contrato do Token Oficial não pode ser substituído na interface.
- QR inválido não altera o destinatário.
- A chave não aparece no estado persistido.
- Exportação chama a autenticação antes de acessar o segredo.
- O swap não aparece para o usuário comum.
- Receber R$ 10 consulta a cotação e gera URI ERC-20 com a quantidade calculada
  do Token Oficial.
- POL nunca aparece como opção de pagamento.
- POL insuficiente bloqueia o envio e apresenta as alternativas previstas.
- Ler uma cobrança abre a revisão, sem transmitir automaticamente.
- Confirmar um pagamento exige biometria, PIN ou padrão.
- Endereço desconhecido exige a escolha **Salvar** ou **Agora não** antes da
  autorização.
- Escolher salvar exige nome único e cria o contato apenas após confirmação.
- Nome ou endereço duplicado bloqueia o salvamento e orienta editar o contato
  existente.
- Editar um endereço exige confirmação exibindo o novo endereço completo.
- Falha de persistência após confirmação não altera o status do pagamento.

## 9. Estratégia de testes

1. Teste unitário das regras de domínio.
2. Teste dos casos de uso com armazenamento, autenticação e blockchain falsos.
3. Teste de componentes com React Native Testing Library.
4. Teste de integração em Amoy ou fork controlado da Polygon.
5. Teste E2E em development build Android.
6. Auditoria de contrato/ABI, threat modeling e testes de segurança.

Casos obrigatórios incluem limite de contas, contrato oficial divergente,
token sem bytecode, decimais extremos, QR inválido, chainId incorreto,
autenticação cancelada, saldo insuficiente do token, POL insuficiente,
cotação expirada, indisponibilidade do cotador, slippage do swap comercial,
allowance, nonce e duplo toque.
Também devem ser cobertos: nome duplicado com variação de espaços/caixa,
endereço duplicado, edição preservando métricas e tentativa de edição usando
nome ou endereço de outro contato.

## 10. Definition of Done para produção

- Tela completa de envio e revisão implementada.
- QuoteProvider e lista de contratos oficiais verificados.
- Contrato do Token Oficial, WPOL e roteador comercial confirmados na Polygon.
- Verificação de POL para gás implementada e testada.
- Perfis de usuário comum e comerciante separados.
- Cotação Token Oficial/BRL com fonte, integridade e expiração.
- Slippage, deadline, aprovação, gás e simulação cobertos por testes.
- Política de backup e recuperação definida.
- Threat model e auditoria independente concluídos.
- Política de privacidade, termos e avisos revisados.
- Testes com valores reduzidos em ambiente controlado aprovados.
- Processo de build, assinatura, atualização e resposta a incidentes definido.
