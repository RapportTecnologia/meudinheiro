import type { Address } from '../wallet/types';

export type RegionalMonetaryPolicy = {
  tokenAddress: Address;
  referenceCurrency: string;
  fiatDecimals: number;
  mode: 'fiat_pegged' | 'independent';
  manager: Address;
  activeAssessmentId?: string;
  pricingSigner?: Address;
  changedAt: string;
};
