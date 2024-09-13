import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';
import { cn } from 'src/misc/cn';
import BasePill, { SUGGESTION_CLASS, WARNING_CLASS } from './BasePill';
import { Token2022Info } from './Token2022Info';
import { TokenInfoWithParsedAccountData } from '../hooks/useQueryTokenMetadata';
import { useMemo } from 'react';
import { checkIsStrictOrVerified } from 'src/misc/tokenTags';

export const TransferTaxSuggestion = ({
  asset,
  transferFee,
}: {
  asset: TokenInfoWithParsedAccountData;
  transferFee: string;
}) => {
  const isVerified = useMemo(() => checkIsStrictOrVerified(asset.tokenInfo), [asset.tokenInfo]);

  return (
    <PopoverTooltip
      placement="top"
      drawShades
      buttonContentClassName="!cursor-help"
      content={asset.tokenInfo ? <Token2022Info asset={asset} isLoading={false} /> : null}
    >
      <BasePill className={cn(isVerified ? SUGGESTION_CLASS : WARNING_CLASS)}>
        <div className="flex gap-x-1">
          <span>{asset.tokenInfo.symbol}</span>
          <span>({transferFee}% Tax)</span>
        </div>
      </BasePill>
    </PopoverTooltip>
  );
};
