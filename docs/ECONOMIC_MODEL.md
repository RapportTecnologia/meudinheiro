<div align="center">
  <h1>Meu Dinheiro — Modelo econômico</h1>
  <p>Token Oficial lastreado em BRL, Mint & Burn, resgate Pix e gás patrocinado.</p>

  <img alt="Documento Modelo econômico" src="https://img.shields.io/badge/documento-Modelo%20econômico-f97316?style=flat-square">
  <a href="https://github.com/RapportTecnologia/meudinheiro"><img alt="Repositório público" src="https://img.shields.io/badge/repositório-público-111827?style=flat-square&logo=github"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/commits/main/docs/ECONOMIC_MODEL.md"><img alt="Última atualização" src="https://img.shields.io/github/last-commit/RapportTecnologia/meudinheiro?style=flat-square&color=f97316&label=atualização"></a>
  <img alt="Rede Polygon" src="https://img.shields.io/badge/rede-Polygon-8247E5?style=flat-square&logo=polygon">
  <img alt="Visitantes do modelo econômico" src="https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-economic-model&label=VISITANTES&labelColor=%23111827&countColor=%23F97316">

  <p><a href="../README.md">Início</a> · <a href="REQUIREMENTS.md">Requisitos</a> · <a href="ARCHITECTURE.md">Arquitetura</a> · <a href="USE_CASES.md">Casos de uso</a> · <a href="ACCOUNT_ABSTRACTION.md">ERC-4337</a></p>
</div>

## 1. Princípios

- Toda transferência no aplicativo usa o **Token Oficial Meu Dinheiro** da
  região na Polygon PoS.
- A referência de emissão e resgate é bruta: **1 Token Oficial = R$ 1,00**.
- Cada emissão exige um Pix efetivamente liquidado na conta de reserva.
- Cada resgate bloqueia os tokens antes do Pix e os queima somente após a
  confirmação bancária.
- O contrato não acessa Pix nem conta bancária. A integração é híbrida,
  auditável e idempotente.
- A reserva não é capital operacional e deve permanecer segregada, líquida e
  conciliada.
- O usuário final paga `0 POL` nas operações elegíveis: o Paymaster ERC-4337
  assume o gás.

O token não representa participação societária, promessa de rendimento ou
direito sobre o resultado da plataforma.

## 2. Entrada de capital — Mint

Exemplo: o usuário solicita uma carga de R$ 100.

1. O backend cria uma cobrança Pix com `operationId` único.
2. O banco/PSP confirma por webhook assinado que R$ 100 foram liquidados na
   conta segregada de reserva.
3. O reconciliador valida valor, titularidade/regras de compliance, duplicidade
   e o `endToEndId`.
4. Somente então o operador autorizado chama `mintFromPix`.
5. A facet emite 100 tokens para a Smart Account indicada.
6. O hash opaco do identificador Pix e o `operationId` ficam registrados
   on-chain; dados pessoais e payload Pix não.

Não existe oferta inicial livre: cada Diamond regional nasce com oferta zero.
Uma mesma operação ou referência Pix não pode emitir duas vezes.

## 3. Saída de capital — Burn e Pix

O resgate usa uma saga em duas fases para não queimar antes de o dinheiro
chegar ao usuário:

1. A tela mostra valor bruto, taxa e Pix líquido.
2. O usuário autentica com biometria, PIN ou padrão.
3. `requestRedemption` move o valor bruto para o cofre do Diamond.
4. O backend confirma o bloqueio e ordena o Pix líquido.
5. Após confirmação bancária, o operador chama `finalizeRedemption`.
6. O contrato queima todos os tokens brutos bloqueados.

Se o Pix falhar, o operador estorna imediatamente. Depois do prazo configurado,
o próprio usuário pode recuperar os tokens bloqueados. `operationId` e
referência Pix são de uso único.

## 4. Taxa de resgate

A sustentabilidade pode incluir uma taxa somente na conversão de volta para
Pix, configurável entre **0% e 1%**. A faixa comercial pretendida é de
**0,5% a 1%**.

```text
taxa = arredondarParaCima(valorBruto × taxaBps / 10.000)
pixLiquido = valorBruto - taxa
```

| Resgate bruto | Taxa | Pix líquido |
| ---: | ---: | ---: |
| R$ 100,00 | 0,5% | R$ 99,50 |
| R$ 100,00 | 1,0% | R$ 99,00 |

Regras:

