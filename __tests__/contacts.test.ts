import {
  addContact,
  markContactUsed,
  rankContacts,
  type Contact,
} from '../src/domain/contacts/contact';

const addressA = '0x0000000000000000000000000000000000000001';
const addressB = '0x0000000000000000000000000000000000000002';

describe('agenda de destinatários', () => {
  it('normaliza e adiciona um contato sem segredos', () => {
    const contacts = addContact([], {
      id: 'ana',
      name: '  Ana  ',
      address: addressA,
      now: '2026-07-23T10:00:00.000Z',
    });

    expect(contacts[0]).toEqual({
      id: 'ana',
      name: 'Ana',
      address: addressA,
      favorite: false,
      useCount: 0,
      createdAt: '2026-07-23T10:00:00.000Z',
    });
  });

  it('rejeita endereço já cadastrado', () => {
    const contacts = addContact([], {
      id: 'ana',
      name: 'Ana',
      address: addressA,
      now: '2026-07-23T10:00:00.000Z',
    });

    expect(() => addContact(contacts, {
      id: 'duplicado',
      name: 'Outro nome',
      address: addressA,
      now: '2026-07-23T11:00:00.000Z',
    })).toThrow('já está na agenda');
  });

  it('prioriza favoritos, frequência e recência', () => {
    const contacts: Contact[] = [
      {
        id: 'a', name: 'Ana', address: addressA, favorite: false, useCount: 7,
        createdAt: '2026-07-20T10:00:00.000Z', lastUsedAt: '2026-07-23T08:00:00.000Z',
      },
      {
        id: 'b', name: 'Bia', address: addressB, favorite: true, useCount: 1,
        createdAt: '2026-07-20T10:00:00.000Z', lastUsedAt: '2026-07-21T08:00:00.000Z',
      },
    ];

    expect(rankContacts(contacts).map(({ id }) => id)).toEqual(['b', 'a']);
  });

  it('registra uso sem alterar os demais contatos', () => {
    const contacts = addContact([], {
      id: 'ana',
      name: 'Ana',
      address: addressA,
      now: '2026-07-23T10:00:00.000Z',
    });
    const next = markContactUsed(contacts, 'ana', '2026-07-23T12:00:00.000Z');

    expect(next[0]).toMatchObject({
      useCount: 1,
      lastUsedAt: '2026-07-23T12:00:00.000Z',
    });
  });
});
