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

export function addContact(contacts: Contact[], input: NewContact): Contact[] {
  const name = input.name.trim();
  if (!name) throw new Error('Informe um nome para o contato.');
  if (!isAddress(input.address)) throw new Error('Endereço EVM inválido.');

  const address = getAddress(input.address) as Address;
  if (contacts.some((contact) => contact.address.toLowerCase() === address.toLowerCase())) {
    throw new Error('Este endereço já está na agenda.');
  }

  return [...contacts, {
    id: input.id,
    name,
    address,
    favorite: false,
    useCount: 0,
    createdAt: input.now,
  }];
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
