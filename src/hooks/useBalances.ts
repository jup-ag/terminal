import { useQuery } from '@tanstack/react-query';
import { BalanceResponse, ultraSwapService } from 'src/data/UltraSwapService';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import { useMemo } from 'react';
import { WRAPPED_SOL_MINT } from 'src/constants';
import { getPluginInView } from 'src/stores/jotai-plugin-in-view';

const ULTRA_NATIVESOL_ID = 'SOL';
const WSOL_ID = WRAPPED_SOL_MINT.toString();
const WRAPPED_SOL_ID = 'wSOL';

function combineSolAmounts(data: BalanceResponse): BalanceResponse {
  const balances = structuredClone(data);

  /**
   * Note:
   * /balance return "SOL" as native sol and "So11111111111111111111111111111111111111112" as wrapped sol
   * Logic below is to convert "So11111111111111111111111111111111111111112" to wSOL and "SOL" to "So11111111111111111111111111111111111111112"
   *
   */
  if (balances[WSOL_ID]) {
    balances[WRAPPED_SOL_ID] = {
      ...balances[WSOL_ID],
    };
  }

  if (balances[ULTRA_NATIVESOL_ID]) {
    balances[WSOL_ID] = {
      ...balances[ULTRA_NATIVESOL_ID],
    };
  }

  return balances;
}

export const useBalances = () => {
  const { publicKey } = useWalletPassThrough();

  const address = useMemo(() => {
    if (!publicKey) return '';
    return publicKey.toString();
  }, [publicKey]);

  return useQuery({
    queryKey: ['ultra', 'balances', address],
    queryFn: async ({ signal }) => {
      return await ultraSwapService.getBalance(address, signal);
    },
    enabled: !!address && getPluginInView(),
    gcTime: 20_000,
    staleTime: 20_000,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    select: (data) => combineSolAmounts(data),
  });
};
