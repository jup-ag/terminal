
import { usePreferredExplorer } from 'src/contexts/preferredExplorer';
import ExternalIcon from 'src/icons/ExternalIcon';
import { cn } from 'src/misc/cn';
import { shortenAddress } from 'src/misc/utils';
import { SearchAsset } from 'src/entity/SearchResponse';

interface TokenLinkProps {
  tokenInfo: SearchAsset;
  className?: string;
}

const TokenLink: React.FC<TokenLinkProps> = ({ tokenInfo, className }) => {
  const { getTokenExplorer } = usePreferredExplorer();

  return (
    <a
      target="_blank"
      rel="noreferrer"
      className={cn(
        'flex items-center bg-black/25 text-primary-text/75 px-2 py-0.5 space-x-1 rounded cursor-pointer',
        className,
      )}
      href={getTokenExplorer(tokenInfo.id)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-xxs">{shortenAddress(tokenInfo.id)}</div>
      <ExternalIcon />
    </a>
  );
};
TokenLink.displayName = 'TokenLink';

export default TokenLink;
