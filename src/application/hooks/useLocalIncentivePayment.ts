import { Wallet, keccak256, toUtf8Bytes } from 'ethers';
import {
  brlCentsToTokenUnits,
  quoteLocalIncentive,
  type LocalIncentiveCampaign,
} from '../../domain/incentives/localIncentive';
import { erc4337Gateway } from '../../infrastructure/accountAbstraction/erc4337Gateway';
import { erc20, provider } from '../../infrastructure/blockchain/polygon';
import { incentiveGateway } from '../../infrastructure/incentives/incentiveGateway';
import { geofencingGateway } from '../../infrastructure/geofencing/geofencingGateway';
import { requireDeviceAuth } from '../../infrastructure/security/deviceAuth';
import { secureSecrets } from '../../infrastructure/storage/secureSecrets';
import { useWalletStore } from './useWalletStore';

export function useLocalIncentivePayment() {
  const { accounts, activeAccountId, baseToken } = useWalletStore();

  return async (campaign: LocalIncentiveCampaign, grossCents: bigint) => {
    const account = accounts.find(({ id }) => id === activeAccountId);
    if (!account) throw new Error('Selecione uma conta.');
    if (!account.smartAccountAddress) {
      throw new Error('Ative a Smart Account de custo zero nas Configurações.');
    }
    if (!baseToken || baseToken.referenceCurrency !== 'BRL') {
      throw new Error('Configure o Token Oficial regional vinculado ao BRL.');
    }

    const quote = quoteLocalIncentive({ campaign, grossCents });
    if (!quote.eligible) {
      throw new Error(quote.reason ?? 'Esta compra não é elegível ao benefício.');
    }
    const grossUnits = brlCentsToTokenUnits(quote.grossCents, baseToken.decimals);
    const payableUnits = brlCentsToTokenUnits(
      quote.payableCents,
      baseToken.decimals,
    );
    const cashbackUnits = brlCentsToTokenUnits(
      quote.cashbackCents,
      baseToken.decimals,
    );
    const balance: bigint = await erc20(baseToken.address)
      .getFunction('balanceOf')(account.smartAccountAddress);
    if (balance < payableUnits) {
      throw new Error(`Saldo de ${baseToken.symbol} insuficiente.`);
    }

    const geofence = await geofencingGateway.authorize({
      operation: 'INCENTIVE_PAYMENT',
      walletAddress: account.smartAccountAddress,
    });

    await requireDeviceAuth(
      `Autorizar pagamento de ${quote.payableCents} centavos com benefício local`,
    );
    const privateKey = await secureSecrets.get(account.secretRef);
    if (!privateKey) throw new Error('Chave não encontrada no armazenamento seguro.');
    const ownerSigner = new Wallet(privateKey, provider);
    if (ownerSigner.address.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error('A chave local não controla a conta selecionada.');
    }

    const operationId = keccak256(toUtf8Bytes(
      `${account.smartAccountAddress}:${campaign.id}:${globalThis.crypto.randomUUID()}`,
    )) as `0x${string}`;
    const prepared = await incentiveGateway.prepareSponsoredPayment({
      chainId: 137,
      ownerAddress: account.address,
      smartAccountAddress: account.smartAccountAddress,
      tokenAddress: baseToken.address,
      recipient: campaign.merchant,
      amountInSmallestUnit: payableUnits.toString(),
      campaignId: campaign.id,
      operationId,
      grossAmountInSmallestUnit: grossUnits.toString(),
      payableAmountInSmallestUnit: payableUnits.toString(),
      cashbackAmountInSmallestUnit: cashbackUnits.toString(),
      geofenceDecisionId: geofence.decisionId,
    });
    const submitted = await erc4337Gateway.submitPreparedTransfer(
      prepared,
      ownerSigner,
    );
    return erc4337Gateway.waitForReceipt(submitted);
  };
}
