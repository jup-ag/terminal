import { JupiterError } from '@jup-ag/react-hook';
import { useQuery } from '@tanstack/react-query';
import { UltraSwapQuoteParams, ultraSwapService } from 'src/data/UltraSwapService';
import { FormattedUltraQuoteResponse } from 'src/entity/FormattedUltraQuoteResponse';
import { create } from 'superstruct';

export const useQuoteQuery = ({ inputMint, outputMint, amount, taker }: UltraSwapQuoteParams) => {
  return useQuery({
    queryKey: ['quote', inputMint, outputMint, amount, taker],
    queryFn: async () => {
      try {
        const response = await ultraSwapService.getQuote({ inputMint, outputMint, amount, taker });
        console.log({ response });
        const quoteResponse = create(response, FormattedUltraQuoteResponse, 'conver FormattedUltraQuoteResponse Error');
        console.log({ quoteResponse });
        return {
          quoteResponse,
          original: response,
        };
      } catch (e) {
        console.log(e);
        return null;
        // throw e;
      }
    },
    enabled: !!inputMint && !!outputMint && !!amount,
  });
};
