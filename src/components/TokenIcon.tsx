import { TokenInfo } from '@solana/spl-token-registry';
import React, { useState } from 'react';

const TokenIcon: React.FC<{ tokenInfo?: TokenInfo | null; width?: number; height?: number }> = ({
  tokenInfo,
  width = 24,
  height = 24,
}) => {
  const [error, setError] = useState(false);

  return (
    <div className="text-xs flex items-center justify-center rounded-full overflow-hidden" style={{ width, height}}>
      {tokenInfo && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img onError={() => setError(true)} src={tokenInfo?.logoURI} alt={tokenInfo?.symbol} width={width} height={height} />
      ) : (
        <div className="items-center justify-center rounded-full overflow-hidden bg-black/20" style={{ width, height}} />
      )}
    </div>
  );
};

export default TokenIcon;