- a paridade de R$ 1,00 é bruta; a taxa não altera o preço do token;
- a taxa aparece antes da autenticação;
- transferências on-chain comuns não recebem essa taxa;
- Pix falho ou cancelado resulta em estorno integral dos tokens e nenhuma taxa;
- receita de taxa só é reconhecida após Pix confirmado, burn e conciliação;
- a configuração on-chain limita a taxa a 100 basis points.

## 5. Reservas e sustentabilidade

A plataforma pode obter receita com a taxa de resgate e, se juridicamente
permitido, com o rendimento conservador das reservas em BRL. Essa estratégia
jamais pode reduzir o lastro, atrasar resgates ou prometer rendimento ao
portador.

Invariante operacional:

```text
reservaBRL >= tokensEmCirculacao + resgatesBloqueadosAindaNaoPagos
```

Controles mínimos:

- conta de reserva separada da conta operacional;
- ativos de altíssima liquidez e política de risco aprovada;
- conciliação bancária × banco de dados × eventos on-chain;
- prova periódica de reservas e passivos;
- auditoria independente e trilha imutável;
- limites por operação, região e período;
- pausa de Mint/resgate em divergência;
- dupla aprovação e chaves operacionais em KMS/HSM;
- reconhecimento separado de principal, taxa e eventual rendimento;
- plano de liquidez, contingência do PSP e tratamento de chargeback/fraude.

O Paymaster, operação da plataforma, impostos, auditorias e compliance são
custos operacionais. A reserva que lastreia tokens não pode ser consumida para
pagá-los.

## 6. Custo zero para o usuário

A Polygon continua cobrando gás. O Paymaster paga POL em background para
transferências do Token Oficial e pedidos de resgate expressamente autorizados
na política.

| Item | Responsável |
| --- | --- |
| Token Oficial | Smart Account do usuário |
| Assinatura | Chave local após autenticação |
| Gás Polygon | Paymaster da plataforma |
| Envio ao EntryPoint | Bundler |
| POL debitado do usuário | **0 POL** |

Se o patrocínio estiver indisponível, o app bloqueia com segurança. Não existe
fallback silencioso usando POL da EOA do usuário.

## 7. Comerciantes e circulação regional

Comerciantes continuam sendo pontos de circulação local: recebem pagamentos,
podem carregar usuários por transferência on-chain e operar estoque. O fluxo
Pix/Mint da plataforma, porém, é a fonte contábil primária de nova emissão.
Transferências entre carteiras nunca criam oferta.

Swap de tesouraria Token Oficial ↔ POL permanece separado, sujeito a liquidez,
slippage e política comercial. Usuários comuns apenas enviam e recebem o Token
Oficial; não precisam comprar POL quando o patrocínio está disponível.

## 8. Segurança e privacidade

- Toda ação financeira exige revisão e autenticação local.
- Chaves privadas nunca chegam ao Gateway Pix/ERC-4337.
- Dados Pix, CPF/CNPJ e dados bancários não vão para a blockchain.
- Webhooks exigem assinatura, allowlist, replay protection e idempotência.
- O app e o backend reproduzem valor bruto, taxa, líquido, contrato e chainId.
- O backend nunca considera um webhook isolado como prova suficiente: consulta
  o PSP quando necessário e reconcilia estados.
- Estados terminais não podem regredir.

## 9. Conformidade antes de produção

O modelo depende de integração com banco/PSP regulado e análise jurídica,
contábil, fiscal, consumerista e de prevenção à lavagem de dinheiro no Brasil.
Antes de operar com dinheiro real são obrigatórios, no mínimo:

- parecer jurídico sobre o enquadramento do token e do arranjo;
- parceiro bancário/PSP regulado;
- KYC/KYB, AML/CFT, sanções e monitoramento;
- termos claros de emissão, resgate, taxa, prazo e indisponibilidade;
- segregação patrimonial e política de reservas;
- auditoria independente de contratos, sistemas e reconciliação.

Referências oficiais: [Lei 14.478/2022](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14478.htm),
[Decreto 11.563/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/decreto/d11563.htm),
[Lei 12.865/2013](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12865.htm),
[Resolução BCB 520](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?numero=520&tipo=Resolu%C3%A7%C3%A3o+BCB)
e [Parecer CVM 40](https://www.gov.br/cvm/pt-br/assuntos/noticias/2022/cvm-divulga-parecer-de-orientacao-sobre-criptoativos-e-o-mercado-de-valores-mobiliarios).

Este documento é uma especificação técnica, não um parecer jurídico nem uma
oferta pública.
