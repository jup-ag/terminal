import React from 'react';

import Decimal from 'decimal.js';
import { useTokenContext } from 'src/contexts/TokenContextProvider';
import { formatNumber } from 'src/misc/utils';
import { FormattedUltraQuoteResponse } from 'src/entity/FormattedUltraQuoteResponse';

interface IFees {
  routePlan: FormattedUltraQuoteResponse['routePlan'] | undefined;
}

const Fees = ({ routePlan }: IFees) => {
  const { getTokenInfo } = useTokenContext();

  if (!routePlan || (routePlan && routePlan.length === 0)) {
    return null;
  }

  return (
    <>
      {routePlan.map((item, idx) => {
        const tokenMint = getTokenInfo(item.swapInfo.feeMint.toString());
        const decimals = tokenMint?.decimals ?? 6;

        const feeAmount = formatNumber.format(
          new Decimal(item.swapInfo.feeAmount.toString()).div(Math.pow(10, decimals)),
        );
        const feePct = new Decimal(item.swapInfo.feeAmount.toString())
          .div(
            new Decimal(
              item.swapInfo.inputMint.toString() === item.swapInfo.feeMint.toString()
                ? item.swapInfo.inAmount.toString()
                : item.swapInfo.outAmount.toString(),
            ),
          )
          .toDP(4);
        return (
          <div key={idx} className="flex items-center space-x-4 justify-between text-xs">
            <div className="text-white/50">
              <span>
                <span>
                  Fees paid to <span translate="no">{item.swapInfo.label}</span> LP
                </span>
              </span>
            </div>
            <div className="text-white/50 text-right">
              {feeAmount} {tokenMint?.symbol} ({formatNumber.format(new Decimal(feePct).mul(100))}
              %)
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Fees;
