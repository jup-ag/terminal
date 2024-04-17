import { TokenInfo } from '@solana/spl-token-registry';
import React from 'react';
import WarningIcon from 'src/icons/WarningIcon';

const TokenIcon: React.FC<{ tokenInfo?: TokenInfo | null; width?: number; height?: number }> = ({
  tokenInfo,
  width = 24,
  height = 24,
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [tokenInfo]);

  return (
    <div className="text-xs flex items-center justify-center" style={{ width, height }}>
      {tokenInfo && tokenInfo?.logoURI && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          onError={() => setHasError(true)}
          src={tokenInfo?.logoURI}
          alt={tokenInfo?.symbol}
          width={width}
          height={height}
          className='rounded-full overflow-hidden'
        />
      ) : (
        <div className="relative items-center justify-center rounded-full bg-black/20" style={{ width, height }}>
          <WarningIcon
            width={Math.max(width * 0.6, 16)}
            height={Math.max(height * 0.6, 16)}
            className="absolute -p-1 text-warning -bottom-[2px] -right-[5px]"
          />
        </div>
      )}
    </div>
  );
};

export default TokenIcon;
