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
      return accounts[WRAPPED_SOL_MINT.toString()].balance
    }
    return 0;
  }, [publicKey, accounts]);

  if (!wallet || !publicKey) {
    return null;
  }

  return (
    <div className="flex items-center">
      <div
        className="w-8 h-8 rounded-full bg-[#EBEFF1] dark:bg-white-10 flex justify-center items-center"
        style={{ position: 'relative' }}
      >
        <img
          alt="Wallet logo"
          width={20}
          height={20}
          src={wallet?.adapter?.icon}
        />
      </div>

      <div className="ml-2">
        <div
          className="text-sm font-semibold text-white"
          translate="no"
        >{`${solBalance.toFixed(2)} SOL`}</div>
        <div className="text-xs text-white/50">
          {shortenAddress(`${publicKey}`)}
        </div>
      </div>
    </div>
  );
};
