import React, { useEffect, useMemo } from 'react';
import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import { useUSDValueProvider } from 'src/contexts/USDValueProvider';
import { formatNumber, hasNumericValue } from 'src/misc/utils';

const CoinBalanceUSD = ({ tokenInfo, amount }: { tokenInfo: TokenInfo; amount?: string }) => {
  const { tokenPriceMap } = useUSDValueProvider();

  const amountInUSD = useMemo(() => {
    if (!amount || !hasNumericValue(amount)) return 0;
    const cgPrice = tokenPriceMap[tokenInfo.address]?.usd || 0;
    return new Decimal(amount || 0).mul(cgPrice).toNumber();
  }, [tokenPriceMap, amount]);

  return amountInUSD && amountInUSD > 0 ? <>${formatNumber.format(amountInUSD, 2)}</> : <>{''}</>;
};

export default CoinBalanceUSD;
