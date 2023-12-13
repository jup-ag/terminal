import React from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

import { shortenAddress } from '../misc/utils';

export const CurrentUserBadge: React.FC = () => {
  const { publicKey, wallet } = useWalletPassThrough();

  if (!wallet || !publicKey) {
    return null;
  }

  return (
    <div className="flex items-center px-3 py-2 rounded-2xl h-7">
      <div className="flex items-center justify-center w-4 h-4 rounded-full" style={{ position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Wallet logo" width={16} height={16} src={wallet?.adapter?.icon} />
      </div>

      <div className="ml-2">
        <div className="text-xs">{shortenAddress(`${publicKey}`)}</div>
      </div>
    </div>
  );
};
