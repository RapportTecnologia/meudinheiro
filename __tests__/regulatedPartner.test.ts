import {
  assertFiatOperationPartners,
  validateRegulatoryDisclosure,
  type RegulatoryDisclosure,
} from '../src/domain/compliance/regulatedPartner';

const disclosure: RegulatoryDisclosure = {
  policyVersion: '2026-07',
  effectiveAt: '2026-07-01T00:00:00.000Z',
  expiresAt: '2026-12-31T23:59:59.000Z',
  termsUrl: 'https://example.com/termos',
  privacyUrl: 'https://example.com/privacidade',
  partners: [
    {
      id: 'instituicao-regulada',
      legalName: 'Instituição Parceira S.A.',
      cnpj: '12.345.678/0001-90',
      kind: 'payment_institution',
      roles: ['PIX', 'RESERVE_CUSTODY', 'KYC_AML'],
      authorization: {
        authority: 'BCB',
        reference: 'Autorização BCB verificável',
        status: 'active',
        verifiedAt: '2026-07-20T00:00:00.000Z',
      },
      websiteUrl: 'https://example.com',
    },
  ],
};

describe('parceiros regulados', () => {
  it('aceita parceiro BCB ativo para o fluxo fiduciário', () => {
    expect(() => assertFiatOperationPartners(
      disclosure,
      new Date('2026-07-25T12:00:00.000Z'),
    )).not.toThrow();
  });

  it('rejeita operador comunitário autodeclarado para Pix e reserva', () => {
    const invalid: RegulatoryDisclosure = {
      ...disclosure,
      partners: [{
        ...disclosure.partners[0]!,
        kind: 'community_program_operator',
        authorization: {
          authority: 'MUNICIPAL',
          reference: 'Lei local',
          status: 'active',
        },
      }],
    };
    expect(() => validateRegulatoryDisclosure(
      invalid,
      new Date('2026-07-25T12:00:00.000Z'),
    )).toThrow('autorizada pelo BCB');
  });

  it('rejeita política expirada', () => {
    expect(() => validateRegulatoryDisclosure(
      disclosure,
      new Date('2027-01-01T00:00:00.000Z'),
    )).toThrow('expirada');
  });

  it('rejeita ausência de custódia da reserva', () => {
    const missing: RegulatoryDisclosure = {
      ...disclosure,
      partners: [{
        ...disclosure.partners[0]!,
        roles: ['PIX', 'KYC_AML'],
      }],
    };
    expect(() => assertFiatOperationPartners(
      missing,
      new Date('2026-07-25T12:00:00.000Z'),
    )).toThrow('RESERVE_CUSTODY');
  });
});
