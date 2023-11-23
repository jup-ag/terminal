import BN from 'bn.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { useWalletPassThrough } from './WalletPassthroughProvider';
import { WRAPPED_SOL_MINT } from 'src/constants';
import { fromLamports } from 'src/misc/utils';
import { useConnection } from '@jup-ag/wallet-adapter';
import { useQuery } from '@tanstack/react-query';

const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

export interface IAccountsBalance {
  pubkey: PublicKey;
  balance: number;
  balanceLamports: BN;
  hasBalance: boolean;
  decimals: number;
}

interface IAccountContext {
  accounts: Record<string, IAccountsBalance>;
  loading: boolean;
  refresh: () => void;
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
  loading: true,
  refresh: () => {},
});

const AccountsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { publicKey, connected } = useWalletPassThrough();
  const { connection } = useConnection();

  const fetchNative = useCallback(async () => {
    if (!publicKey || !connected) return null;

    const response = await connection.getAccountInfo(publicKey);
    if (response) {
      return {
        pubkey: publicKey,
        balance: fromLamports(response?.lamports || 0, 9),
        balanceLamports: new BN(response?.lamports || 0),
        hasBalance: response?.lamports ? response?.lamports > 0 : false,
        decimals: 9,
      };
    }
  }, [publicKey, connected]);

  const fetchAllTokens = useCallback(async () => {
    if (!publicKey || !connected) return {};

    const [tokenAccounts, token2022Accounts] = await Promise.all(
      [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID].map((tokenProgramId) =>
        connection.getParsedTokenAccountsByOwner(publicKey, { programId: tokenProgramId }, 'confirmed'),
      ),
    );

    const reducedResult = [...tokenAccounts.value, ...token2022Accounts.value].reduce(
      (acc, item: ParsedTokenData) => {
        acc[item.account.data.parsed.info.mint] = {
          balance: item.account.data.parsed.info.tokenAmount.uiAmount,
          balanceLamports: new BN(0),
          pubkey: item.pubkey,
          hasBalance: item.account.data.parsed.info.tokenAmount.uiAmount > 0,
          decimals: item.account.data.parsed.info.tokenAmount.decimals,
        };
        return acc;
      },
      {} as Record<string, IAccountsBalance>,
    );

    return reducedResult;
  }, [publicKey, connected]);

  const {
    data: accounts,
    isLoading,
    refetch,
  } = useQuery<Record<string, IAccountsBalance>>(
    ['accounts', publicKey],
    async () => {
      // Fetch all tokens balance
      const [nativeAccount, accounts] = await Promise.all([fetchNative(), fetchAllTokens()]);
      return {
        ...accounts,
        ...(nativeAccount ? { [WRAPPED_SOL_MINT.toString()]: nativeAccount } : {}),
      };
    },
    {
      enabled: Boolean(publicKey?.toString() && connected),
      refetchInterval: 10_000,
    },
  );

  return (
    <AccountContext.Provider value={{ accounts: accounts || {}, loading: isLoading, refresh: refetch }}>
      {children}
    </AccountContext.Provider>
  );
};

const useAccounts = () => {
  return useContext(AccountContext);
};

export { AccountsProvider, useAccounts };
