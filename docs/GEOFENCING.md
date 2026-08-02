<div align="center">

# Geofencing regional

[![Documento](https://img.shields.io/badge/documento-Geofencing-f97316?style=flat-square)](./GEOFENCING.md)
[![Android](https://img.shields.io/badge/localização-primeiro%20plano-166534?style=flat-square)](./GEOFENCING.md)
[![Privacidade](https://img.shields.io/badge/privacidade-LGPD-111827?style=flat-square)](./GEOFENCING.md)

</div>

## Objetivo

Antes de movimentar valor, o app obtém localização em primeiro plano e solicita
ao backend regional uma decisão vinculada à carteira e ao tipo de operação.
Sem decisão permitida e válida, a transação não é assinada.

```text
Usuário inicia a operação
        │ permissão foreground
        ▼
expo-location ──► backend /v1/geofencing/evaluate
                        │
                        ▼
               decisão curta e de uso único
                        │
        biometria/PIN/padrão + assinatura
                        │
                        ▼
                 gateway financeiro
```

## Operações cobertas

- transferência do Token Oficial;
- pagamento com cashback;
- carga e resgate via Pix;
- emissão de notas Layer 3;
- pagamento offline v2;
- swap quando o modo comerciante for habilitado.

O `geofenceDecisionId` faz parte da intenção ERC-4337 ou do cabeçalho da API.
No pacote offline v2, ele faz parte da mensagem assinada pelo pagador.

## Layer 3 offline

Ao atualizar os parâmetros regionais, o app pode obter uma autorização curta de
uso único e armazená-la no SecureStore. Se perder a conectividade, essa
autorização pode criar um único pagamento antes de expirar. O backend verifica
a decisão quando o recebedor sincroniza.

Não existe permissão offline ilimitada: ampliar demasiadamente a validade
enfraqueceria o controle territorial.

## Privacidade e limitações

- localização é solicitada somente durante a ação financeira ou preparação
  explícita do modo offline;
- o app não mantém histórico de coordenadas;
- a API não persiste coordenadas exatas, apenas HMAC de auditoria;
- recusa de permissão, baixa precisão ou indisponibilidade bloqueia a operação;
- GPS pode ser falsificado em dispositivo comprometido e deve ser combinado
  com Play Integrity, detecção de mock location e análise de risco;
- termos e política de privacidade devem explicar finalidade, retenção e
  direitos do titular.

As áreas são administradas no repositório
[`meudinheiro_dashboard`](https://github.com/RapportTecnologia/meudinheiro_dashboard)
e aplicadas pelo backend regional.
