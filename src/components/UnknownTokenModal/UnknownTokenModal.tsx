import React from 'react';
import { TokenInfo } from '@solana/spl-token-registry';
import CloseIcon from 'src/icons/CloseIcon';
import ExternalIcon from 'src/icons/ExternalIcon';
import { usePreferredExplorer } from 'src/contexts/preferredExplorer';
import TokenIcon from '../TokenIcon';
import { shortenAddress } from 'src/misc/utils';
import { useSwapContext } from 'src/contexts/SwapContext';

const UNKNOWN_TOKEN_LINK = 'https://docs.jup.ag/notes/getting-your-token-on-jupiter';
const UnknownTokenModal: React.FC<{
  tokensInfo: TokenInfo[];
  onClickAccept(): void;
  onClickReject(): void;
}> = ({ tokensInfo, onClickAccept, onClickReject }) => {
  const { getTokenExplorer } = usePreferredExplorer();
  const {
    formProps: { darkMode },
  } = useSwapContext();

  return (
    <div
      className={`p-6 rounded-lg max-h-[80vh] overflow-auto ${
        darkMode ? 'bg-jupiter-bg text-white' : 'bg-gray-300 text-black'
      }`}
    >
      {/* Token */}
      <div className="flex justify-between">
        <div />

        <div className="flex justify-center w-full space-x-6">
          {tokensInfo.map((tokenInfo) => (
            <div key={tokenInfo.address} className="flex flex-col items-center justify-center">
              <TokenIcon tokenInfo={tokenInfo} width={52} height={52} />
              <div className="mt-2 font-semibold">{tokenInfo.symbol}</div>

              <a
                href={getTokenExplorer(tokenInfo.address, 'mainnet-beta')}
                target="_blank"
                rel="nofollow noreferrer"
                className="flex items-center justify-center px-2 py-1 mt-1 rounded-lg cursor-pointer fill-current bg-black-10 bg-black/30 text-white/40"
              >
                <span className="mr-2 text-xxs">{shortenAddress(tokenInfo.address)}</span>
                <ExternalIcon />
              </a>
            </div>
          ))}
        </div>

        {/* Close Icon */}
        <div className="mt-2 cursor-pointer fill-current text-white-35" onClick={onClickReject}>
          <CloseIcon width={16} height={16} />
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 text-sm">
        <div>
          {tokensInfo.length > 1
            ? 'These tokens are not on the strict list, make sure that the mint addresses are correct before confirming.'
            : 'This token is not on the strict list, make sure the mint address is correct before confirming'}
        </div>

        <a
          href={UNKNOWN_TOKEN_LINK}
          target="_blank"
          rel="noreferrer"
          className={`flex items-center justify-center mt-4 ${darkMode ? 'text-white/40' : 'text-black/40'}`}
        >
          <span>Learn More</span>

          <div className="flex items-center ml-1 fill-current">
            <ExternalIcon />
          </div>
        </a>
      </div>

      {/* Button */}
      <div className="w-full space-y-3 lg:space-y-0 lg:space-x-3 mt-7">
        <button
          type="button"
          className={`rounded-lg w-full py-2.5 px-6 font-semibold text-sm ${
            darkMode ? 'bg-black text-white' : 'bg-white text-black'
          }`}
          onClick={onClickAccept}
        >
          <span>{'Confirm Selection'}</span>
        </button>
      </div>
    </div>
  );
};

export default UnknownTokenModal;
