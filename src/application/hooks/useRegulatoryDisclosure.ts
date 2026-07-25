import { useCallback, useEffect, useState } from 'react';
import type { RegulatoryDisclosure } from '../../domain/compliance/regulatedPartner';
import { complianceGateway } from '../../infrastructure/compliance/complianceGateway';
import { useWalletStore } from './useWalletStore';

export function useRegulatoryDisclosure() {
  const baseToken = useWalletStore(({ baseToken: value }) => value);
  const [disclosure, setDisclosure] = useState<RegulatoryDisclosure>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setDisclosure(await complianceGateway.getDisclosure(baseToken?.address));
    } catch (cause) {
      setDisclosure(undefined);
      setError((cause as Error).message);
    } finally {
      setLoading(false);
    }
  }, [baseToken?.address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { disclosure, loading, error, refresh };
}

