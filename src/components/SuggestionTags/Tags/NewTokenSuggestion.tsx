import { TokenInfo } from '@solana/spl-token-registry';
import Tooltip from '../../Tooltip';
import BasePill, { SUGGESTION_CLASS } from './BasePill';
import { cn } from 'src/misc/cn';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';

export const NewTokenSuggestion = ({ tokenInfo }: { tokenInfo: TokenInfo }) => {
  return (
    <PopoverTooltip
      placement="top"
      drawShades
      buttonContentClassName="!cursor-help"
      content={
        <div className="text-xs">
          {tokenInfo.symbol} is a new token, and may be volatile, please trade with caution.
        </div>
      }
    >
      <BasePill className={cn(SUGGESTION_CLASS)}>New</BasePill>
    </PopoverTooltip>
  );
};
