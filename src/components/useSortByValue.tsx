import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import { useCallback, useEffect, useRef } from 'react';
import { WRAPPED_SOL_MINT } from 'src/constants';
import { useTokenContext } from 'src/contexts/TokenContextProvider';
import { useUSDValue } from 'src/contexts/USDValueProvider';
import { useAccounts } from 'src/contexts/accounts';
import { checkIsUnknownToken } from 'src/misc/tokenTags';
import { fromLamports } from 'src/misc/utils';

export const useSortByValue = () => {
  const { getTokenInfo } = useTokenContext();
  const { accounts, nativeAccount } = useAccounts();
  const { tokenPriceMap } = useUSDValue();

  const mintBalanceMap = useRef<Map<string, number>>(new Map());
  const mintToUsdValue = useRef<Map<string, Decimal>>(new Map());
  useEffect(() => {
    const wsol = WRAPPED_SOL_MINT.toBase58();
    Object.entries(accounts)
      .filter(([mint, item]) => item.balanceLamports.gtn(0))
      .forEach(([mint, item]) => {
        const tokenInfo = getTokenInfo(mint);
        if (!tokenInfo) return;

        let amount = fromLamports(item.balanceLamports, tokenInfo.decimals);
        if (mint === WRAPPED_SOL_MINT.toBase58() && nativeAccount) {
          amount += fromLamports(nativeAccount.balanceLamports, tokenInfo.decimals);
        }
        mintBalanceMap.current.set(mint, amount);

        const tokenPrice = tokenPriceMap[mint]?.usd;
        if (tokenPrice) {
          const usdValue = new Decimal(amount).mul(tokenPrice);
          if (usdValue.greaterThan(0)) {
            mintToUsdValue.current.set(mint, usdValue);
          }
        }
      }, new Map<string, number>());

    // might need a better way to detect for SOL when there's no ATA and we need to include it
    if (nativeAccount && !mintBalanceMap.current.has(wsol)) {
      const amount = fromLamports(nativeAccount.balanceLamports, 9);
      mintBalanceMap.current.set(WRAPPED_SOL_MINT.toBase58(), amount);

      const tokenPrice = tokenPriceMap[WRAPPED_SOL_MINT.toBase58()]?.usd;
      if (tokenPrice) {
        const usdValue = new Decimal(amount).mul(tokenPrice);
        if (usdValue.greaterThan(0)) {
          mintToUsdValue.current.set(WRAPPED_SOL_MINT.toBase58(), usdValue);
        }
      }
    }
  }, [getTokenInfo, nativeAccount, tokenPriceMap, accounts]);

  const sortTokenListByBalance = useCallback(async (tokenList: TokenInfo[]): Promise<TokenInfo[]> => {
    const newList = [...tokenList];

    const result = newList.sort((t1, t2) => {
      // 1. USD value comparison
      const t1UsdValue = mintToUsdValue.current.get(t1.address);
      const t2UsdValue = mintToUsdValue.current.get(t2.address);
      if (t1UsdValue) {
        if (t2UsdValue) {
          return t2UsdValue.cmp(t1UsdValue);
        } else {
          // bump to front if the second token dont have price
          return -1;
        }
      } else if (t2UsdValue) {
        if (!t1UsdValue) return 1;
      }

      const t1Balance = mintBalanceMap.current.get(t1.address);
      const t2Balance = mintBalanceMap.current.get(t2.address);
      // 2. balance comparison
      if (t1Balance) {
        if (t2Balance) {
          return new Decimal(t2Balance).cmp(t1Balance);
        } else {
          // bump to front if the second token dont have balance
          return -1;
        }
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
      if (t1.tags?.includes('unknown') || t1.tags?.length === 0) t1Score -= 2;
      if (t2.tags?.includes('unknown') || t2.tags?.length === 0) t2Score -= 2;
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
