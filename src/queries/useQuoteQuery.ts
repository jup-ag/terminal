import { useQuery } from '@tanstack/react-query';
import { UltraSwapQuoteParams, ultraSwapService } from 'src/data/UltraSwapService';
import { FormattedUltraQuoteResponse } from 'src/entity/FormattedUltraQuoteResponse';
import { create } from 'superstruct';

export const useQuoteQuery = (params: UltraSwapQuoteParams, shouldRefetch: boolean = true) => {
  const { inputMint, outputMint, amount, taker, swapMode } = params;
  return useQuery({
    queryKey: ['quote', inputMint, outputMint, amount, taker],
    queryFn: async ({ signal }) => {
      if (Number(amount) === 0) {
        return null;
      }
      const response = await ultraSwapService.getQuote({ inputMint, outputMint, amount, taker, swapMode }, signal);
      const quoteResponse = create(response, FormattedUltraQuoteResponse, 'conver FormattedUltraQuoteResponse Error');
      return {
        quoteResponse,
        original: response,
      };
    },
    refetchInterval: shouldRefetch ? 5_000 : false,
    retry: 0,
    enabled: Number(amount) > 0,
    keepPreviousData: Number(amount) > 0,
    onError: (error) => {
      console.error('useQuoteQuery', error);
    },
  });
};
