import { useMemo } from 'react';
import Decimal from 'decimal.js';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import BasePill, { HAPPY_CLASS } from './BasePill';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';
import { cn } from 'src/misc/cn';

export const LSTSuggestion = ({ apyInPercent }: { apyInPercent: number | undefined }) => {
  const apyCalculation = useMemo(() => {
    if (apyInPercent) {
      return new Decimal(apyInPercent).mul(100).toFixed(2);
    }

    return undefined;
  }, [apyInPercent]);

  return (
    <PopoverTooltip
      placement="top"
      drawShades
      buttonContentClassName="!cursor-help"
      content={
        <div className="text-xs p-2">
          <p>
            JupSOL is a liquid-staked token, representing SOL staked to Jupiter’s 0% fee validator. Jupiter uses this
            validator to help land transactions for all users.
          </p>
          <p>Swap for this token and hold it in your wallet or across DeFi while enjoying staking yields!</p>

          {apyCalculation && (
            <div className="border rounded-lg border-[#667085] bg-white/5 px-4 py-2 gap-x-10 flex justify-between mt-4">
              <div className="text-white/75">Estimated APY:</div>
              <div className="flex flex-row items-center gap-1">
                {apyCalculation}%
                <PopoverTooltip
                  variant="dark"
                  content={
                    <span className="flex rounded-lg text-xs text-white-75">
                      APY estimation based on last few epochs
                    </span>
                  }
                >
                  <div className="flex items-center text-white/30 fill-current">
                    <InfoIconSVG height={12} width={12} />
                  </div>
                </PopoverTooltip>
              </div>
            </div>
          )}
        </div>
      }
    >
      <BasePill className={cn(HAPPY_CLASS)}>
        {apyInPercent ? `${new Decimal(apyInPercent).mul(100).toFixed(2)}% ` : null}
        LST
      </BasePill>
    </PopoverTooltip>
  );
};
