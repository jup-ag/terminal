import { Cluster } from '@solana/web3.js';
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { ENV as ChainID, TokenInfo, TokenListContainer } from '@solana/spl-token-registry';
import { TOKEN_LIST_URL } from '@jup-ag/react-hook';
import { useConnection } from '@solana/wallet-adapter-react';

export type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';
export const CLUSTER_TO_CHAIN_ID: Record<ENV, ChainID> = {
  'mainnet-beta': ChainID.MainnetBeta,
  testnet: ChainID.Testnet,
  devnet: ChainID.Devnet,
  localnet: ChainID.Devnet,
};

const TokenContext = React.createContext<{ tokenMap: Map<string, TokenInfo>; isLoaded: boolean }>({
  tokenMap: new Map(),
  isLoaded: false,
});
const WORKER_ENDPOINT = 'https://preprod-cache.jup.ag';

const fetchAllMints = async (env: ENV) => {
  const tokens = await (
    await fetch(new URL(new URL(TOKEN_LIST_URL[env as Cluster]).pathname, WORKER_ENDPOINT).href)
  ).json();
  const res = new TokenListContainer(tokens);
  const list = res.filterByChainId(CLUSTER_TO_CHAIN_ID[env]).getList();

  return list.reduce((acc, item) => {
    acc.set(item.address, item);
    return acc;
  }, new Map());
};

export function TokenContextProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();

  const [{ tokenMap, isLoaded }, setState] = useState({
    isLoaded: false,
    tokenMap: new Map<string, TokenInfo>(),
  });
  const cluster = 'mainnet-beta';

  useEffect(() => {
    fetchAllMints(cluster).then(async (tokenMap) => {
      setState({
        isLoaded: true,
        tokenMap,
      });
    });
  }, [connection]);

  return <TokenContext.Provider value={{ tokenMap, isLoaded }}>{children}</TokenContext.Provider>;
}

export function useTokenContext() {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('TokenContext not found');
  }

  return context;
}
