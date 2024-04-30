import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import { useEffect } from 'react';
import { useUSDValue } from 'src/contexts/USDValueProvider';
import { formatNumber } from 'src/misc/utils';

interface ComponentProps {
  tokenInfo: TokenInfo;
  amount?: number | string;
  maxDecimals?: number;
  prefix?: string;
}

export const CoinBalanceUSD = (props: ComponentProps) => {
  // props
  const { tokenInfo, amount, maxDecimals, prefix = '' } = props;

  // hook
  const { tokenPriceMap, getUSDValue } = useUSDValue();

  // variables
  const address = tokenInfo.address;
  const cgPrice = address ? tokenPriceMap[address]?.usd || 0 : 0;
  const amountInUSD = new Decimal(amount || 0).mul(cgPrice).toNumber();

  // effects
  useEffect(() => {
    if (address) getUSDValue([address]);
  }, [address, getUSDValue]);

  if (!amountInUSD || amountInUSD <= 0) return <>{''}</>;

  if (maxDecimals) {
    if (new Decimal(amountInUSD).lte(0.1)) {
      return (
        <>
          {prefix}${parseFloat(formatNumber.format(amountInUSD, maxDecimals))}
        </>
      );
    }
  }
  return (
    <>
      {prefix}${formatNumber.format(amountInUSD, 2)}
    </>
  );
};
