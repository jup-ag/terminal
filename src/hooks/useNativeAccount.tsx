
import BN from 'bn.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AccountInfo } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import { IAccountsBalance } from '../contexts/accounts';

import { fromLamports } from '../misc/utils';

const useNativeAccount = (): IAccountsBalance => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [nativeAccount, setNativeAccount] = useState<AccountInfo<Buffer>>();

  useEffect(() => {
    if (!publicKey) {
      setNativeAccount(undefined);
      return;
    }

    connection.getAccountInfo(publicKey).then((acc) => {
      if (acc) {
        setNativeAccount(acc);
      }
    });
  }, [publicKey]);

  return {
    balance: fromLamports(nativeAccount?.lamports || 0, 9),
    balanceLamports: new BN(nativeAccount?.lamports || 0),
    hasBalance: nativeAccount?.lamports ? nativeAccount?.lamports > 0 : false,
    decimals: 9,
  };
};

export default useNativeAccount;
