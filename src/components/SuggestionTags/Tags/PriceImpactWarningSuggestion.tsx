import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import React, { useMemo } from 'react';
import { ExchangeRateComponent } from 'src/components/ExchangeRate/ExchangeRate';

import BasePill, { DANGER_CLASS, WARNING_CLASS } from './BasePill';
import InfoIconSVG from 'src/icons/InfoIconSVG';

import Link from 'next/link';

import RightArrowIcon from 'src/icons/RightArrowIcon';

import { QuoteResponse } from '@jup-ag/react-hook';
import { useUSDValue } from 'src/contexts/USDValueProvider';
import { useSwapRouteInfo } from '../hooks/useSwapInfo';
import { useMobile } from 'src/hooks/useMobile';
import JupButton from 'src/components/JupButton';
import { cn } from 'src/misc/cn';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';

interface Props {
  isWarning: boolean;
  isDanger: boolean;
  birdeyeRate: number | null;
  isHighPriceImpact: boolean;
  priceDifferencePct: number;
  fromTokenInfo: TokenInfo;
  toTokenInfo: TokenInfo;
  quoteResponse: QuoteResponse;
}

const PriceImpactWarningSuggestion = ({
  birdeyeRate,
  isWarning,
  isDanger,
  isHighPriceImpact,
  priceDifferencePct,
  fromTokenInfo,
  toTokenInfo,
  quoteResponse,
}: Props) => {
  const { tokenPriceMap } = useUSDValue();
  const { inAmount, outAmount, priceImpactPct } = quoteResponse;

  const tradeValue = useMemo(
    () => new Decimal(inAmount.toString()).div(10 ** fromTokenInfo.decimals),
    [inAmount, fromTokenInfo.decimals],
  );

  const fromTokenValue = useMemo(
    () => tradeValue.mul(tokenPriceMap[fromTokenInfo.address || '']?.usd || 0),
    [tradeValue, fromTokenInfo.address, tokenPriceMap],
  );

  const shouldPromptDca = useMemo(() => fromTokenValue.gte(1_000), [fromTokenValue]);

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

  const isMobile = useMobile();

  const { pillTitle, title, description } = useMemo(() => {
    if (isHighPriceImpact) {
      return {
        pillTitle: `${new Decimal(priceImpactPct).mul(100).toNumber().toFixed(2)}% Price Impact`,
        title: shouldPromptDca ? `Looks like your trade size is too large.` : `Looks like you are getting a bad rate.`,
        description: shouldPromptDca ? (
          <Link
            shallow
            target='_blank'
            href={`https://jup.ag/dca/${fromTokenInfo.address}-${toTokenInfo.address}?${new URLSearchParams({
              inAmount: tradeValue.toString(),
              frequency: 'minute',
              frequencyValue: '10',
            }).toString()}`}
            className="text-xs cursor-pointer flex items-center justify-center mb-2"
          >
            <JupButton size="sm" type="button" className="!w-[120px]">
              <div className="flex gap-x-2 items-center justify-center">
                <span>{`Go to DCA`}</span>
                <RightArrowIcon />
              </div>
            </JupButton>
          </Link>
        ) : (
          `Please refresh quote or trade with caution.`
        ),
      };
    }

    return {
      pillTitle: `${priceDifferencePct.toFixed(2)}% Price Difference`,
      title: `Looks like you are getting a bad rate.`,
      description: `Please refresh quote or trade with caution.`,
    };
  }, [isHighPriceImpact, shouldPromptDca, priceImpactPct, priceDifferencePct, fromTokenInfo, toTokenInfo, tradeValue]);

  return (
    <PopoverTooltip
      placement="top"
      persistOnClick={isMobile}
      buttonContentClassName="!cursor-help"
      content={
        <div className="p-3">
          <div className="mb-4">
            <p className="text-v2-lily text-center">{title}</p>
          </div>

          <div
            className={cn('text-center mb-4', {
              'text-jupiter-primary': renderWarningColor,
              'text-perps-red': renderDangerColor,
            })}
          >
            {description}
          </div>

          <div className="flex flex-col bg-[#2B2C32] rounded-lg p-3 w-full">
            <div className="flex items-center justify-between gap-x-5">
              <p className="text-white/50">Quoted Rate</p>

              <button type="button" className="cursor-pointer flex" onClick={onReverse}>
                <ExchangeRateComponent
                  className={cn('text-xs font-medium text-white')}
                  textClassName={cn({
                    'text-jupiter-primary': renderWarningColor,
                    'text-perps-red': renderDangerColor,
                  })}
                  inputAmount={JSBI.BigInt(inAmount)}
                  outputAmount={JSBI.BigInt(outAmount)}
                  inputPair={fromTokenInfo}
                  outputPair={toTokenInfo}
                  reversible={true}
                  isReversed={reverse}
                />
              </button>
            </div>

            {birdeyeRate && birdeyeRate > 0 && (
              <div className="flex items-center justify-between mt-3 gap-x-5">
                <p className="text-white/50 text-nowrap">Market rate</p>
                <button type="button" className="cursor-pointer flex" onClick={onReverse}>
                  <ExchangeRateComponent
                    className={cn('text-xs font-medium text-white')}
                    textClassName={cn({
                      'text-jupiter-primary': renderWarningColor,
                      'text-perps-red': renderDangerColor,
                    })}
                    inputAmount={JSBI.BigInt(inAmount)}
                    outputAmount={JSBI.BigInt(
                      new Decimal(inAmount.toString())
                        .div(10 ** fromTokenInfo.decimals)
                        .mul(birdeyeRate)
                        .mul(10 ** toTokenInfo.decimals)
                        .toFixed(0),
                    )}
                    inputPair={fromTokenInfo}
                    outputPair={toTokenInfo}
                    reversible={true}
                    isReversed={reverse}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      }
    >
      <BasePill className={cn(renderDangerColor ? DANGER_CLASS : WARNING_CLASS)}>
        <InfoIconSVG width={10} height={10} />
        {pillTitle}
      </BasePill>
    </PopoverTooltip>
  );
};

export default PriceImpactWarningSuggestion;
