import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type {
  OfflineMintInfo,
  OfflineNote,
  OfflinePaymentEnvelope,
} from '../../domain/offline/offlinePayment';

const INDEX_KEY = 'meu-dinheiro.offline.index.v1';
const MINT_INFO_KEY = 'meu-dinheiro.offline.mint-info.v1';
const CHUNK_SIZE = 1_500;
const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

type NoteStatus = 'available' | 'transferred_pending';
type IncomingStatus = 'received_pending' | 'settlement_pending' | 'rejected';
type SecretIndex = {
  ref: string;
  chunks: number;
  amountSmallest: string;
  expiresAt: string;
  status: NoteStatus | IncomingStatus;
};
type VaultIndex = {
  notes: SecretIndex[];
  incoming: SecretIndex[];
};

async function readIndex(): Promise<VaultIndex> {
  const value = await AsyncStorage.getItem(INDEX_KEY);
  if (!value) return { notes: [], incoming: [] };
  try {
    const parsed = JSON.parse(value) as VaultIndex;
    return {
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      incoming: Array.isArray(parsed.incoming) ? parsed.incoming : [],
    };
  } catch {
    throw new Error('Índice off-line local corrompido.');
  }
}

async function writeIndex(index: VaultIndex) {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

async function putSecret(ref: string, value: unknown): Promise<number> {
  const serialized = JSON.stringify(value);
  const chunks = Math.ceil(serialized.length / CHUNK_SIZE);
  for (let index = 0; index < chunks; index += 1) {
    await SecureStore.setItemAsync(
      `${ref}.${index}`,
      serialized.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
      options,
    );
  }
  return chunks;
}

async function getSecret<T>(entry: SecretIndex): Promise<T> {
  const chunks: string[] = [];
  for (let index = 0; index < entry.chunks; index += 1) {
    const value = await SecureStore.getItemAsync(`${entry.ref}.${index}`, options);
    if (value === null) throw new Error('Valor off-line protegido não encontrado.');
    chunks.push(value);
  }
  return JSON.parse(chunks.join('')) as T;
}

function total(notes: OfflineNote[]) {
  return notes.reduce((sum, note) => sum + BigInt(note.amountSmallest), 0n);
}

export const offlineVault = {
  async cacheMintInfo(info: OfflineMintInfo) {
    await AsyncStorage.setItem(MINT_INFO_KEY, JSON.stringify({
      ...info,
      fetchedAt: new Date().toISOString(),
    }));
  },

  async getMintInfo(): Promise<OfflineMintInfo | undefined> {
    const value = await AsyncStorage.getItem(MINT_INFO_KEY);
    return value ? JSON.parse(value) as OfflineMintInfo : undefined;
  },

  async addNotes(notes: OfflineNote[]) {
    const index = await readIndex();
    for (const note of notes) {
      const ref = `meudinheiro.offline.note.${crypto.randomUUID()}`;
      index.notes.push({
        ref,
        chunks: await putSecret(ref, note),
        amountSmallest: note.amountSmallest,
        expiresAt: note.expiresAt,
        status: 'available',
      });
    }
    await writeIndex(index);
  },

  async availableNotes(): Promise<Array<{ entry: SecretIndex; note: OfflineNote }>> {
    const index = await readIndex();
    const current = Date.now();
    const entries = index.notes.filter((entry) => (
      entry.status === 'available' && new Date(entry.expiresAt).getTime() > current
    ));
    return Promise.all(entries.map(async (entry) => ({
      entry,
      note: await getSecret<OfflineNote>(entry),
    })));
  },

  async selectExact(amountSmallest: bigint) {
    const available = await this.availableNotes();
    const direct = available.find(({ note }) => BigInt(note.amountSmallest) === amountSmallest);
    if (direct) return [direct];
    const selected: typeof available = [];
    let accumulated = 0n;
    for (const item of [...available].sort(
      (a, b) => Number(BigInt(b.note.amountSmallest) - BigInt(a.note.amountSmallest)),
    )) {
      if (accumulated + BigInt(item.note.amountSmallest) <= amountSmallest) {
        selected.push(item);
        accumulated += BigInt(item.note.amountSmallest);
      }
    }
    if (accumulated !== amountSmallest) {
      throw new Error('Não há combinação exata de notas. Conecte-se para carregar o valor exato.');
    }
    return selected;
  },

  async markTransferred(refs: string[]) {
    const index = await readIndex();
    const selected = new Set(refs);
    index.notes = index.notes.map((entry) => (
      selected.has(entry.ref) ? { ...entry, status: 'transferred_pending' } : entry
    ));
    await writeIndex(index);
  },

  async saveIncoming(envelope: OfflinePaymentEnvelope) {
    const index = await readIndex();
    const ref = `meudinheiro.offline.incoming.${envelope.paymentId}`;
    if (index.incoming.some((entry) => entry.ref === ref)) {
      throw new Error('Este pacote já foi importado.');
    }
    index.incoming.push({
      ref,
      chunks: await putSecret(ref, envelope),
      amountSmallest: total(envelope.notes).toString(),
      expiresAt: envelope.expiresAt,
      status: 'received_pending',
    });
    await writeIndex(index);
  },

  async pendingIncoming() {
    const index = await readIndex();
    const pending = index.incoming.filter((entry) => entry.status === 'received_pending');
    return Promise.all(pending.map(async (entry) => ({
      entry,
      envelope: await getSecret<OfflinePaymentEnvelope>(entry),
    })));
  },

  async markIncoming(ref: string, status: IncomingStatus) {
    const index = await readIndex();
    index.incoming = index.incoming.map((entry) => (
      entry.ref === ref ? { ...entry, status } : entry
    ));
    await writeIndex(index);
  },

  async summary() {
    const index = await readIndex();
    const available = index.notes
      .filter((entry) => entry.status === 'available')
      .reduce((sum, entry) => sum + BigInt(entry.amountSmallest), 0n);
    return {
      available,
      sentPending: index.notes.filter((entry) => entry.status === 'transferred_pending').length,
      receivedPending: index.incoming.filter((entry) => entry.status === 'received_pending').length,
      settlementPending: index.incoming.filter((entry) => entry.status === 'settlement_pending').length,
    };
  },
};
