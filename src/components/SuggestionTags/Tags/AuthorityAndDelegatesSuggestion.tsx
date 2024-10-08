import { TokenInfo } from '@solana/spl-token-registry';
import React, { useMemo } from 'react';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import Separator from '../../Separator/Separator';
import BasePill, { DANGER_CLASS, SUGGESTION_CLASS } from './BasePill';

import Link from 'next/link';
import ExternalIcon from 'src/icons/ExternalIcon';
import { FREEZE_AUTHORITY_LINK } from 'src/constants';
import { checkIsStrictOrVerified } from 'src/misc/tokenTags';
import { useMobile } from 'src/hooks/useMobile';
import { cn } from 'src/misc/cn';
import TokenLink from 'src/components/TokenLink';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';

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

  const isMobile = useMobile();

  return (
    <PopoverTooltip
      placement="top"
      persistOnClick={isMobile}
      buttonContentClassName="!cursor-help"
      content={
        <div className="p-1">
          {freeze.length > 0 && (
            <>
              <p className="font-semibold">{`Freeze Authority`}</p>
              <div className="text-v2-lily/50 mt-1">
                <p>{`This authority has the ability to freeze your token account, preventing you from further trading.`}</p>
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
              <p className="font-semibold">{`Permanent Delegates`}</p>
              <div className="text-v2-lily/50 mt-1">
                <p>{`This authority has the ability to control all token accounts of that mint, enabling them to burn or transfer your tokens.`}</p>
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

          <Separator />

          <div className="mt-2">
            <div className="text-v2-lily/50">To understand more about the warnings</div>
            <Link
              target="_blank"
              href={FREEZE_AUTHORITY_LINK}
              className="rounded-lg whitespace-nowrap px-2 py-0.5 flex gap-x-1 items-center border border-v2-lily/10 bg-v2-lily/10 w-fit mt-2"
            >
              <span>{`Read More`}</span>
              <ExternalIcon />
            </Link>
          </div>
        </div>
      }
    >
      <BasePill className={cn(isVerified ? SUGGESTION_CLASS : DANGER_CLASS)}>
        <InfoIconSVG width={10} height={10} />
        Token Permission
      </BasePill>
    </PopoverTooltip>
  );
};
