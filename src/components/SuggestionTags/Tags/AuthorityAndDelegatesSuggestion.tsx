import { TokenInfo } from '@solana/spl-token-registry';
import React, { useMemo } from 'react';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import BasePill, { DANGER_CLASS, SUGGESTION_CLASS } from './BasePill';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';
import { cn } from 'src/misc/cn';
import { checkIsStrictOrVerified } from 'src/misc/tokenTags';
import TokenLink from 'src/components/TokenLink';
import Separator from 'src/components/Separator/Separator';

export const AuthorityAndDelegatesSuggestion = ({
  freeze,
  permanent,
}: {
  freeze: TokenInfo[];
  permanent: TokenInfo[];
}) => {
  const isVerified = useMemo(
    () => freeze.every(checkIsStrictOrVerified) && permanent.every(checkIsStrictOrVerified),
    [freeze, permanent],
  );

  return (
    <PopoverTooltip
      placement="top"
      drawShades
      buttonContentClassName="!cursor-help"
      content={
        <div className="p-1">
          {freeze.length > 0 && (
            <>
              <p className="font-semibold">Freeze Authority</p>
              <div className="text-v2-lily/50 mt-1">
                <p>The token you are trading have Freeze Authority, and can be frozen</p>
              </div>
              <div className="mt-2 flex gap-2">
                {freeze.map((tokenInfo) => (
                  <div
                    key={tokenInfo.address}
                    className={cn(
                      'flex pl-2 overflow-hidden gap-x-2 items-center border border-v2-lily/10 rounded-lg bg-v2-lily/10',
                      checkIsStrictOrVerified(tokenInfo) ? '' : 'bg-warning text-limit-bg',
                    )}
                  >
                    <span className="font-semibold">{tokenInfo.symbol}</span>
                    <TokenLink
                      tokenInfo={tokenInfo}
                      className={checkIsStrictOrVerified(tokenInfo) ? '' : 'text-black'}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {freeze.length > 0 && permanent.length > 0 && <Separator />}

          {permanent.length > 0 && (
            <>
              <p className="font-semibold">Permanent Delegates</p>
              <div className="text-v2-lily/50 mt-1">
                <p>
                  The token you are trading have Permanent Delegates, permanent delegate has unrestricted delegate
                  privileges over all Token Accounts for that mint, enabling them to burn or transfer tokens without
                  limitation
                </p>
              </div>
              <div className="mt-2 flex gap-2">
                {permanent.map((tokenInfo) => (
                  <div
                    key={tokenInfo.address}
                    className={cn(
                      'flex pl-2 overflow-hidden gap-x-2 items-center border border-v2-lily/10 rounded-lg bg-v2-lily/10',
                      checkIsStrictOrVerified(tokenInfo) ? '' : 'bg-warning text-limit-bg',
                    )}
                  >
                    <span className="font-semibold">{tokenInfo.symbol}</span>
                    <TokenLink
                      tokenInfo={tokenInfo}
                      className={checkIsStrictOrVerified(tokenInfo) ? '' : 'text-black'}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      }
    >
      <BasePill className={cn(isVerified ? SUGGESTION_CLASS : DANGER_CLASS)}>
        <InfoIconSVG width={10} height={10} />
        Authority Warning
      </BasePill>
    </PopoverTooltip>
  );
};
