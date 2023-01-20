import React, { useMemo } from 'react';
import { WRAPPED_SOL_MINT } from 'src/constants';
import { useAccounts } from 'src/contexts/accounts';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

import { shortenAddress } from '../misc/utils';

export const CurrentUserBadge: React.FC = () => {
  const { publicKey, wallet } = useWalletPassThrough();
  const { accounts } = useAccounts();

  const solBalance = useMemo(() => {
    if (accounts[WRAPPED_SOL_MINT.toString()]) {
      return accounts[WRAPPED_SOL_MINT.toString()].balance;
    }
    return 0;
  }, [publicKey, accounts]);

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
        <div className="text-xs text-white">{shortenAddress(`${publicKey}`)}</div>
      </div>
    </div>
  );
};
