import { Cluster } from '@solana/web3.js';
import React, { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { ENV as ChainID, TokenInfo, TokenListContainer } from '@solana/spl-token-registry';
import { TOKEN_LIST_URL } from '@jup-ag/react-hook';
import { useConnection } from '@solana/wallet-adapter-react';
import { IInit } from 'src/types';

export type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';
export const CLUSTER_TO_CHAIN_ID: Record<ENV, ChainID> = {
  'mainnet-beta': ChainID.MainnetBeta,
  testnet: ChainID.Testnet,
  devnet: ChainID.Devnet,
  localnet: ChainID.Devnet,
};
export type PreferredTokenListMode = 'all' | 'strict';

const TokenContext = React.createContext<{
  tokenMap: Map<string, TokenInfo>;
  isLoaded: boolean;
  preferredTokenListMode: PreferredTokenListMode;
  setPreferredTokenListMode: (val: PreferredTokenListMode) => void;
}>({
  tokenMap: new Map(),
  isLoaded: false,
  preferredTokenListMode: 'strict',
  setPreferredTokenListMode() {},
});

const fetchAllMints = async (env: ENV, preferredTokenListMode: PreferredTokenListMode) => {
  const tokens = await (
    preferredTokenListMode === 'strict' ? await fetch('https://token.jup.ag/strict') : await fetch('https://token.jup.ag/all')
  ).json();
  const res = new TokenListContainer(tokens);
  const list = res.filterByChainId(CLUSTER_TO_CHAIN_ID[env]).getList();

  return list.reduce((acc, item) => {
    acc.set(item.address, item);
    return acc;
  }, new Map());
};

export function TokenContextProvider({ strictTokenList, children }: IInit & { children: ReactNode }) {
  const { connection } = useConnection();
  const defaultPreferredTokenListMode = useMemo(() => {
    if (typeof strictTokenList === 'undefined') return 'strict';
    return strictTokenList ? 'strict' : 'all';
  }, [strictTokenList])
  const [preferredTokenListMode, setPreferredTokenListMode] = useState<PreferredTokenListMode>(defaultPreferredTokenListMode);

  const [{ tokenMap, isLoaded }, setState] = useState({
    isLoaded: false,
    tokenMap: new Map<string, TokenInfo>(),
  });
  const cluster = 'mainnet-beta';

  useEffect(() => {
    fetchAllMints(cluster, preferredTokenListMode).then(async (tokenMap) => {
      setState({
        isLoaded: true,
        tokenMap,
      });
    });
  }, [connection, preferredTokenListMode]);

  return (
    <TokenContext.Provider value={{ tokenMap, isLoaded, preferredTokenListMode, setPreferredTokenListMode }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenContext() {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('TokenContext not found');
  }

  return context;
}
