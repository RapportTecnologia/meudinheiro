import {
  brlCentsToTokenUnits,
  formatBrlCents,
  parseBrlCents,
  quoteLocalIncentive,
  type LocalIncentiveCampaign,
} from '../src/domain/incentives/localIncentive';

const campaign: LocalIncentiveCampaign = {
  id: `0x${'11'.repeat(32)}`,
  name: 'Compre no bairro',
  description: 'Benefício para compras locais',
  merchant: '0x0000000000000000000000000000000000000001',
  sponsor: '0x0000000000000000000000000000000000000002',
  discountBps: 1_000,
  cashbackBps: 500,
  minPurchaseCents: '1000',
  maxCashbackPerPurchaseCents: '200',
  maxCashbackPerCustomerCents: '500',
  remainingBudgetCents: '10000',
  startsAt: '2026-01-01T00:00:00.000Z',
  endsAt: '2026-12-31T23:59:59.000Z',
  active: true,
};

describe('incentivo local', () => {
  it('calcula desconto e cashback sem alterar o valor bruto', () => {
    expect(quoteLocalIncentive({
      campaign,
      grossCents: 10_000n,
      now: new Date('2026-07-25T12:00:00.000Z'),
    })).toMatchObject({
      discountCents: 1_000n,
      payableCents: 9_000n,
      cashbackCents: 200n,
      eligible: true,
    });
  });

  it('respeita o limite acumulado por cliente', () => {
    expect(quoteLocalIncentive({
      campaign,
      grossCents: 10_000n,
      customerCashbackEarnedCents: 450n,
      now: new Date('2026-07-25T12:00:00.000Z'),
    }).cashbackCents).toBe(50n);
  });

  it('bloqueia campanha fora do período', () => {
    expect(quoteLocalIncentive({
      campaign,
      grossCents: 10_000n,
      now: new Date('2027-01-01T00:00:00.000Z'),
    }).eligible).toBe(false);
  });

  it('não promete cashback sem orçamento suficiente', () => {
    expect(quoteLocalIncentive({
      campaign: { ...campaign, remainingBudgetCents: '100' },
      grossCents: 10_000n,
      now: new Date('2026-07-25T12:00:00.000Z'),
    })).toMatchObject({
      eligible: false,
      cashbackCents: 0n,
    });
  });

  it('converte e formata centavos sem ponto flutuante', () => {
    expect(parseBrlCents('10,50')).toBe(1_050n);
    expect(formatBrlCents(1_050n)).toBe('R$ 10,50');
    expect(brlCentsToTokenUnits(1_050n, 18)).toBe(10_500_000_000_000_000_000n);
  });
});
