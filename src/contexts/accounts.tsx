import { useConnection, useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { AccountLayout, TOKEN_PROGRAM_ID, Token, AccountInfo as TokenAccountInfo, u64 } from '@solana/spl-token';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import BN from 'bn.js';
import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { WRAPPED_SOL_MINT } from 'src/constants';
import { fromLamports, getAssociatedTokenAddressSync } from 'src/misc/utils';
import { useWalletPassThrough } from './WalletPassthroughProvider';
import Decimal from 'decimal.js';
import { useTerminalInView } from 'src/stores/jotai-terminal-in-view';

const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

export interface IAccountsBalance {
  pubkey: PublicKey;
  balance: string;
  balanceLamports: BN;
  decimals: number;
  isFrozen: boolean;
}

interface IAccountContext {
  accounts: Record<string, IAccountsBalance>;
  nativeAccount: IAccountsBalance | null | undefined;
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
          state: number;
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
  nativeAccount: undefined,
  loading: true,
  refresh: () => {},
});

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
  info: TokenAccountInfo;
}

export function wrapNativeAccount(pubkey: PublicKey, account: AccountInfo<Buffer>): TokenAccount | undefined {
  if (!account) {
    return undefined;
  }

  return {
    pubkey: pubkey,
    account,
    info: {
      address: pubkey,
      mint: WRAPPED_SOL_MINT,
      owner: pubkey,
      amount: new u64(account.lamports.toString()),
      delegate: null,
      delegatedAmount: new u64(0),
      isInitialized: true,
      isFrozen: false,
      isNative: true,
      rentExemptReserve: null,
      closeAuthority: null,
    },
  };
}

const deserializeAccount = (data: Buffer) => {
  if (data == undefined || data.length == 0) {
    return undefined;
  }
  const accountInfo = AccountLayout.decode(data);
  accountInfo.mint = new PublicKey(accountInfo.mint);
  accountInfo.owner = new PublicKey(accountInfo.owner);
  accountInfo.amount = u64.fromBuffer(accountInfo.amount);
  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null;
    accountInfo.delegatedAmount = new u64(0);
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate);
    accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount);
  }
  accountInfo.isInitialized = accountInfo.state !== 0;
  accountInfo.isFrozen = accountInfo.state === 2;
  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative);
    accountInfo.isNative = true;
  } else {
    accountInfo.rentExemptReserve = null;
    accountInfo.isNative = false;
  }
  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null;
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
  }
  return accountInfo;
};

export const TokenAccountParser = (
  pubkey: PublicKey,
  info: AccountInfo<Buffer>,
  programId: PublicKey,
): TokenAccount | undefined => {
  const tokenAccountInfo = deserializeAccount(info.data);

  if (!tokenAccountInfo) return;
  return {
    pubkey,
    account: info,
    info: tokenAccountInfo,
  };
};

type AccountsProviderProps = PropsWithChildren<{
  refetchInterval?: number;
}>;

const AccountsProvider: React.FC<AccountsProviderProps> = ({ children, refetchInterval = 3_000 }) => {
  const { publicKey, connected } = useWalletPassThrough();
  const { connection } = useConnection();
  const { terminalInView } = useTerminalInView();

  React.useEffect(() => console.log('terminalInView', terminalInView), [terminalInView]);

  const fetchNative = useCallback(async () => {
    if (!publicKey || !connected) return null;

    const response = await connection.getAccountInfo(publicKey);
    if (response) {
      return {
        pubkey: publicKey,
        balance: new Decimal(fromLamports(response?.lamports || 0, 9)).toString(),
        balanceLamports: new BN(response?.lamports || 0),
        decimals: 9,
        isFrozen: false,
      };
    }
  }, [publicKey, connected, connection]);

  const fetchAllTokens = useCallback(async () => {
    if (!publicKey || !connected) return {};

    const [tokenAccounts, token2022Accounts] = await Promise.all(
      [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID].map((tokenProgramId) =>
        connection.getParsedTokenAccountsByOwner(publicKey, { programId: tokenProgramId }, 'confirmed'),
      ),
    );

    const reducedResult = [...tokenAccounts.value, ...token2022Accounts.value].reduce(
      (acc, item: ParsedTokenData) => {
        // Only allow standard TOKEN_PROGRAM_ID ATA
        const expectedAta = getAssociatedTokenAddressSync(new PublicKey(item.account.data.parsed.info.mint), publicKey);
        if (!expectedAta.equals(item.pubkey)) return acc;

        acc[item.account.data.parsed.info.mint] = {
          balance: item.account.data.parsed.info.tokenAmount.uiAmountString,
          balanceLamports: new BN(item.account.data.parsed.info.tokenAmount.amount),
          pubkey: item.pubkey,
          decimals: item.account.data.parsed.info.tokenAmount.decimals,
          isFrozen: item.account.data.parsed.info.state === 2, // 2 is frozen
        };
        return acc;
      },
      {} as Record<string, IAccountsBalance>,
    );

    return reducedResult;
  }, [publicKey, connected, connection]);

  const { data, isLoading, refetch } = useQuery<{
    nativeAccount: IAccountsBalance | null | undefined;
    accounts: Record<string, IAccountsBalance>;
  }>(
    ['accounts', publicKey?.toString()],
    async () => {
      // Fetch all tokens balance
      const [nativeAccount, accounts] = await Promise.all([fetchNative(), fetchAllTokens()]);

      return {
        nativeAccount,
        accounts,
      };
    },
    {
      enabled: Boolean(publicKey?.toString() && connected && terminalInView),
      refetchInterval,
      refetchIntervalInBackground: false,
    },
  );

  return (
    <AccountContext.Provider
      value={{
        accounts: data?.accounts || {},
        nativeAccount: data?.nativeAccount,
        loading: isLoading,
        refresh: refetch,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

const useAccounts = () => {
  return useContext(AccountContext);
};

export { AccountsProvider, useAccounts };
