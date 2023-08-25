import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import { useCallback } from 'react';

const JUPITER_QUOTE_API_URL = 'https://quote-api.jup.ag';
const useJupiterSwapPriceFetcher = () => {
  const fetchPrice = useCallback(
    async ({
      fromTokenInfo,
      toTokenInfo,
      amount,
      decimals,
    }: {
      fromTokenInfo: TokenInfo;
      toTokenInfo: TokenInfo;
      amount: string;
      decimals?: number;
    }) => {
      const params = {
        inputMint: fromTokenInfo.address.toString(),
        outputMint: toTokenInfo.address.toString(),
        amount,
        slippageBps: '0',
      };

      const response = await fetch(`${JUPITER_QUOTE_API_URL}/v6/quote?${new URLSearchParams(params).toString()}`);
      const result = (await response.json());
      const fromAmount = new Decimal(result.inAmount.toString()).div(10 ** fromTokenInfo.decimals);
      const toAmount = new Decimal(result.outAmount.toString()).div(10 ** toTokenInfo.decimals);

      const marketRate = new Decimal(fromAmount).div(toAmount);
      if (decimals) {
        return marketRate.toDP(decimals);
      } else {
        return marketRate;
      }
    },
    [JUPITER_QUOTE_API_URL],
  );

  return { fetchPrice };
};

export default useJupiterSwapPriceFetcher;
