import {
  addContact,
  markContactUsed,
  rankContacts,
  updateContact,
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

  it('rejeita nome já cadastrado ignorando espaços e maiúsculas', () => {
    const contacts = addContact([], {
      id: 'ana',
      name: 'Ana Maria',
      address: addressA,
      now: '2026-07-23T10:00:00.000Z',
    });

    expect(() => addContact(contacts, {
      id: 'outra-ana',
      name: '  ANA   MARIA ',
      address: addressB,
      now: '2026-07-23T11:00:00.000Z',
    })).toThrow('Use outro nome ou edite o contato existente');
  });

  it('edita nome e endereço preservando métricas do contato', () => {
    const contacts: Contact[] = [{
      id: 'ana',
      name: 'Ana',
      address: addressA,
      favorite: true,
      useCount: 4,
      createdAt: '2026-07-20T10:00:00.000Z',
      lastUsedAt: '2026-07-23T08:00:00.000Z',
    }];

    expect(updateContact(contacts, {
      id: 'ana',
      name: 'Ana Comercial',
      address: addressB,
    })[0]).toEqual({
      ...contacts[0],
      name: 'Ana Comercial',
      address: addressB,
    });
  });

  it('não permite editar um contato usando nome ou endereço de outro', () => {
    const contacts = [
      ...addContact([], {
        id: 'ana',
        name: 'Ana',
        address: addressA,
        now: '2026-07-23T10:00:00.000Z',
      }),
      ...addContact([], {
        id: 'bia',
        name: 'Bia',
        address: addressB,
        now: '2026-07-23T10:00:00.000Z',
      }),
    ];

    expect(() => updateContact(contacts, {
      id: 'bia',
      name: 'Ana',
      address: addressB,
    })).toThrow('Use outro nome ou edite o contato existente');

    expect(() => updateContact(contacts, {
      id: 'bia',
      name: 'Bia',
      address: addressA,
    })).toThrow('edite o contato existente');
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
