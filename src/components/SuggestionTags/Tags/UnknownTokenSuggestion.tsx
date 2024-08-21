import { TokenInfo } from '@solana/spl-token-registry';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';
import { cn } from 'src/misc/cn';
import BasePill, { WARNING_CLASS } from './BasePill';

export const UnknownTokenSuggestion = ({ tokenInfo }: { tokenInfo: TokenInfo }) => {
  return (
    <PopoverTooltip
      placement="top"
      drawShades
      buttonContentClassName="!cursor-help"
      content={
        <div className="text-xs">
          {tokenInfo.symbol} is not on the strict list, make sure the mint address is correct before trading
        </div>
      }
    >
      <BasePill className={cn(WARNING_CLASS)}>{tokenInfo.symbol} is not verified</BasePill>
    </PopoverTooltip>
  );
};
