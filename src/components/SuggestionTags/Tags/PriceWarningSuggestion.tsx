import { TokenInfo } from '@solana/spl-token-registry';
import React, { useMemo } from 'react';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';

import BasePill, { DANGER_CLASS, WARNING_CLASS } from './BasePill';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';
import { cn } from 'src/misc/cn';
import { formatNumber } from 'src/misc/utils';
import { useSwapRouteInfo } from '../hooks/useSwapInfo';
import { ExchangeRateComponent } from 'src/components/ExchangeRate/ExchangeRate';

export const PriceWarningSuggestion = ({
  inputAmount,
  inputTokenInfo,
  outputAmount,
  outputTokenInfo,
  priceImpact,
  birdeyeRate,
  isWarning,
  isDanger,
}: {
  inputAmount: string;
  inputTokenInfo: TokenInfo;
  outputAmount: string;
  outputTokenInfo: TokenInfo;
  priceImpact: number;
  birdeyeRate: number;
  isWarning: boolean;
  isDanger: boolean;
}) => {
  const [reverse, setReverse] = React.useState(true);

  const onReverse: React.MouseEventHandler = React.useCallback((event) => {
    event.stopPropagation();
    setReverse((prevState) => !prevState);
  }, []);

  const swapRouteInfo = useSwapRouteInfo();

  const renderWarningColor = useMemo(
    () => isWarning || swapRouteInfo?.isMediumImpact,
    [isWarning, swapRouteInfo?.isMediumImpact],
  );
  const renderDangerColor = useMemo(
    () => isDanger || swapRouteInfo?.isHighImpact,
    [isDanger, swapRouteInfo?.isHighImpact],
  );

  return (
    <PopoverTooltip
      placement="top"
      drawShades
      buttonContentClassName="!cursor-help"
      content={
        <div>
          <div
            className={cn('p-4', {
              'bg-jupiter-primary/50': renderWarningColor,
              'bg-perps-red': renderDangerColor,
            })}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white">Price Warning</h2>
            </div>
            <p className="text-v2-lily mt-1 ">
              Looks like you are getting a bad price. Are you sure you want to continue with this trade?
            </p>
          </div>
          <div className="bg-white dark:bg-[#2B2C32] p-3  font-medium">
            <div className="flex items-center justify-between">
              <p className="text-black/50 dark:text-white/50">Quoted Rate</p>

              <button type="button" className="cursor-pointer flex" onClick={onReverse}>
                <ExchangeRateComponent
                  className={cn('text-xs font-medium text-white')}
                  textClassName={cn({
                    'text-jupiter-primary': renderWarningColor,
                    'text-perps-red': renderDangerColor,
                  })}
                  inputAmount={JSBI.BigInt(inputAmount)}
                  outputAmount={JSBI.BigInt(outputAmount)}
                  inputPair={inputTokenInfo}
                  outputPair={outputTokenInfo}
                  reversible={true}
                  isReversed={reverse}
                />
              </button>
            </div>
            {birdeyeRate > 0 && (
              <div className="flex items-center justify-between mt-3">
                <p className="text-black/50 dark:text-white/50">Birdeye rate</p>
                <button type="button" className="cursor-pointer flex" onClick={onReverse}>
                  <ExchangeRateComponent
                    className={cn('text-xs font-medium text-white')}
                    textClassName={cn({
                      'text-jupiter-primary': renderWarningColor,
                      'text-perps-red': renderDangerColor,
                    })}
                    inputAmount={JSBI.BigInt(inputAmount)}
                    outputAmount={JSBI.BigInt(
                      new Decimal(inputAmount)
                        .div(10 ** inputTokenInfo.decimals)
                        .mul(birdeyeRate)
                        .mul(10 ** outputTokenInfo.decimals)
                        .toFixed(0),
                    )}
                    inputPair={inputTokenInfo}
                    outputPair={outputTokenInfo}
                    reversible={true}
                    isReversed={reverse}
                  />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between mt-3">
              <p className="text-black/50 dark:text-white/50">Price Impact</p>
              <p
                className={cn('text-white', {
                  'text-jupiter-primary': swapRouteInfo?.isMediumImpact,
                  'text-perps-red': swapRouteInfo?.isHighImpact,
                })}
              >
                {priceImpact.toFixed(3)}%
              </p>
            </div>
            <div className="mt-5 px-3.5 py-[11px] bg-white dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-between">
              <p className=" text-black/75 dark:text-white/75 font-medium">You will pay</p>
              <p className="leading-6 text-white font-semibold text-end">
                {formatNumber.format(
                  new Decimal(inputAmount).div(10 ** inputTokenInfo.decimals),
                  inputTokenInfo.decimals,
                )}{' '}
                {inputTokenInfo.symbol}
              </p>
            </div>
            <div className="mt-5 px-3.5 py-[11px] bg-white dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-between">
              <p className=" text-black/75 dark:text-white/75 font-medium">You will receive</p>
              <p className="leading-6 text-white font-semibold text-end">
                {formatNumber.format(
                  new Decimal(outputAmount).div(10 ** outputTokenInfo.decimals),
                  outputTokenInfo.decimals,
                )}{' '}
                {outputTokenInfo.symbol}
              </p>
            </div>
          </div>
        </div>
      }
    >
      <BasePill className={cn(renderDangerColor ? DANGER_CLASS : WARNING_CLASS)}>
        <InfoIconSVG width={10} height={10} />
        Price Warning
      </BasePill>
    </PopoverTooltip>
  );
};
