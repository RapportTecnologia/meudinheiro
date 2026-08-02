<div align="center">

# Layer 3 off-line/off-chain

[![Documento](https://img.shields.io/badge/documento-Layer%203-f97316?style=flat-square)](./OFFLINE_LAYER3.md)
[![Polygon](https://img.shields.io/badge/settlement-Polygon%20PoS-8247E5?style=flat-square)](./OFFLINE_LAYER3.md)
[![Status](https://img.shields.io/badge/status-experimental-C2410C?style=flat-square)](./OFFLINE_LAYER3.md)

</div>

## Objetivo

Permitir pagamentos locais temporários sem internet e liquidá-los na Polygon
quando a conexão voltar. A Layer 3 não cria supply: o usuário bloqueia
previamente Token Oficial em uma reserva do Diamond regional e recebe notas
digitais assinadas até esse limite.

```text
ON-LINE                         OFF-LINE                         ON-LINE
reserva no Diamond  ->  nota -> QR do pagador -> recebedor -> API regional
                                                            -> gasto único SQL
                                                            -> outbox/worker
                                                            -> Polygon/Diamond
```

## Jornada no aplicativo

1. Com internet, o usuário autentica e cria uma reserva pré-financiada na Smart
   Account, vinculando seu EOA como assinador autorizado.
2. Informa o `reserveId`, o app cria um segredo aleatório, envia apenas o
   compromisso e assina a autorização depois de biometria, PIN ou padrão.
3. A API confere região, titular, assinador, saldo e prazo on-chain e assina a
   nota. O segredo fica somente no SecureStore, fragmentado em registros curtos.
4. Sem internet, o pagador informa a Smart Account do recebedor, autentica e
   mostra um QR que contém as notas e fixa valor, destinatário, região e prazo.
5. O recebedor lê o QR, revisa, valida localmente as duas assinaturas e autentica.
   O app mostra **PENDENTE OFF-LINE**, nunca “pago”.
6. Ao recuperar conexão, o recebedor autentica e sincroniza. O backend rejeita
   gasto repetido numa transação PostgreSQL e enfileira a liquidação.
7. O worker chama `settleOfflineBatch`; o Diamond libera o saldo reservado ao
   recebedor e ancora `batchId` e `notesRoot`.

## Modelo de segurança

Uma transferência desconectada não tem finalidade imediata: o recebedor não
consegue consultar o conjunto global de notas gastas. Um pagador malicioso pode
apresentar o mesmo valor a dois recebedores antes que qualquer um sincronize.
Por isso:

- valores e duração off-line são baixos e configurados por região;
- notas expiram e existe janela adicional para sincronização;
- notas mostradas em QR viram `transferred_pending` e não são restauradas
  automaticamente;
- pacotes recebidos ficam `received_pending` até a API aceitar;
- falha de rede nunca apaga o instrumento ao portador;
- a tela alerta sobre risco de gasto duplo e exige autenticação em emissão,
  pagamento, aceitação e sincronização;
- o QR com notas não é copiado automaticamente nem enviado à telemetria;
- o app confere Token Oficial, região, emissor, destinatário, limite e prazo.

O índice público contém somente referência, estado, valor e prazo. Segredos,
notas e pacotes são divididos em blocos e gravados pelo Expo SecureStore.

## Autorização geográfica off-line

Antes de sair da cobertura, o app pode obter uma decisão geográfica curta e de uso único. O identificador dessa decisão integra a mensagem assinada do pagamento v2 e é consumido pelo backend ao sincronizar. A expiração ou ausência da autorização bloqueia o pagamento; coordenadas exatas não entram no QR.

## Formato v2

- `commitment = SHA-256(secret)`;
- assinatura EIP-191 do emissor sobre região, reserva, compromisso, valor e prazo;
- assinatura EIP-191 do pagador sobre todo o pacote;
- URI `meudinheiro-offline:v2?payload=...`, incluindo `geofenceDecisionId`;
- `notesRoot = keccak256(commitments ordenados)` na liquidação.

O v2 é um protocolo próprio e linkável pelo emissor. Ele **não usa assinaturas
cegas, não implementa Cashu e não declara interoperabilidade Cashu**.

## Inspiração e atribuição

O recurso foi inspirado conceitualmente no
[Minibits Wallet](https://github.com/minibits-cash/minibits_wallet), em especial
no transporte de e-cash por QR e no recebimento off-line para resgate posterior,
e no [protocolo Cashu](https://docs.cashu.space/protocol). A orientação de o
comerciante validar unidade, valor e emissor e resgatar antes de considerar o
pagamento definitivo também aparece na documentação
[Cashu para comerciantes](https://docs.cashu.space/merchants).

Nenhum código do Minibits foi copiado. O
[FAQ do Cashu](https://docs.cashu.space/faq) é uma referência útil sobre o
caráter ao portador, confiança no emissor e riscos de custódia.

## Limites desta base

A emissão de notas já integra a reserva existente, mas o provisioning da
`reserveOfflineBalance` deve ser incluído no Gateway ERC-4337 regional e
auditado antes de ser habilitado. Também são obrigatórios: auditoria
criptográfica e de contratos, KMS/HSM, atestação do app, reconciliação, limites
por identidade/dispositivo, piloto controlado e parecer regulatório/LGPD.
