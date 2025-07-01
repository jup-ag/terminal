
import { AccountLayout, TOKEN_PROGRAM_ID, AccountInfo as TokenAccountInfo, u64 } from '@solana/spl-token';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import BN from 'bn.js';
import React, {  useContext, useMemo } from 'react';
import { WRAPPED_SOL_MINT } from 'src/constants';
import {  getAssociatedTokenAddressSync } from 'src/misc/utils';
import { useWalletPassThrough } from './WalletPassthroughProvider';
import Decimal from 'decimal.js';
import { getTerminalInView } from 'src/stores/jotai-terminal-in-view';
import { ultraSwapService } from 'src/data/UltraSwapService';
import { useTokenContext } from './TokenContextProvider';
import { SOL_TOKEN_INFO } from 'src/misc/constants';
import { checkIsToken2022 } from 'src/misc/tokenTags';

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

type AccountsProviderProps = { children: React.ReactNode };

const AccountsProvider: React.FC<AccountsProviderProps> = ({ children }) => {
  const { publicKey, connected } = useWalletPassThrough();
  const { requestTokenInfo, getTokenInfo } = useTokenContext();

  const address = useMemo(() => {
    if (!publicKey) return null;
    return publicKey.toString();
  }, [publicKey]);

  const {
    data: balanceResponse,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['fetchAllAccounts', address],
    queryFn: async ({signal}) => {
      if (!address) {
        return new Map<string, TokenAccount>();
      }
      const result = await ultraSwapService.getBalance(address, signal);

      const tokenAccountsWithoutNativeSol = Object.keys(result).filter((key) => key !== SOL_TOKEN_INFO.symbol);
      await requestTokenInfo(tokenAccountsWithoutNativeSol);
      return result;
    },
    enabled: !!address && connected && getTerminalInView(),
    cacheTime: 20_000,
    staleTime: 20_000,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
  });
  const nativeAccount: IAccountsBalance | null = useMemo(() => {
    if (balanceResponse && publicKey) {
      const entries = Object.entries(balanceResponse);
      const nativeAccount = entries.find(([mint, balance]) => mint === SOL_TOKEN_INFO.symbol);
      const tokenAta = getAssociatedTokenAddressSync(WRAPPED_SOL_MINT, publicKey, TOKEN_PROGRAM_ID);
      if (nativeAccount) {
        const [key, value] = nativeAccount;
        const acc: IAccountsBalance = {
          balance: new Decimal(value.amount).div(10 ** SOL_TOKEN_INFO.decimals).toFixed(),
          balanceLamports: new BN(value.amount),
          pubkey: tokenAta,
          decimals: SOL_TOKEN_INFO.decimals,
          isFrozen: value.isFrozen,
        };
        return acc;
      }
    }
    return null;
  }, [balanceResponse, publicKey]);

  const accounts = useMemo(() => {
    const accounts: Record<string, IAccountsBalance> = {};
    if (balanceResponse && publicKey) {
      const entries = Object.entries(balanceResponse);
      entries.forEach(([mint, mintInfo]) => {
        const tokenInfo = getTokenInfo(mint);
        if (!tokenInfo) return;
        const tokenMint = new PublicKey(mint);
        const isToken2022 = checkIsToken2022(tokenInfo);
        const programID = isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
        const tokenAta = getAssociatedTokenAddressSync(tokenMint, publicKey, programID);
        
        accounts[mint] = {
          balance: new Decimal(mintInfo.amount).div(10 ** tokenInfo.decimals).toFixed(),
          balanceLamports: new BN(mintInfo.amount),
          pubkey: tokenAta,
          decimals: tokenInfo.decimals,
          isFrozen: mintInfo.isFrozen,
        };
      });
    }
    return accounts;
  }, [balanceResponse, getTokenInfo, publicKey]);

  return (
    <AccountContext.Provider
      value={{
        accounts: accounts || {},
        nativeAccount: nativeAccount,
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
