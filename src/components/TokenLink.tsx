import { TokenInfo } from '@solana/spl-token-registry';
import { usePreferredExplorer } from 'src/contexts/preferredExplorer';
import ExternalIcon from 'src/icons/ExternalIcon';
import { shortenAddress } from 'src/misc/utils';

const TokenLink: React.FC<{ tokenInfo: TokenInfo }> = (({ tokenInfo }) => {
  const { getTokenExplorer } = usePreferredExplorer();

  return (
    <a
      target="_blank"
      rel="noreferrer"
      className="flex items-center bg-black/25 text-white/75 px-2 py-0.5 space-x-1 rounded cursor-pointer"
      href={getTokenExplorer(tokenInfo.address)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-xxs">{shortenAddress(tokenInfo.address)}</div>
      <ExternalIcon />
    </a>
  );
});
TokenLink.displayName = 'TokenLink';

export default TokenLink;
