import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import { useCallback, useEffect, useRef } from 'react';
import { SearchTokenInfo } from 'src/contexts/SearchService';
import { useTokenContext } from 'src/contexts/TokenContextProvider';
import { useUSDValue } from 'src/contexts/USDValueProvider';
import { checkIsUnknownToken } from 'src/misc/tokenTags';
import { useBalances } from 'src/hooks/useBalances';

export const useSortByValue = () => {
  const { getTokenInfo } = useTokenContext();
  const { data: balances } = useBalances();
  const { tokenPriceMap } = useUSDValue();

  const mintBalanceMap = useRef<Map<string, number>>(new Map());
  const mintToUsdValue = useRef<Map<string, Decimal>>(new Map());
  useEffect(() => {
    if (!balances) return;
    Object.entries(balances)
      .filter(([mint, item]) => item.uiAmount>0)
      .forEach(([mint, item]) => {
        const tokenInfo = getTokenInfo(mint);
        if (!tokenInfo) return;

        const amount = item.uiAmount;
        mintBalanceMap.current.set(mint, amount);

        const tokenPrice = tokenPriceMap[mint]?.usd;
        if (tokenPrice) {
          const usdValue = new Decimal(amount).mul(tokenPrice);
          if (usdValue.greaterThan(0)) {
            mintToUsdValue.current.set(mint, usdValue);
          }
        }
      }, new Map<string, number>());
  }, [getTokenInfo, tokenPriceMap, balances]);

  const sortTokenListByBalance = useCallback(async (tokenList: SearchTokenInfo[]): Promise<SearchTokenInfo[]> => {
    // Dedupe same mints
    const dedupeList = (() => {
      const map = new Map<string, SearchTokenInfo>();
      tokenList.forEach((item) => {
        if (!map.has(item.address)) {
          map.set(item.address, item);
        }
      });
      return Array.from(map.values());
    })();

    const result = dedupeList.sort((t1, t2) => {
      // 1. USD value comparison
      const t1UsdValue = mintToUsdValue.current.get(t1.address);
      const t2UsdValue = mintToUsdValue.current.get(t2.address);
      if (t1UsdValue && t2UsdValue) {
        // both have price
        return t2UsdValue.cmp(t1UsdValue);
      } else if (t1UsdValue && !t2UsdValue) {
        // only t1 has price
        return -1;
      } else if (!t1UsdValue && t2UsdValue) {
        // only t2 has price
        return 1;
      }

      const t1Balance = mintBalanceMap.current.get(t1.address);
      const t2Balance = mintBalanceMap.current.get(t2.address);
      // 2. balance comparison
      if (t1Balance && t2Balance) {
        return new Decimal(t2Balance).cmp(t1Balance);
      } else if (t1Balance && !t2Balance) {
        // only t1 has balance
        return -1;
      } else if (!t1Balance && t2Balance) {
        // only t2 has balance
        return 1;
      }

      // 3. Score based sorting
      let t1Score = 0;
      let t2Score = 0;
      const t1Volume = t1.daily_volume || 0;
      const t2Volume = t2.daily_volume || 0;

      // 3.1 sort by daily_volume provided from MTS
      if (t1Volume > t2Volume) t1Score += 1;
      if (t2Volume > t1Volume) t2Score += 1;

      // 3.2 deprioritise unknown tokens
      if (checkIsUnknownToken(t1)) t1Score -= 2;
      if (checkIsUnknownToken(t2)) t2Score -= 2;
      return t2Score - t1Score;
    });
    return result;
  }, []);

  const filterStrictToken = useCallback((items: TokenInfo[]) => {
    return items.filter((item) => !checkIsUnknownToken(item));
  }, []);

  return {
    sortTokenListByBalance,
    filterStrictToken,
    mintToUsdValue: mintToUsdValue.current,
  };
};
