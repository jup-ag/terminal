import Decimal from 'decimal.js';
import { useMemo } from 'react';
import { formatNumber, hasNumericValue } from 'src/misc/utils';
import { Asset } from 'src/entity/SearchResponse';

interface ComponentProps {
  tokenInfo: Asset;
  amount?: number | string;
  maxDecimals?: number;
  prefix?: string;
}

export const CoinBalanceUSD = (props: ComponentProps) => {
  const { tokenInfo, amount, maxDecimals, prefix = '' } = props;
  const tokenPrice = tokenInfo.usdPrice || 0;

  const amountInUSD = useMemo(() => {
    if (!amount || !hasNumericValue(amount)) return new Decimal(0);
    return new Decimal(amount).mul(tokenPrice);
  }, [amount, tokenPrice]);

  return (
    <>
      {prefix}${formatNumber.format(amountInUSD, maxDecimals || 2)}
    </>
  );
};
