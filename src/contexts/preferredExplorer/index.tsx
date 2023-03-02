import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Cluster } from '@solana/web3.js';
import { DEFAULT_EXPLORER, IInit } from 'src/types';

export const AVAILABLE_EXPLORER: {
  name: DEFAULT_EXPLORER;
  url: string;
  get: (txid: string, cluster?: Cluster) => string;
  getToken: (mint: string, cluster?: Cluster) => string;
}[] = [
    {
      name: 'Solana Explorer',
      url: 'https://explorer.solana.com/',
      get: (txid: string, cluster: Cluster = 'mainnet-beta') => {
        if (cluster !== 'mainnet-beta') return `https://explorer.solana.com/tx/${txid}?cluster=${cluster}`;
        return `https://explorer.solana.com/tx/${txid}`;
      },
      getToken: (mint: string, cluster: Cluster = 'mainnet-beta') => {
        if (cluster !== 'mainnet-beta') return `https://explorer.solana.com/address/${mint}?cluster=${cluster}`;
        return `https://explorer.solana.com/address/${mint}`;
      },
    },
    {
      name: 'Solscan',
      url: 'https://solscan.io/',
      get: (txid: string, cluster: Cluster = 'mainnet-beta') => {
        if (cluster !== 'mainnet-beta') return `https://solscan.io/tx/${txid}?cluster=${cluster}`;
        return `https://solscan.io/tx/${txid}`;
      },
      getToken: (mint: string, cluster: Cluster = 'mainnet-beta') => {
        if (cluster !== 'mainnet-beta') return `https://solscan.io/token/${mint}?cluster=${cluster}`;
        return `https://solscan.io/token/${mint}`;
      },
    },
    {
      name: 'Solana Beach',
      url: 'https://solanabeach.io/',
      get: (txid: string, cluster: Cluster = 'mainnet-beta') => {
        if (cluster !== 'mainnet-beta') return `https://solanabeach.io/transaction/${txid}?cluster=${cluster}`;
        return `https://solanabeach.io/transaction/${txid}`;
      },
      getToken: (mint: string, cluster: Cluster = 'mainnet-beta') => {
        if (cluster !== 'mainnet-beta') return `https://solanabeach.io/address/${mint}?cluster=${cluster}`;
        return `https://solanabeach.io/address/${mint}`;
      },
    },
    {
      name: 'SolanaFM',
      url: 'https://solana.fm/',
      get: (txid: string, cluster: Cluster = 'mainnet-beta') => {
        if (cluster === 'devnet') return `https://solana.fm/tx/${txid}?cluster=devnet-solana`;
        if (cluster === 'testnet') return `https://solana.fm/tx/${txid}?cluster=testnet-qn1`;
        return `https://solana.fm/tx/${txid}`;
      },
      getToken: (mint: string, cluster: Cluster = 'mainnet-beta') => {
        if (cluster === 'devnet') return `https://solana.fm/address/${mint}?cluster=devnet-solana`;
        if (cluster === 'testnet') return `https://solana.fm/address/${mint}?cluster=testnet-qn1`;
        return `https://solana.fm/address/${mint}`;
      },
    },
  ];

export interface PreferredExplorer {
  name: string;
  url: string;
  get: (txid: string, cluster?: Cluster) => string;
}

const PreferredExplorerContext = createContext<{
  explorer: string;
  getExplorer: (txid: string, cluster?: Cluster) => string;
  getTokenExplorer: (mint: string, cluster?: Cluster) => string;
  setExplorer: (explorer: DEFAULT_EXPLORER) => void;
}>({
  explorer: AVAILABLE_EXPLORER[0].name,
  getExplorer: (txid: string, cluster?: Cluster) => '',
  getTokenExplorer: (mint: string, cluster?: Cluster) => '',
  setExplorer: (explorer: DEFAULT_EXPLORER) => { },
});

const PreferredExplorerProvider = ({
  defaultExplorer,
  children,
}: {
  defaultExplorer: IInit['defaultExplorer'];
  children: ReactNode;
}) => {
  const [explorer, setExplorer] = useState(defaultExplorer ?? AVAILABLE_EXPLORER[0].name);

  const explorerObject = useMemo(() => {
    return AVAILABLE_EXPLORER.find((e) => e.name === explorer) || AVAILABLE_EXPLORER[0];
  }, [explorer]);

  const getExplorer = useCallback(
    (txid: string, cluster?: Cluster) => explorerObject.get(txid, cluster),
    [explorerObject],
  );
  const getTokenExplorer = useCallback(
    (mint: string, cluster?: Cluster) => explorerObject.getToken(mint, cluster),
    [explorerObject],
  );

  return (
    <PreferredExplorerContext.Provider
      value={{ explorer, getExplorer, getTokenExplorer, setExplorer: (explorer: DEFAULT_EXPLORER) => setExplorer(explorer) }}
    >
      {children}
    </PreferredExplorerContext.Provider>
  );
};

function usePreferredExplorer() {
  const context = useContext(PreferredExplorerContext);
  return context;
}

export { PreferredExplorerProvider, usePreferredExplorer };
