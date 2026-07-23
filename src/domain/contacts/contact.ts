import { getAddress, isAddress } from 'ethers';
import type { Address } from '../wallet/types';

export type Contact = {
  id: string;
  name: string;
  address: Address;
  favorite: boolean;
  useCount: number;
  createdAt: string;
  lastUsedAt?: string;
};

type NewContact = {
  id: string;
  name: string;
  address: string;
  now: string;
};

type ContactDraft = {
  name: string;
  address: string;
};

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').normalize('NFKC');
}

export function validateContactDraft(
  contacts: Contact[],
  input: ContactDraft,
  exceptId?: string,
): Pick<Contact, 'name' | 'address'> {
  const name = normalizeName(input.name);
  if (!name) throw new Error('Informe um nome para o contato.');
  if (!isAddress(input.address)) throw new Error('Endereço EVM inválido.');

  const address = getAddress(input.address) as Address;
  const comparableName = name.toLocaleLowerCase('pt-BR');
  const nameConflict = contacts.find((contact) =>
    contact.id !== exceptId
    && normalizeName(contact.name).toLocaleLowerCase('pt-BR') === comparableName);
  if (nameConflict) {
    throw new Error(`O nome "${name}" já está na agenda. Use outro nome ou edite o contato existente.`);
  }

  const addressConflict = contacts.find((contact) =>
    contact.id !== exceptId
    && contact.address.toLowerCase() === address.toLowerCase());
  if (addressConflict) {
    throw new Error(
      `Este endereço já está na agenda como "${addressConflict.name}"; edite o contato existente.`,
    );
  }

  return { name, address };
}

export function addContact(contacts: Contact[], input: NewContact): Contact[] {
  const { name, address } = validateContactDraft(contacts, input);
  return [...contacts, {
    id: input.id,
    name,
    address,
    favorite: false,
    useCount: 0,
    createdAt: input.now,
  }];
}

export function updateContact(
  contacts: Contact[],
  input: { id: string; name: string; address: string },
): Contact[] {
  if (!contacts.some((contact) => contact.id === input.id)) {
    throw new Error('Contato não encontrado.');
  }

  const { name, address } = validateContactDraft(contacts, input, input.id);
  return contacts.map((contact) => contact.id === input.id
    ? { ...contact, name, address }
    : contact);
}

export function removeContact(contacts: Contact[], id: string): Contact[] {
  return contacts.filter((contact) => contact.id !== id);
}

export function toggleContactFavorite(contacts: Contact[], id: string): Contact[] {
  return contacts.map((contact) => contact.id === id
    ? { ...contact, favorite: !contact.favorite }
    : contact);
}

export function markContactUsed(contacts: Contact[], id: string, now: string): Contact[] {
  return contacts.map((contact) => contact.id === id
    ? { ...contact, useCount: contact.useCount + 1, lastUsedAt: now }
    : contact);
}

export function markContactAddressUsed(
  contacts: Contact[],
  address: string,
  now: string,
): Contact[] {
  return contacts.map((contact) => contact.address.toLowerCase() === address.toLowerCase()
    ? { ...contact, useCount: contact.useCount + 1, lastUsedAt: now }
    : contact);
}

export function rankContacts(contacts: Contact[]): Contact[] {
  return [...contacts].sort((left, right) => {
    if (left.favorite !== right.favorite) return left.favorite ? -1 : 1;
    if (left.useCount !== right.useCount) return right.useCount - left.useCount;

    const recency = (right.lastUsedAt ?? '').localeCompare(left.lastUsedAt ?? '');
    return recency || left.name.localeCompare(right.name, 'pt-BR');
  });
}
