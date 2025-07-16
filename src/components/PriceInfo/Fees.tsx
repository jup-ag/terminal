import React from 'react';

import Decimal from 'decimal.js';
import { formatNumber } from 'src/misc/utils';
import { FormattedUltraQuoteResponse } from 'src/entity/FormattedUltraQuoteResponse';
import { useAsset } from 'src/hooks/useAsset';

interface IFees {
  routePlan: FormattedUltraQuoteResponse['routePlan'] | undefined;
}

const FeesItem = ({ item }: { item: FormattedUltraQuoteResponse['routePlan'][0] }) => {
  const { data: assets } = useAsset(item.swapInfo.feeMint.toString());
  const decimals = assets?.decimals ?? 6;

  const feeAmount = formatNumber.format(new Decimal(item.swapInfo.feeAmount.toString()).div(Math.pow(10, decimals)));
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
    <div className="flex items-center space-x-4 justify-between text-xs">
      <div className="text-primary-text/50">
        <span>
          <span>
            Fees paid to <span translate="no">{item.swapInfo.label}</span> LP
          </span>
        </span>
      </div>
      <div className="text-primary-text/50 text-right">
        {feeAmount} {assets?.symbol} ({formatNumber.format(new Decimal(feePct).mul(100))}
        %)
      </div>
    </div>
  );
};

const Fees = ({ routePlan }: IFees) => {
  if (!routePlan || (routePlan && routePlan.length === 0)) {
    return null;
  }

  return (
    <>
      {routePlan.map((item, idx) => (
        <FeesItem item={item} key={idx} />
      ))}
    </>
  );
};

export default Fees;
