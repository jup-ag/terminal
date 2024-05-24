import { TokenInfo } from '@solana/spl-token-registry';
import React, { CSSProperties, useMemo } from 'react';

import CoinBalance from './Coinbalance';
import { PAIR_ROW_HEIGHT } from './FormPairSelector';
import TokenIcon from './TokenIcon';
import TokenLink from './TokenLink';
import { useUSDValueProvider } from 'src/contexts/USDValueProvider';
import Decimal from 'decimal.js';
import { useAccounts } from 'src/contexts/accounts';

const FormPairRow: React.FC<{
  item: TokenInfo;
  style: CSSProperties;
  onSubmit(item: TokenInfo): void;
}> = ({ item, style, onSubmit }) => {
  const isUnknown = useMemo(() => item.tags?.length === 0 || item.tags?.includes('unknown'), [item.tags])

  const { accounts } = useAccounts();
  const { tokenPriceMap } = useUSDValueProvider();

  const totalUsdValue = useMemo(() => {
    const tokenPrice = tokenPriceMap[item.address]?.usd;
    const balance = accounts[item.address]?.balance;
    if (!tokenPrice || !balance) return null;

    const totalAValue = new Decimal(tokenPrice).mul(balance);
    return totalAValue;
  }, [accounts, item.address, tokenPriceMap])

  return (
    <li
      className={`cursor-pointer list-none `}
      style={{ maxHeight: PAIR_ROW_HEIGHT, height: PAIR_ROW_HEIGHT, ...style }}
      translate="no"
    >
      <div
        className="flex items-center rounded-xl space-x-4 my-2 p-3 justify-between bg-v2-lily/10 hover:bg-v2-lily/5"
        onClick={() => onSubmit(item)}
      >
        <div className="flex-shrink-0">
          <div className="h-6 w-6 rounded-full">
            <TokenIcon tokenInfo={item} width={24} height={24} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className='flex flex-row space-x-2'>
            <p className="text-sm text-white truncate">
              {item.symbol}
            </p>
            <TokenLink tokenInfo={item} />
          </div>

          <div className="mt-1 text-xs text-gray-500 truncate flex space-x-1">
            <CoinBalance mintAddress={item.address} />

            {totalUsdValue && totalUsdValue.gt(0.01) ? (
              <span className='ml-1'>
                | ${totalUsdValue.toFixed(2)}
              </span>
            ) : null}
          </div>
        </div>

        {isUnknown ? (
          <p className="ml-auto border rounded-md text-xxs py-[1px] px-1 border-warning text-warning">
            <span>Unknown</span>
          </p>
        ) : null}
      </div>
    </li>
  );
};

export default FormPairRow;
