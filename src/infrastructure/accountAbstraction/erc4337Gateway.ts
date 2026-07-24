import {
  Contract,
  Wallet,
  getAddress,
  getBytes,
  isAddress,
  isHexString,
} from 'ethers';
import {
  assertPreparedSponsoredTransfer,
} from '../../domain/accountAbstraction/sponsorshipPolicy';
import type {
  PreparedSponsoredTransfer,
  SmartAccountResolution,
  SponsoredOperationStatus,
  SponsoredTransferIntent,
} from '../../domain/accountAbstraction/types';
import type { Address } from '../../domain/wallet/types';
import { provider } from '../blockchain/polygon';

export const ENTRY_POINT_V07 = getAddress(
  process.env.EXPO_PUBLIC_ERC4337_ENTRY_POINT
  ?? '0x0000000071727De22E5E9d8BAf0edAc6f37da032'
) as Address;

const ENTRY_POINT_ABI = [
  'function getUserOpHash((address sender,uint256 nonce,bytes initCode,bytes callData,bytes32 accountGasLimits,uint256 preVerificationGas,bytes32 gasFees,bytes paymasterAndData,bytes signature) userOp) view returns (bytes32)',
] as const;

const REQUEST_TIMEOUT_MS = 15_000;
const RECEIPT_POLL_MS = 2_000;
const RECEIPT_MAX_ATTEMPTS = 45;

function getGatewayUrl() {
  const value = process.env.EXPO_PUBLIC_ERC4337_GATEWAY_URL?.trim();
  if (!value) {
    throw new Error('Gateway ERC-4337 não configurado.');
  }
  return value.replace(/\/+$/, '');
}

function getSimpleAccountFactory() {
  const value = process.env.EXPO_PUBLIC_ERC4337_SIMPLE_ACCOUNT_FACTORY?.trim();
  if (!value || !isAddress(value)) {
    throw new Error('Factory ERC-4337 auditada não configurada.');
  }
  return getAddress(value) as Address;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${getGatewayUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof body?.message === 'string'
        ? body.message
        : `Gateway ERC-4337 respondeu HTTP ${response.status}.`;
      throw new Error(message);
    }
    return body as T;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('O serviço de patrocínio demorou demais para responder.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function assertResolution(
  value: SmartAccountResolution,
  expectedOwner: Address,
  expectedFactory: Address,
) {
  if (
    value.chainId !== 137
    || value.entryPointVersion !== '0.7'
    || !isAddress(value.ownerAddress)
    || !isAddress(value.smartAccountAddress)
    || !isAddress(value.entryPoint)
    || !isAddress(value.factoryAddress)
  ) {
    throw new Error('Resposta inválida ao resolver a Smart Account.');
  }
  if (getAddress(value.ownerAddress) !== getAddress(expectedOwner)) {
    throw new Error('O gateway retornou uma Smart Account para outro proprietário.');
  }
  if (getAddress(value.entryPoint) !== getAddress(ENTRY_POINT_V07)) {
    throw new Error('A Smart Account usa um EntryPoint inesperado.');
  }
  if (getAddress(value.factoryAddress) !== getAddress(expectedFactory)) {
    throw new Error('O gateway retornou uma factory diferente da configurada.');
  }
}

function assertStatus(value: SponsoredOperationStatus, expectedHash: string) {
  if (
    !value
    || !['pending', 'included', 'reverted'].includes(value.status)
    || !isHexString(value.userOperationHash, 32)
    || value.userOperationHash.toLowerCase() !== expectedHash.toLowerCase()
  ) {
    throw new Error('Estado da UserOperation recebido do gateway é inválido.');
  }
}

async function delay(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export const erc4337Gateway = {
  async resolveSmartAccountAddress(ownerAddress: Address) {
    const expectedFactory = getSimpleAccountFactory();
    const resolution = await requestJson<SmartAccountResolution>(
      `/v1/erc4337/accounts/${getAddress(ownerAddress)}?chainId=137`,
    );
    assertResolution(resolution, ownerAddress, expectedFactory);
    return getAddress(resolution.smartAccountAddress) as Address;
  },

  async prepareSponsoredTransfer(intent: SponsoredTransferIntent) {
    const prepared = await requestJson<PreparedSponsoredTransfer>(
      '/v1/erc4337/operations/prepare-transfer',
      { method: 'POST', body: JSON.stringify(intent) },
    );
    assertPreparedSponsoredTransfer({
      intent,
      prepared,
      expectedEntryPoint: ENTRY_POINT_V07,
      expectedFactory: getSimpleAccountFactory(),
    });

    // O hash retornado pelo backend deve ser reproduzível pelo EntryPoint local.
    const entryPoint = new Contract(ENTRY_POINT_V07, ENTRY_POINT_ABI, provider);
    const onChainHash = String(
      await entryPoint.getFunction('getUserOpHash')(prepared.userOperation),
    );
    if (onChainHash.toLowerCase() !== prepared.userOperationHash.toLowerCase()) {
      throw new Error('O hash preparado não corresponde à UserOperation revisada.');
    }
    return prepared;
  },

  async submitPreparedTransfer(
    prepared: PreparedSponsoredTransfer,
    ownerSigner: Wallet,
  ) {
    const signature = await ownerSigner.signMessage(
      getBytes(prepared.userOperationHash),
    );
    const status = await requestJson<SponsoredOperationStatus>(
      `/v1/erc4337/operations/${encodeURIComponent(prepared.requestId)}/submit`,
      {
        method: 'POST',
        body: JSON.stringify({
          userOperationHash: prepared.userOperationHash,
          signature,
        }),
      },
    );
    assertStatus(status, prepared.userOperationHash);
    return status;
  },

  async waitForReceipt(
    initialStatus: SponsoredOperationStatus,
  ): Promise<SponsoredOperationStatus> {
    if (initialStatus.status !== 'pending') return initialStatus;
    for (let attempt = 0; attempt < RECEIPT_MAX_ATTEMPTS; attempt += 1) {
      await delay(RECEIPT_POLL_MS);
      const status = await requestJson<SponsoredOperationStatus>(
        `/v1/erc4337/operations/${initialStatus.userOperationHash}`,
      );
      assertStatus(status, initialStatus.userOperationHash);
      if (status.status !== 'pending') return status;
    }
    throw new Error(
      'A operação foi enviada, mas a confirmação ainda está pendente. Consulte o histórico.',
    );
  },
};
