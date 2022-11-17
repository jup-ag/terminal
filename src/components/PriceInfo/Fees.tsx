import React from 'react';
import { TokenInfo } from '@solana/spl-token-registry';
import { RouteInfo } from '@jup-ag/react-hook';

import Decimal from 'decimal.js';
import { formatNumber } from 'src/misc/utils';
import { useTokenContext } from 'src/contexts/TokenContextProvider';

interface IFees {
  marketInfos: RouteInfo['marketInfos'] | undefined;
}

const Fees = ({ marketInfos }: IFees) => {
  const { tokenMap } = useTokenContext();

  if (!marketInfos || (marketInfos && marketInfos.length === 0)) {
    return null;
  }

  return (
    <>
      {marketInfos.map((item, idx) => {
        const tokenMint = tokenMap.get(item.lpFee.mint);
        const decimals = tokenMint?.decimals ?? 6;

        const feeAmount = formatNumber.format(
          new Decimal(item.lpFee.amount.toString()).div(Math.pow(10, decimals)).toNumber(),
        );

        return (
          <div key={idx} className="flex items-center space-x-4 justify-between text-xs">
            <div className="text-white/30">
              <span>
                <span>
                  Fees paid to <span translate="no">{item.label}</span> LP
                </span>
              </span>
            </div>
            <div className="text-white/30 text-right">
              {feeAmount} {tokenMint?.symbol} ({formatNumber.format(new Decimal(item.lpFee.pct).mul(100).toNumber())}
              %)
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Fees;
