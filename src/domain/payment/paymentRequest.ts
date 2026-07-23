import { formatUnits, getAddress, isAddress, parseUnits } from 'ethers';
import type { Address } from '../wallet/types';

export type PaymentAsset =
  | { kind: 'native'; symbol: 'POL'; decimals: 18 }
  | { kind: 'erc20'; address: Address; symbol: string; decimals: number; referenceCurrency?: 'BRL' };

export type PaymentRequest = {
  chainId: 137;
  recipient: Address;
  asset: PaymentAsset;
  amount: string;
  amountInSmallestUnit: string;
};

export function createPaymentRequestUri(input: {
  recipient: string;
  amount: string;
  asset: PaymentAsset;
}): string {
  const recipient = getAddress(input.recipient);
  const amountInSmallestUnit = parseUnits(input.amount.replace(',', '.'), input.asset.decimals);
  if (amountInSmallestUnit <= 0n) throw new Error('O valor solicitado deve ser maior que zero.');

  if (input.asset.kind === 'native') {
    return `ethereum:${recipient}@137?value=${amountInSmallestUnit}`;
  }

  return `ethereum:${input.asset.address}@137/transfer?address=${recipient}&uint256=${amountInSmallestUnit}`;
}

export function parsePaymentRequestUri(raw: string, knownErc20?: PaymentAsset): PaymentRequest | undefined {
  if (raw.startsWith('0x') && isAddress(raw)) {
    return {
      chainId: 137,
      recipient: getAddress(raw) as Address,
      asset: { kind: 'native', symbol: 'POL', decimals: 18 },
      amount: '0',
      amountInSmallestUnit: '0',
    };
  }
  if (!raw.startsWith('ethereum:')) throw new Error('QR Code não contém uma solicitação EVM.');

  const body = raw.slice('ethereum:'.length);
  const [targetAndPath = '', query = ''] = body.split('?');
  const [targetWithChain = '', operation] = targetAndPath.split('/');
  const [target = '', chainText] = targetWithChain.split('@');
  if (!isAddress(target)) throw new Error('Endereço EVM inválido.');
  if (chainText !== '137') throw new Error('A solicitação não pertence à Polygon.');
  const params = new URLSearchParams(query);

  if (!operation) {
    const value = params.get('value') ?? '0';
    if (!/^\d+$/.test(value)) throw new Error('Valor POL inválido.');
    return {
      chainId: 137,
      recipient: getAddress(target) as Address,
      asset: { kind: 'native', symbol: 'POL', decimals: 18 },
      amount: formatUnits(BigInt(value), 18),
      amountInSmallestUnit: value,
    };
  }

  if (operation !== 'transfer') throw new Error('Operação EIP-681 não suportada.');
  const recipient = params.get('address');
  const units = params.get('uint256');
  if (!recipient || !isAddress(recipient) || !units || !/^\d+$/.test(units)) {
    throw new Error('Solicitação ERC-20 incompleta.');
  }
  if (!knownErc20 || knownErc20.kind !== 'erc20') {
    throw new Error('O token do QR Code não está configurado como Moeda Base.');
  }
  if (getAddress(target) !== getAddress(knownErc20.address)) {
    throw new Error('O QR Code solicita um token diferente da Moeda Base.');
  }

  return {
    chainId: 137,
    recipient: getAddress(recipient) as Address,
    asset: knownErc20,
    amount: formatUnits(BigInt(units), knownErc20.decimals),
    amountInSmallestUnit: units,
  };
}
