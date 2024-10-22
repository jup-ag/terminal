import React from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

import { shortenAddress } from '../misc/utils';

export const CurrentUserBadge: React.FC = () => {
  const { publicKey, wallet, } = useWalletPassThrough();

  if (!wallet || !publicKey) {
    return null;
  }

  return (
    <div className="flex items-center bg-[#191B1F] py-2 px-3 rounded-2xl h-7">
      <div
        className="w-4 h-4 rounded-full bg-[#191B1F] dark:bg-white-10 flex justify-center items-center"
        style={{ position: 'relative' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Wallet logo" width={16} height={16} src={wallet?.adapter?.icon} />
      </div>

      <div className="ml-2">
        <div className="text-xs text-white">{shortenAddress(`${publicKey}`, 2)}</div>
      </div>
    </div>
  );
};
