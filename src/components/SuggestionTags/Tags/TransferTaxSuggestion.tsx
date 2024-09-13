import { TokenInfo } from '@solana/spl-token-registry';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';
import { cn } from 'src/misc/cn';
import { HeliusDASAsset } from '../hooks/useHeliusDasQuery';
import BasePill, { WARNING_CLASS } from './BasePill';
import { Token2022Info } from './Token2022Info';

export const TransferTaxSuggestion = ({
  tokenInfo,
  dasAsset,
  transferFee,
}: {
  tokenInfo: TokenInfo;
  dasAsset: HeliusDASAsset | null | undefined;
  transferFee: string;
}) => {
  return (
    <PopoverTooltip
      placement="top"
      drawShades
      buttonContentClassName="!cursor-help"
      content={dasAsset ? <Token2022Info tokenInfo={tokenInfo} dasAssets={[dasAsset]} isLoading={false} /> : null}
    >
      <BasePill className={cn(WARNING_CLASS)}>
        <div className="flex gap-x-1">
          <span>{tokenInfo.symbol}</span>
          <span>({transferFee}% Tax)</span>
        </div>
      </BasePill>
    </PopoverTooltip>
  );
};
