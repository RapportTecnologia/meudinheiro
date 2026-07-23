import { useWalletStore } from './useWalletStore';
import { signer } from '../../infrastructure/blockchain/polygon';
import { requireDeviceAuth } from '../../infrastructure/security/deviceAuth';
import { secureSecrets } from '../../infrastructure/storage/secureSecrets';

export function useAuthorizedSigner() {
  const { accounts, activeAccountId } = useWalletStore();
  return async (reason: string) => {
    const account = accounts.find((item) => item.id === activeAccountId);
    if (!account) throw new Error('Selecione uma conta.');
    await requireDeviceAuth(reason);
    const privateKey = await secureSecrets.get(account.secretRef);
    if (!privateKey) throw new Error('Chave não encontrada no armazenamento seguro.');
    return signer(privateKey);
  };
}
