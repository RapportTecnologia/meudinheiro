import {
  formatBrl,
  parseBrlToCents,
  quoteRedemption,
  reserveCoverage,
} from '../src/domain/fiat/fiatOperations';

describe('operações fiduciárias', () => {
  it('mantém a paridade bruta de centavos para tokens', () => {
    expect(parseBrlToCents('100')).toBe(10_000n);
    expect(parseBrlToCents('10,50')).toBe(1_050n);
    expect(formatBrl(10_000n)).toBe('R$ 100,00');
  });

  it('calcula 0,5% e 1% sobre o resgate', () => {
    expect(quoteRedemption(10_000n, 50)).toMatchObject({
      feeCents: 50n,
      netPixCents: 9_950n,
    });
    expect(quoteRedemption(10_000n, 100)).toMatchObject({
      feeCents: 100n,
      netPixCents: 9_900n,
    });
  });

  it('arredonda a taxa para cima no menor centavo', () => {
    expect(quoteRedemption(101n, 50).feeCents).toBe(1n);
  });

  it('rejeita taxa superior a 1%', () => {
    expect(() => quoteRedemption(10_000n, 101)).toThrow('entre 0% e 1%');
  });

  it('exige reserva para circulação e resgates ainda não pagos', () => {
    expect(reserveCoverage({
      reserveBrlCents: 12_000n,
      circulatingTokenCents: 10_000n,
      lockedUnpaidRedemptionCents: 2_000n,
    }).isCovered).toBe(true);
    expect(reserveCoverage({
      reserveBrlCents: 11_999n,
      circulatingTokenCents: 10_000n,
      lockedUnpaidRedemptionCents: 2_000n,
    }).isCovered).toBe(false);
  });
});
