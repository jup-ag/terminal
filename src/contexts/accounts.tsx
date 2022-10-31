import BN from 'bn.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';

export interface IAccountsBalance {
  balance: number;
  balanceLamports: BN;
  hasBalance: boolean;
  decimals: number;
}

interface IAccountContext {
  accounts: Record<string, IAccountsBalance>;
}

interface ParsedTokenData {
  account: {
    data: {
      parsed: {
        info: {
          isNative: boolean;
          mint: string;
          owner: string;
          state: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number;
            uiAmountString: string;
          };
        };
        type: string;
      };
      program: string;
      space: number;
    };
    executable: boolean;
    lamports: number;
    owner: PublicKey;
    rentEpoch?: number;
  };
  pubkey: PublicKey;
}

const AccountContext = React.createContext<IAccountContext>({
  accounts: {},
});

const AccountsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [accounts, setAccounts] = useState<Record<string, IAccountsBalance>>(
    {},
  );

  // Fetch all accounts for the current wallet
  useEffect(() => {
    if (!publicKey) return;

    connection
      .getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID },
        'confirmed',
      )
      .then(({ value: result }) => {
        const reducedResult = result.reduce((acc, item: ParsedTokenData) => {
          acc[item.account.data.parsed.info.mint] = {
            balance: item.account.data.parsed.info.tokenAmount.uiAmount,
            balanceLamports: new BN(0),
            hasBalance: item.account.data.parsed.info.tokenAmount.uiAmount > 0,
            decimals: item.account.data.parsed.info.tokenAmount.decimals,
          };
          return acc;
        }, {} as Record<string, IAccountsBalance>);

        setAccounts(reducedResult);
      });
  }, [publicKey]);

  return (
    <AccountContext.Provider value={{ accounts }}>
      {children}
    </AccountContext.Provider>
  );
};

const useAccounts = () => {
  return useContext(AccountContext);
};

export { AccountsProvider, useAccounts };
