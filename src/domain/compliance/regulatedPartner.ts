export type PartnerKind =
  | 'bank'
  | 'financial_institution'
  | 'payment_institution'
  | 'virtual_asset_service_provider'
  | 'community_program_operator';

export type PartnerRole =
  | 'PIX'
  | 'PAYMENT_ACCOUNT'
  | 'RESERVE_CUSTODY'
  | 'KYC_AML'
  | 'VIRTUAL_ASSET_SERVICE'
  | 'COMMUNITY_GOVERNANCE';

export type RegulatoryAuthorization = {
  authority: 'BCB' | 'MTE' | 'MUNICIPAL';
  reference: string;
  status: 'active' | 'pending' | 'not_applicable';
  verifiedAt?: string;
};

export type RegulatedPartner = {
  id: string;
  legalName: string;
  cnpj: string;
  kind: PartnerKind;
  roles: PartnerRole[];
  authorization: RegulatoryAuthorization;
  websiteUrl: string;
};

export type RegulatoryDisclosure = {
  policyVersion: string;
  effectiveAt: string;
  expiresAt: string;
  termsUrl: string;
  privacyUrl: string;
  partners: RegulatedPartner[];
};

const BCB_REQUIRED_ROLES = new Set<PartnerRole>([
  'PIX',
  'PAYMENT_ACCOUNT',
  'RESERVE_CUSTODY',
  'KYC_AML',
  'VIRTUAL_ASSET_SERVICE',
]);

const BCB_REGULATED_KINDS = new Set<PartnerKind>([
  'bank',
  'financial_institution',
  'payment_institution',
  'virtual_asset_service_provider',
]);

function validDate(value: string): number {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) throw new Error('Data regulatória inválida.');
  return timestamp;
}

function validHttpsUrl(value: string, field: string): void {
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:') {
    throw new Error(`${field} deve usar HTTPS.`);
  }
}

export function normalizeCnpj(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!/^\d{14}$/.test(digits)) throw new Error('CNPJ do parceiro inválido.');
  return digits;
}

export function validateRegulatoryDisclosure(
  disclosure: RegulatoryDisclosure,
  now = new Date(),
): void {
  if (!disclosure.policyVersion.trim()) {
    throw new Error('Versão da política regulatória ausente.');
  }
  const effectiveAt = validDate(disclosure.effectiveAt);
  const expiresAt = validDate(disclosure.expiresAt);
  if (effectiveAt > now.getTime() || expiresAt <= now.getTime()) {
    throw new Error('Declaração regulatória ainda não vigente ou expirada.');
  }
  validHttpsUrl(disclosure.termsUrl, 'Termos');
  validHttpsUrl(disclosure.privacyUrl, 'Política de privacidade');
  if (!Array.isArray(disclosure.partners) || disclosure.partners.length === 0) {
    throw new Error('Nenhum parceiro operacional informado.');
  }

  const ids = new Set<string>();
  for (const partner of disclosure.partners) {
    if (!partner.id.trim() || ids.has(partner.id)) {
      throw new Error('Identificador de parceiro ausente ou repetido.');
    }
    ids.add(partner.id);
    if (!partner.legalName.trim()) throw new Error('Razão social do parceiro ausente.');
    normalizeCnpj(partner.cnpj);
    validHttpsUrl(partner.websiteUrl, 'Site do parceiro');
    if (!Array.isArray(partner.roles) || partner.roles.length === 0) {
      throw new Error('Parceiro sem responsabilidade definida.');
    }
    for (const role of partner.roles) {
      if (
        BCB_REQUIRED_ROLES.has(role)
        && (
          !BCB_REGULATED_KINDS.has(partner.kind)
          || partner.authorization.authority !== 'BCB'
          || partner.authorization.status !== 'active'
          || !partner.authorization.reference.trim()
        )
      ) {
        throw new Error(
          `O papel ${role} exige instituição identificada como autorizada pelo BCB.`,
        );
      }
    }
  }
}

export function assertRequiredPartnerRoles(
  disclosure: RegulatoryDisclosure,
  requiredRoles: PartnerRole[],
  now = new Date(),
): void {
  validateRegulatoryDisclosure(disclosure, now);
  const activeRoles = new Set(
    disclosure.partners.flatMap(({ roles }) => roles),
  );
  const missing = requiredRoles.filter((role) => !activeRoles.has(role));
  if (missing.length > 0) {
    throw new Error(`Parceria regulada ausente para: ${missing.join(', ')}.`);
  }
}

export function assertFiatOperationPartners(
  disclosure: RegulatoryDisclosure,
  now = new Date(),
): void {
  assertRequiredPartnerRoles(
    disclosure,
    ['PIX', 'RESERVE_CUSTODY', 'KYC_AML'],
    now,
  );
}

