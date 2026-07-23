# Meu Dinheiro

Base arquitetural de uma carteira autocustodial Polygon, com calculadora como tela principal, QR Code, duas contas, Moeda Base imutável até remoção e adaptador de swap.

## Passo 0 — arquitetura e requisitos

Leia `docs/ARCHITECTURE.md`. A base é intencionalmente **não pronta para fundos reais**: swap e envio exigem revisão, configuração oficial e auditoria.

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

Implemente `SendReviewScreen`, `QuoteProvider` e uma configuração de contratos verificada. Use Amoy/fork antes da Polygon.
