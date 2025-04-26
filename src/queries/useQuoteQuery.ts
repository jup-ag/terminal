import { useQuery } from '@tanstack/react-query';
import { UltraSwapQuoteParams, ultraSwapService } from 'src/data/UltraSwapService';
import { FormattedUltraQuoteResponse } from 'src/entity/FormattedUltraQuoteResponse';
import { create } from 'superstruct';

export const useQuoteQuery = ({ inputMint, outputMint, amount, taker, swapMode }: UltraSwapQuoteParams) => {
  return useQuery({
    queryKey: ['quote', inputMint, outputMint, amount, taker],
    queryFn: async ({ signal }) => {
      const response = await ultraSwapService.getQuote({ inputMint, outputMint, amount, taker, swapMode }, signal);
      const quoteResponse = create(response, FormattedUltraQuoteResponse, 'conver FormattedUltraQuoteResponse Error');
      return {
        quoteResponse,
        original: response,
      };
    },
    retryDelay: 2_000,
    enabled: Number(amount) > 0,
    keepPreviousData: Number(amount) > 0,
  });
};
