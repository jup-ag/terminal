import { keepPreviousData, useQuery } from '@tanstack/react-query';

export interface LstApy {
  apys: Record<string, number>;
}

export function useLstApyFetcher() {
  return useQuery({
    queryKey: ['lst-apy'],
    queryFn: async () => {
      const lstApy = await fetch(`https://worker.jup.ag/lst-apys`);
      const apyResult: LstApy = await lstApy.json();

      return apyResult;
    },
    retry: 3,
    placeholderData: keepPreviousData,
    staleTime: 300_000, // 5m
  });
}
