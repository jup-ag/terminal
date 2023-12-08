import React, { useMemo } from 'react';
import { TransactionFeeInfo } from '@jup-ag/react-hook';
import Tooltip from 'src/components/Tooltip';
import { formatNumber, fromLamports } from 'src/misc/utils';

const TransactionFee = ({
  feeInformation,
  darkMode = false,
}: {
  feeInformation: TransactionFeeInfo | undefined;
  darkMode: boolean;
}) => {
  const feeText = useMemo(() => {
    if (feeInformation) {
      return formatNumber.format(fromLamports(feeInformation.signatureFee, 9));
    }
    return '-';
  }, [feeInformation]);

  return (
    <div className="flex items-center justify-between text-xs">
      <div className={`flex w-[50%] ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
        <span>Transaction Fee</span>
        <Tooltip content={<span>This is for Solana transaction fee</span>}>
          <span className="ml-1 cursor-pointer">[?]</span>
        </Tooltip>
      </div>
      <div className={`${darkMode ? 'text-white/30' : 'text-black/30'}`}>{feeText} SOL</div>
    </div>
  );
};

export default TransactionFee;
