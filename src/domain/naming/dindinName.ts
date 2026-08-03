import { keccak256, toUtf8Bytes } from 'ethers';

export const DINDIN_SUFFIX = '.dindin' as const;
export const GLOBAL_NAMING_SCOPE = keccak256(toUtf8Bytes('MEU_DINHEIRO_GLOBAL'));

export function normalizeDindinLabel(raw: string): string {
  const label = raw.trim().toLowerCase().replace(/\.dindin$/, '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-');
  if (label.length < 3 || label.length > 32) throw new Error('O nome deve ter de 3 a 32 caracteres.');
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/.test(label)) {
    throw new Error('Use letras, números e hífen, sem hífen nas extremidades.');
  }
  return label;
}

export function formatDindinName(raw: string): `${string}.dindin` {
  return `${normalizeDindinLabel(raw)}${DINDIN_SUFFIX}`;
}

export function dindinLabelHash(raw: string): `0x${string}` {
  return keccak256(toUtf8Bytes(normalizeDindinLabel(raw))) as `0x${string}`;
}

export function isDindinName(raw: string): boolean {
  return raw.trim().toLowerCase().endsWith(DINDIN_SUFFIX);
}
