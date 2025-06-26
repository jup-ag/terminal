import React from 'react';
import { cn } from 'src/misc/cn';
import { UltraIcon } from 'src/icons/UltraIcon';

const TransactionFee = ({ gasFee, gasless }: { gasFee: number | undefined; gasless: boolean }) => {
  if (!gasFee) return null;
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex w-[50%] text-white/50">
        <span>Network Fee</span>
      </div>
      <div className="flex items-center gap-1">
        {gasless && (
          <>
            <UltraIcon color="#FDB022" width={12} height={12} />
            <div className="text-xs text-white">Gasless</div>
          </>
        )}
        <div
          className={cn('text-white', {
            'line-through': gasless,
          })}
        >
          {gasFee} SOL
        </div>
      </div>
    </div>
  );
};

export default TransactionFee;
