import { TokenInfo } from '@solana/spl-token-registry';
import Link from 'next/link';
import React from 'react';
import BasePill, { WARNING_CLASS } from './BasePill';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';
import JupButton from 'src/components/JupButton';
import RightArrowIcon from 'src/icons/RightArrowIcon';
import { cn } from 'src/misc/cn';

export const DCASuggestion = ({
  fromTokenInfo,
  toTokenInfo,
  inAmountDecimal,
}: {
  fromTokenInfo: TokenInfo;
  toTokenInfo: TokenInfo;
  inAmountDecimal: string;
}) => {
  return (
    <PopoverTooltip
      placement="top"
      drawShades
      buttonContentClassName="!cursor-help"
      content={
        <div className="p-2">
          <span className="flex space-x-2 items-center">
            <span>DCA can significantly soften your price impact.</span>
          </span>

          <Link
            shallow
            href={`/dca/${fromTokenInfo?.symbol}-${toTokenInfo?.symbol}?inAmount=${inAmountDecimal}&frequency=minute&frequencyValue=10`}
            className="text-white text-xs cursor-pointer flex items-center"
          >
            <JupButton size="sm" className="!mt-2 !w-[120px]">
              <div className="flex gap-x-2 items-center justify-center">
                <span>Go to DCA</span>
                <RightArrowIcon className="text-white" />
              </div>
            </JupButton>
          </Link>
        </div>
      }
    >
      <BasePill className={cn(WARNING_CLASS)}>
        <InfoIconSVG width={10} height={10} />
        DCA Recommended
      </BasePill>
    </PopoverTooltip>
  );
};
