import Decimal from 'decimal.js';
import { useEffect, useMemo } from 'react';
import { formatNumber, hasNumericValue } from 'src/misc/utils';
import { SearchAsset } from 'src/entity/SearchResponse';

interface ComponentProps {
  tokenInfo: SearchAsset;
  amount?: number | string;
  maxDecimals?: number;
  prefix?: string;
}

export const CoinBalanceUSD = (props: ComponentProps) => {
  const { tokenInfo, amount, maxDecimals, prefix = '' } = props;
  const cgPrice = tokenInfo.usdPrice || 0;

  const amountInUSD = useMemo(() => {
    if (!amount || !hasNumericValue(amount)) return new Decimal(0);
    return new Decimal(amount).mul(cgPrice);
  }, [amount, cgPrice]);

  return (
    <>
      {prefix}${formatNumber.format(amountInUSD, maxDecimals || 2)}
    </>
  );
};
