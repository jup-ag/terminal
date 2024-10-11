import Tooltip from '../../Tooltip';
import { useMemo } from 'react';
import Decimal from 'decimal.js';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import BasePill, { HAPPY_CLASS } from './BasePill';
import { TokenInfo } from '@solana/spl-token-registry';
import { useMobile } from 'src/hooks/useMobile';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';
import { cn } from 'src/misc/cn';
import Link from 'next/link';
import { JUPSOL_TOKEN_INFO } from 'src/constants';

export const LSTSuggestion = ({
  tokenInfo,
  apyInPercent,
}: {
  tokenInfo: TokenInfo;
  apyInPercent: number | undefined;
}) => {
  const apyCalculation = useMemo(() => {
    if (apyInPercent) {
      return new Decimal(apyInPercent).mul(100).toFixed(2);
    }

    return undefined;
  }, [apyInPercent]);

  const isMobile = useMobile();

  return (
    <PopoverTooltip
      persistOnClick={isMobile}
      placement="top"
      drawShades
      buttonContentClassName="!cursor-help"
      content={
        <div className="p-2 text-xs">
          <div className="space-y-2">
            {tokenInfo.address === JUPSOL_TOKEN_INFO.address ? (
              <>
                <p>
                  JupSOL is a liquid-staked token, representing SOL staked to Jupiter’s 0% fee validator. Jupiter uses
                  this validator to help land transactions for all users.
                </p>
                <p>Swap for this token and hold it in your wallet or across DeFi while enjoying staking yields!</p>
              </>
            ) : (
              <>
                <p>
                  {tokenInfo.symbol} is a Liquid Staking Token (LST) which can be traded, used in DeFi applications, or
                  transferred while still earning staking rewards.
                </p>
                <p>
                  Jupiter has our own LST,{' '}
                  <Link
                    href="https://station.jup.ag/guides/jupsol/jupsol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-v2-primary hover:underline"
                  >
                    {JUPSOL_TOKEN_INFO.symbol}
                  </Link>
                  !
                </p>
              </>
            )}
          </div>

          {apyCalculation && (
            <div className="mt-4 flex justify-between gap-x-10 rounded-lg border border-[#667085] bg-white/5 px-4 py-2">
              <div className="text-white/75">Estimated APY:</div>
              <div className="flex flex-row items-center gap-1">
                {apyCalculation}%
                <Tooltip
                  variant="dark"
                  content={
                    <span className="flex rounded-lg text-xs text-white-75">
                      APY estimation based on last few epochs
                    </span>
                  }
                >
                  <div className="flex items-center fill-current text-white/30">
                    <InfoIconSVG height={12} width={12} />
                  </div>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      }
    >
      <BasePill className={cn(HAPPY_CLASS)}>
        {apyCalculation ? `${tokenInfo.symbol} ${apyCalculation}% ` : null}
        LST
      </BasePill>
    </PopoverTooltip>
  );
};
