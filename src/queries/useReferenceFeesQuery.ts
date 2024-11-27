import { useLocalStorage } from '@jup-ag/wallet-adapter';
import { useQuery } from '@tanstack/react-query';

interface Fee {
  /**
   * @description medium
   */
  m: number;
  /**
   * @description high
   */
  h: number;
  /**
   * @description very high
   */
  vh: number;
}

interface MarketReferenceFee {
  claim: number;
  jup: Fee;
  jup2: Fee;
  loAndDCA: number;
  referral: number;
  perps: Fee;
  swapFee: number;
  lastUpdatedAt: number;
}

export const useReferenceFeesQuery = () => {
  const [local, setLocal] = useLocalStorage<{ timestamp: number | null; data: MarketReferenceFee | undefined }>(
    `${window.Jupiter.localStoragePrefix}-market-reference-fees-cached`,
    { timestamp: null, data: undefined },
  );

  return useQuery(
    ['market-reference-fees-cached'],
    async () => {
      // 1 minutes caching
      if (local.data && local.timestamp && Date.now() - local.timestamp < 60_000) {
        return local.data;
      }

      const data = (await (await fetch('https://cache.jup.ag/reference-fees')).json()) as unknown as MarketReferenceFee;
      setLocal({ timestamp: Date.now(), data });
      return data;
    },
    {
      keepPreviousData: true,
      refetchInterval: 60_000,
      refetchIntervalInBackground: false,
      retry: false,
      retryOnMount: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
};
