<div align="center">
  <img src="site/assets/images/logo-meu-dinheiro.webp" width="150" alt="Símbolo do Meu Dinheiro">
  <h1>Meu Dinheiro</h1>
  <p><strong>Fortalece minha região</strong></p>
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
  <a href="https://github.com/RapportTecnologia/meudinheiro/actions/workflows/jekyll-gh-pages.yml"><img alt="Site Jekyll" src="https://img.shields.io/github/actions/workflow/status/RapportTecnologia/meudinheiro/jekyll-gh-pages.yml?branch=main&style=flat-square&label=pages"></a>
</div>

Base arquitetural de uma carteira autocustodial Polygon, com calculadora como
tela principal, Token Oficial ERC-20, cotação em BRL, pedidos EIP-681, agenda,
QR Code, clipboard, duas contas e custo de gás zero para o usuário final por
Account Abstraction ERC-4337. A plataforma patrocina o gás com Paymaster.

A agenda valida nomes e endereços únicos, permite edição protegida e oferece
salvar destinatários desconhecidos somente após uma transferência confirmada.

## Passo 0 — arquitetura e requisitos

- [Especificação de requisitos](docs/REQUIREMENTS.md)
- [Arquitetura e decisões técnicas](docs/ARCHITECTURE.md)
- [Histórias e casos de uso](docs/USE_CASES.md)
- [Modelo do Token Oficial, cotação e gás](docs/ECONOMIC_MODEL.md)
- [Account Abstraction, Smart Account e Paymaster](docs/ACCOUNT_ABSTRACTION.md)
- [Agenda e compartilhamento de solicitações](docs/CONTACTS_AND_SHARING.md)
- [Site Jekyll e pipeline de publicação](docs/SITE.md)
- [Identidade de marca](docs/BRAND.md)

Site público: [rapporttecnologia.github.io/meudinheiro](https://rapporttecnologia.github.io/meudinheiro/)

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
- A chave da EOA proprietária nunca é enviada ao Gateway ERC-4337.
- Credenciais de Bundler/Paymaster e chave de patrocínio nunca entram no APK.
- O app recusa fallback silencioso para transação EOA paga pelo usuário.
- `swapEnabled` começa falso.

## Estado da integração ERC-4337

O cliente móvel, as validações locais e o contrato HTTP do Gateway estão
implementados. Para operação real ainda é necessário implantar e auditar a
factory da Smart Account e o Paymaster, implementar o Gateway, configurar
Bundler/KMS, financiar o depósito do Paymaster e testar em Amoy/fork antes da
Polygon.
