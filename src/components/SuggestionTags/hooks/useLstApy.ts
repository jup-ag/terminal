import { useQuery } from '@tanstack/react-query';

export interface LstApy {
  apys: Record<string, number>;
}

export function useLstApyFetcher() {
  return useQuery(
    ['lst-apy'],
    async () => {
      const lstApy = await fetch(`https://worker.jup.ag/lst-apys`);
      const apyResult: LstApy = await lstApy.json();

      return apyResult;
    },
    {
      retry: 3,
      keepPreviousData: true,
      staleTime: 300_000, // 5m
    },
  );
}
