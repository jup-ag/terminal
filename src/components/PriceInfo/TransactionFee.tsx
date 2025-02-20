import React, { useMemo } from 'react';
import { TransactionFeeInfo } from '@jup-ag/react-hook';
import Tooltip from 'src/components/Tooltip';
import { formatNumber } from 'src/misc/utils';
import Decimal from 'decimal.js';

const TransactionFee = ({ feeInformation }: { feeInformation: TransactionFeeInfo | undefined }) => {
  const feeText = useMemo(() => {
    if (feeInformation) {
      return formatNumber.format(new Decimal(feeInformation.signatureFee).div(10 ** 9));
    }
    return '-';
  }, [feeInformation]);

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex w-[50%] text-white/50">
        <span>Transaction Fee</span>
        <Tooltip content={<span>This is for Solana transaction fee</span>}>
          <span className="ml-1 cursor-pointer">[?]</span>
        </Tooltip>
      </div>
      <div className="text-white/50">{feeText} SOL</div>
    </div>
  );
};

export default TransactionFee;
