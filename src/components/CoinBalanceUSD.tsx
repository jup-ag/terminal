import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import { useEffect, useMemo } from 'react';
import { useUSDValue } from 'src/contexts/USDValueProvider';
import { formatNumber, hasNumericValue } from 'src/misc/utils';

interface ComponentProps {
  tokenInfo: TokenInfo;
  amount?: number | string;
  maxDecimals?: number;
  prefix?: string;
}

export const CoinBalanceUSD = (props: ComponentProps) => {
  const { tokenInfo, amount, maxDecimals, prefix = '' } = props;
  const { tokenPriceMap, getUSDValue } = useUSDValue();
  const address = tokenInfo.address;
  const cgPrice = address ? tokenPriceMap[address]?.usd || 0 : 0;

  const amountInUSD = useMemo(() => {
    if (!amount || !hasNumericValue(amount)) return new Decimal(0);
    return new Decimal(amount).mul(cgPrice)
  }, [amount, cgPrice]);

  // effects
  useEffect(() => {
    if (address) getUSDValue([address]);
  }, [address, getUSDValue]);

  return (
    <>
      {prefix}${formatNumber.format(amountInUSD, maxDecimals || 2)}
    </>
  );
};
