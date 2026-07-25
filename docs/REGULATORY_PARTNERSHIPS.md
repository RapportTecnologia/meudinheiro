# Parcerias regulatórias, bancos e moeda social

[![Documento](https://img.shields.io/badge/documento-regulat%C3%B3rio-166534)](./REGULATORY_PARTNERSHIPS.md)
[![Atualizado](https://img.shields.io/badge/atualizado-julho%202026-C2410C)](./REGULATORY_PARTNERSHIPS.md)
[![Brasil](https://img.shields.io/badge/jurisdi%C3%A7%C3%A3o-Brasil-009C3B)](https://www.bcb.gov.br/)

> Documento arquitetural e de requisitos. Não substitui parecer jurídico, autorização do Banco Central, auditoria ou contrato com instituição regulada.

## Decisão de produto

O **Meu Dinheiro — Fortalece minha região** é a camada tecnológica e comunitária. O aplicativo não deve se apresentar como banco, instituição de pagamento, custodiante da reserva, participante Pix ou prestador de serviços de ativos virtuais sem possuir a autorização correspondente.

A classificação jurídica depende da função econômica e operacional, não do nome “moeda social”, “token” ou “programa comunitário”. Um token resgatável em reais, aceito por vários comerciantes e movimentado em nome de terceiros pode exigir análise simultânea das regras de pagamentos, moeda eletrônica e ativos virtuais.

## Modelo de parceria obrigatório

| Responsabilidade | Executor em produção | Regra de habilitação |
|---|---|---|
| Conta, Pix e liquidação BRL | banco, instituição financeira ou instituição de pagamento autorizada pelo BCB | identificação ostensiva no app, contrato vigente e referência de autorização ativa |
| Custódia e conciliação da reserva 1:1 | instituição regulada e conta segregada definida contratualmente | razão social, CNPJ, responsabilidades, SLA e trilha de auditoria |
| KYC, PLD/FTP e monitoramento transacional | parceiro regulado, com responsabilidades compartilhadas formalizadas | política vigente, base legal de dados e procedimentos de bloqueio/comunicação |
| Serviços de ativos virtuais para terceiros | SPSAV ou instituição elegível/autorizada conforme regulação do BCB | autorização aplicável e escopo compatível com transferência, custódia, troca ou intermediação |
| Governança e benefícios locais | operador comunitário regional | não pode assumir por autodeclaração as funções reguladas acima |
| Tecnologia, carteira e UX | plataforma Meu Dinheiro | deve exibir quem presta cada serviço e não induzir o usuário a erro |

Parcerias de Banking as a Service devem identificar a instituição prestadora nas interfaces, contratos e comunicações, com governança, controles e responsabilidades claras.

## Base normativa acompanhada

- [Lei nº 12.865/2013](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12865.htm): arranjos e instituições de pagamento, contas de pagamento e moeda eletrônica.
- [Página do BCB sobre instituições de pagamento](https://www.bcb.gov.br/estabilidadefinanceira/instituicaopagamento): diferencia serviços de pagamento das atividades privativas de instituição financeira.
- [Lei nº 14.478/2022](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14478.htm): marco legal dos ativos virtuais, autorização prévia e princípios de governança, segurança, proteção do consumidor e PLD/FTP.
- [Decreto nº 11.563/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/decreto/d11563.htm): atribui ao Banco Central a regulação, autorização e supervisão dos prestadores de serviços de ativos virtuais.
- [FAQ do BCB sobre ativos virtuais](https://www.bcb.gov.br/meubc/faqs/s/moedas-virtuais): referência operacional para as Resoluções BCB nº 519 e 520, vigentes desde fevereiro de 2026.
- [Comunicado do BCB sobre Banking as a Service](https://www.bcb.gov.br/detalhenoticia/20950/nota): transparência do prestador, governança e adaptação contratual.
- [Regras prudenciais para ativos virtuais](https://www.bcb.gov.br/detalhenoticia/21192/nota): Resolução BCB nº 580/2026 e transição prudencial a partir de 2027.
- [Aperfeiçoamentos de segurança do Pix](https://www.bcb.gov.br/detalhenoticia/20401/nota): ingresso de participantes sujeito à autorização do BCB.

## Projetos sobre bancos comunitários e moedas sociais

Não existe, nesta arquitetura, uma “licença de banco comunitário” presumida. Os textos abaixo são **projetos em tramitação**, não permissões vigentes:

- [PL 4.476/2023](https://www.camara.leg.br/proposicoesWeb/prop_imp?idProposicao=2387875&ord=1&tp=completa), em tramitação na Câmara;
- [PL 52/2025](https://www.camara.leg.br/noticias/1146804-PROJETO-REGULAMENTA-ATUACAO-DOS-BANCOS-COMUNITARIOS-NO-BRASIL), também sob análise legislativa.

A eventual certificação futura de banco comunitário ou moeda social não substitui automaticamente as autorizações para Pix, conta de pagamento, custódia de reserva ou serviços de ativos virtuais.

## Requisitos funcionais

- **RF-REG-01** — consultar o manifesto de parceiros por região, chain ID e Token Oficial.
- **RF-REG-02** — exibir razão social, CNPJ, site, autoridade, referência, situação, validade e responsabilidades de cada parceiro.
- **RF-REG-03** — bloquear carga e resgate via Pix se faltarem parceiros ativos para `PIX`, `RESERVE_CUSTODY` ou `KYC_AML`.
- **RF-REG-04** — impedir que `community_program_operator` seja aceito em papel regulado sem instituição autorizada pelo BCB.
- **RF-REG-05** — disponibilizar Termos e Política de Privacidade por HTTPS.
- **RF-REG-06** — exigir revalidação ao expirar a política ou mudar o contrato do Token Oficial.
- **RF-REG-07** — vincular a versão pública do manifesto a um hash registrado no Diamond regional.
- **RF-REG-08** — autenticação do dispositivo continua obrigatória para toda intenção transacional; a validação regulatória ocorre antes da autenticação e do envio.

## Contrato do gateway

`GET /v1/compliance/partner-disclosure?chainId=137&tokenAddress=0x...`

```json
{
  "policyVersion": "fortaleza-centro/2026-07",
  "effectiveAt": "2026-07-01T00:00:00.000Z",
  "expiresAt": "2027-06-30T23:59:59.000Z",
  "termsUrl": "https://exemplo.com/termos",
  "privacyUrl": "https://exemplo.com/privacidade",
  "partners": [{
    "id": "ip-001",
    "legalName": "INSTITUICAO AUTORIZADA S.A.",
    "cnpj": "00000000000000",
    "kind": "payment_institution",
    "roles": ["PIX", "RESERVE_CUSTODY", "KYC_AML"],
    "authorization": {
      "authority": "BCB",
      "reference": "processo-ou-codigo-publico",
      "status": "active",
      "verifiedAt": "2026-07-20T00:00:00.000Z"
    },
    "websiteUrl": "https://exemplo.com"
  }]
}
```

O backend deve verificar a referência em fonte oficial, assinar o manifesto, manter histórico imutável e recusar versões expiradas. O app valida forma, vigência, HTTPS e cobertura dos papéis, mas não transforma uma declaração em autorização.

## Critérios de entrada em produção

1. parecer jurídico sobre o enquadramento do Token Oficial e dos fluxos de emissão, transferência, resgate, cashback e swap;
2. contratos assinados com as instituições reguladas e matriz RACI;
3. validação independente das autorizações e do escopo de cada parceiro;
4. políticas de KYC, PLD/FTP, proteção de dados, atendimento, fraude, incidentes e continuidade;
5. segregação e conciliação diária da reserva, auditoria e transparência pública;
6. homologação do gateway, webhooks Pix idempotentes, sanções/listas restritivas e limites de risco;
7. auditoria de segurança do app, backend, Paymaster, Diamond e procedimentos de upgrade.
