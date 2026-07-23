import { createPaymentRequestUri, parsePaymentRequestUri, type PaymentAsset } from '../src/domain/payment/paymentRequest';

const recipient = '0x0000000000000000000000000000000000000001';
const token: PaymentAsset = {
  kind: 'erc20',
  address: '0x0000000000000000000000000000000000000002',
  symbol: 'BRLA',
  decimals: 18,
  referenceCurrency: 'BRL',
};

describe('pedido de pagamento EIP-681', () => {
  it('gera e interpreta um pedido em POL', () => {
    const uri = createPaymentRequestUri({
      recipient,
      amount: '0.25',
      asset: { kind: 'native', symbol: 'POL', decimals: 18 },
    });
    expect(parsePaymentRequestUri(uri)).toMatchObject({ recipient, amount: '0.25' });
  });

  it('gera e interpreta um pedido em token da Moeda Base', () => {
    const uri = createPaymentRequestUri({ recipient, amount: '10', asset: token });
    expect(parsePaymentRequestUri(uri, token)).toMatchObject({
      recipient,
      amount: '10.0',
      amountInSmallestUnit: '10000000000000000000',
    });
  });

  it('rejeita outra rede', () => {
    expect(() => parsePaymentRequestUri(`ethereum:${recipient}@1?value=1`)).toThrow('Polygon');
  });

  it('rejeita token que não é a Moeda Base', () => {
    const uri = `ethereum:0x0000000000000000000000000000000000000003@137/transfer?address=${recipient}&uint256=10`;
    expect(() => parsePaymentRequestUri(uri, token)).toThrow('diferente');
  });

  it('rejeita valor zero ao criar cobrança', () => {
    expect(() => createPaymentRequestUri({
      recipient,
      amount: '0',
      asset: { kind: 'native', symbol: 'POL', decimals: 18 },
    })).toThrow('maior que zero');
  });
});
