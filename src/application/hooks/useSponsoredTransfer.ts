import { Wallet } from 'ethers';
import type { PaymentRequest } from '../../domain/payment/paymentRequest';
import { erc4337Gateway } from '../../infrastructure/accountAbstraction/erc4337Gateway';
import { erc20, provider } from '../../infrastructure/blockchain/polygon';
import { requireDeviceAuth } from '../../infrastructure/security/deviceAuth';
import { secureSecrets } from '../../infrastructure/storage/secureSecrets';
import { useWalletStore } from './useWalletStore';

export function useSponsoredTransfer() {
  const { accounts, activeAccountId } = useWalletStore();

  return async (payment: PaymentRequest) => {
    if (payment.asset.kind !== 'erc20') {
      throw new Error('Somente o Token Oficial pode usar o pagamento patrocinado.');
    }
    const account = accounts.find((item) => item.id === activeAccountId);
    if (!account) throw new Error('Selecione uma conta.');
    if (!account.smartAccountAddress) {
      throw new Error('Ative a Smart Account de custo zero nas Configurações.');
    }
    if (
      account.smartAccountAddress.toLowerCase()
      === payment.recipient.toLowerCase()
    ) {
      throw new Error('A conta de origem e o destinatário são iguais.');
    }

    const amount = BigInt(payment.amountInSmallestUnit);
    const token = erc20(payment.asset.address);
    const balance: bigint = await token.getFunction('balanceOf')(
      account.smartAccountAddress,
    );
    if (balance < amount) {
      throw new Error(`Saldo de ${payment.asset.symbol} insuficiente.`);
    }

    await requireDeviceAuth(
      `Autorizar pagamento de ${payment.amount} ${payment.asset.symbol} com gás patrocinado`,
    );
    const privateKey = await secureSecrets.get(account.secretRef);
    if (!privateKey) throw new Error('Chave não encontrada no armazenamento seguro.');
    const ownerSigner = new Wallet(privateKey, provider);
    if (
      ownerSigner.address.toLowerCase()
      !== account.address.toLowerCase()
    ) {
      throw new Error('A chave local não controla a conta selecionada.');
    }

    const prepared = await erc4337Gateway.prepareSponsoredTransfer({
      chainId: 137,
      ownerAddress: account.address,
      smartAccountAddress: account.smartAccountAddress,
      tokenAddress: payment.asset.address,
      recipient: payment.recipient,
      amountInSmallestUnit: payment.amountInSmallestUnit,
    });
    const submitted = await erc4337Gateway.submitPreparedTransfer(
      prepared,
      ownerSigner,
    );
    return erc4337Gateway.waitForReceipt(submitted);
  };
}
