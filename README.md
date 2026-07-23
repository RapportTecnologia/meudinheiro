<div align="center">
  <h1>Meu Dinheiro</h1>
  <p>Carteira Web3 na Polygon com interface principal de calculadora.</p>

  <a href="https://github.com/RapportTecnologia/meudinheiro/stargazers"><img alt="Estrelas" src="https://img.shields.io/github/stars/RapportTecnologia/meudinheiro?style=flat-square&color=f97316"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/network/members"><img alt="Forks" src="https://img.shields.io/github/forks/RapportTecnologia/meudinheiro?style=flat-square&color=f97316"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/issues"><img alt="Issues" src="https://img.shields.io/github/issues/RapportTecnologia/meudinheiro?style=flat-square&color=f97316"></a>
  <a href="https://github.com/RapportTecnologia/meudinheiro/commits/main"><img alt="Último commit" src="https://img.shields.io/github/last-commit/RapportTecnologia/meudinheiro?style=flat-square&color=f97316"></a>
  <img alt="Tamanho do repositório" src="https://img.shields.io/github/repo-size/RapportTecnologia/meudinheiro?style=flat-square&color=111827">
  <img alt="Linguagem principal" src="https://img.shields.io/github/languages/top/RapportTecnologia/meudinheiro?style=flat-square&color=111827">
  <img alt="Visitantes do README" src="https://api.visitorbadge.io/api/VisitorHit?user=RapportTecnologia&repo=meudinheiro-readme&label=VISITANTES&labelColor=%23111827&countColor=%23F97316">
  <br>
  <img alt="Status do projeto" src="https://img.shields.io/badge/status-em%20desenvolvimento-f97316?style=flat-square">
  <img alt="Rede Polygon" src="https://img.shields.io/badge/rede-Polygon-8247E5?style=flat-square&logo=polygon">
  <img alt="Expo" src="https://img.shields.io/badge/Expo-57-000020?style=flat-square&logo=expo">
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=flat-square&logo=react">
</div>

Base arquitetural de uma carteira autocustodial Polygon, com calculadora como
tela principal, Token Oficial ERC-20, cotação em BRL, pedidos EIP-681, agenda,
QR Code, clipboard, duas contas e POL reservado ao gás.

A agenda valida nomes e endereços únicos, permite edição protegida e oferece
salvar destinatários desconhecidos somente após uma transferência confirmada.

## Passo 0 — arquitetura e requisitos

- [Especificação de requisitos](docs/REQUIREMENTS.md)
- [Arquitetura e decisões técnicas](docs/ARCHITECTURE.md)
- [Histórias e casos de uso](docs/USE_CASES.md)
- [Modelo do Token Oficial, cotação e gás](docs/ECONOMIC_MODEL.md)
- [Agenda e compartilhamento de solicitações](docs/CONTACTS_AND_SHARING.md)

A base é intencionalmente **não pronta para fundos reais**: swap e envio
exigem revisão, configuração oficial, testes de integração e auditoria.

## Passo 1 — setup

Para criar do zero:

```bash
npx create-expo-app@latest meu-dinheiro --template blank-typescript
cd meu-dinheiro
npx expo install expo-camera expo-secure-store expo-local-authentication expo-clipboard expo-crypto react-native-svg react-native-safe-area-context react-native-screens
npm install ethers zustand @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack react-native-qrcode-svg react-native-get-random-values
npm install -D jest jest-expo @testing-library/react-native @types/jest
```

Nesta entrega, instale as versões declaradas:

```bash
npm install
cp .env.example .env
npm test
npm run typecheck
npx expo start
```

Biometria com comportamento nativo completo deve ser testada em development build:

```bash
npx expo prebuild
npx expo run:android
```

## Estrutura

```text
src/
  domain/          regras puras e tipos
  application/     estado e casos de uso
  infrastructure/ RPC, contratos, segredo e autenticação
  presentation/    componentes, navegação e telas
__tests__/         testes de domínio
docs/              arquitetura e requisitos
```

## Segurança

- Não coloque seed/private key em `.env`, AsyncStorage, Zustand ou commits.
- A chave é armazenada por referência no SecureStore.
- Não use a chave exportada em dispositivo compartilhado.
- RPC público é adequado para protótipo, não para SLA de produção.
- `swapEnabled` começa falso.

## Próximo incremento

Implemente o contrato oficial fixo, `QuoteProvider` e `GasPolicy`; remova POL
como ativo de pagamento. Use Amoy/fork antes da Polygon.
