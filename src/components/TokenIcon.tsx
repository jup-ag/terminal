import { TokenInfo } from '@solana/spl-token-registry';
import React from 'react';

const TokenIcon: React.FC<{ tokenInfo?: TokenInfo | null, width?: number, height?: number }> = ({
  tokenInfo,
  width = 36,
  height = 36,
}) => {
  return (
    <div className="text-xs flex items-center justify-center rounded-full overflow-hidden">
      {tokenInfo ? (
        <img
          src={tokenInfo?.logoURI}
          alt={tokenInfo?.symbol}
          width={width}
          height={height}
        />
      ) : (
        <div className="items-center justify-center rounded-full bg-gray-200" style={{ width, height }}/>
      )}
    </div>
  );
};

export default TokenIcon;
