# Incentivo Local — Cashback e Descontos

[![Status](https://img.shields.io/badge/status-base%20implementada-f97316?style=flat-square)](../README.md)
[![Polygon PoS](https://img.shields.io/badge/Polygon%20PoS-chainId%20137-8247E5?style=flat-square&logo=polygon)](https://polygon.technology/)
[![ERC-4337](https://img.shields.io/badge/gás-ERC--4337-111827?style=flat-square)](ACCOUNT_ABSTRACTION.md)
[![Visitantes](https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-incentivos&label=VISITANTES&labelColor=%23111827&countColor=%23F97316)](https://github.com/RapportTecnologia/meudinheiro)

> Documento do produto **Meu Dinheiro — Fortalece minha região**. O módulo é uma
> base de engenharia e exige auditoria, regras fiscais/consumeristas e homologação
> operacional antes do uso com fundos reais.

## Objetivo

Estimular compras no comércio regional por meio de benefícios pequenos,
transparentes e previsíveis:

- **desconto:** reduz o valor que o cliente transfere ao comerciante;
- **cashback:** devolve ao cliente Tokens Oficiais que já estavam depositados no
  orçamento da campanha;
- **gamificação responsável:** campanhas, metas de frequência e progressão podem
  ser apresentadas pela interface, mas o benefício financeiro nunca depende de
  sorteio, aposta, roleta, caixa-surpresa ou aleatoriedade.

## Regra de lastro

O incentivo não cria moeda.

1. O patrocinador financia a campanha transferindo Tokens Oficiais já emitidos e
   lastreados para o escrow do Diamond regional.
2. Uma compra elegível transfere o valor líquido da Smart Account do cliente para
   a carteira cadastrada do comerciante.
3. Na mesma transação, o Diamond transfere o cashback do escrow da campanha para
   o cliente.
4. A função de pagamento não chama `mint` nem `burn`; o `totalSupply` permanece
   inalterado.
5. Se o orçamento não cobrir o cashback, a campanha não pode prometer o benefício.

O desconto é uma redução comercial no preço. O cashback é redistribuição de
tokens existentes. Nenhum dos dois altera a reserva fiduciária exigida para os
Tokens Oficiais em circulação.

## Exemplo

Para uma compra bruta de **R$ 100,00**, campanha com desconto de **10%**,
cashback de **5%** e teto de cashback de **R$ 2,00**:

| Item | Valor |
| --- | ---: |
| Compra bruta | R$ 100,00 |
| Desconto | R$ 10,00 |
| Cliente paga | R$ 90,00 |
| Cashback teórico | R$ 5,00 |
| Cashback aplicado pelo teto | R$ 2,00 |
| Benefício total | R$ 12,00 |

## Regras de campanha

- uma campanha pertence a um comerciante e a um patrocinador;
- percentuais máximos: 30% de desconto, 10% de cashback e 40% de benefício total;
- período de início e fim obrigatório;
- valor mínimo de compra;
- teto de cashback por compra;
- teto acumulado por cliente;
- orçamento disponível e saldo de escrow verificáveis on-chain;
- parâmetros econômicos são imutáveis depois da criação; alteração exige desativar
  a campanha e criar outra;
- somente o patrocinador pode abastecer ou retirar o saldo não utilizado;
- retirada só é permitida após desativação ou encerramento;
- identificador único por pagamento impede repetição;
- pagamento, desconto e cashback são liquidados atomicamente;
- toda compra exige revisão e biometria, PIN ou padrão;
- o Paymaster pode patrocinar a operação elegível, mantendo custo de gás de
  `0 POL` para o cliente.

## Fluxo da compra

```text
Calculadora -> campanha -> cotação local -> revisão
     -> biometria/PIN/padrão -> UserOperation ERC-4337
     -> payWithIncentive -> comerciante + cashback -> confirmação
```

O gateway deve recomputar a oferta usando o estado confirmado da Polygon e
devolver a `UserOperation`. O aplicativo compara campanha, operação, comerciante,
valor bruto, valor líquido, cashback, EntryPoint, Smart Account e hash antes de
assinar. Divergências bloqueiam o pagamento.

## Controles e observabilidade

- eventos de criação, financiamento, ativação, compra e retirada;
- reconciliação entre saldo do Diamond, cashback reservado e resgates Pix
  bloqueados;
- limites de campanha aplicados on-chain, não apenas na interface;
- proteção contra repetição e contra pagamento ao endereço zero;
- trilha operacional por região e monitoramento do saldo do Paymaster;
- termos da promoção acessíveis antes da autorização;
- dados pessoais mínimos, retenção definida e controles compatíveis com a LGPD;
- análise fiscal, contábil, consumerista e regulatória antes de produção.

## Critérios de aceite

- [x] cálculo monetário no app usa inteiros, sem ponto flutuante;
- [x] descontos, limites e período possuem testes de domínio;
- [x] compra exige autenticação local;
- [x] integração prepara e assina UserOperation patrocinada;
- [x] Diamond executa pagamento e cashback atomicamente;
- [x] cashback somente usa orçamento pré-financiado;
- [x] `totalSupply` não se altera na compra incentivada;
- [x] operação repetida é rejeitada;
- [ ] gateway, Bundler e Paymaster implantados e testados em ambiente integrado;
- [ ] auditoria independente dos contratos e do modelo econômico;
- [ ] homologação jurídica, fiscal, contábil e consumerista.

