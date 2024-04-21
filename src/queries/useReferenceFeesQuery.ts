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
  return useQuery(
    ['market-reference-fees'],
    async () => {
      const data = (await fetch('https://cache.jup.ag/reference-fees')).json() as unknown as MarketReferenceFee;
      return data;
    },
    {
      keepPreviousData: true,
      refetchInterval: 60_000,
      refetchIntervalInBackground: false,
    },
  );
};
