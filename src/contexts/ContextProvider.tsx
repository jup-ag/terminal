import React, { PropsWithChildren } from 'react';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

import { clusterApiUrl } from '@solana/web3.js';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';
import { NetworkConfigurationProvider, useNetworkConfiguration } from './NetworkConfigurationProvider';

// Built in wallets
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-wallets';
import { PreferredExplorerProvider } from './preferredExplorer';
import { IInit } from 'src/types';

const WalletContextProvider: FC<{ endpoint?: string; children: ReactNode }> = ({ endpoint, children }) => {
  const { autoConnect } = useAutoConnect();
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;
  const selectedEndpoint: string = useMemo(() => endpoint ?? clusterApiUrl(network), [network]);

  const passThroughWallet = (() => {
    if (typeof window === 'undefined') return undefined;
    return window.Jupiter.passThroughWallet;
  })();

  const wallets = useMemo(() => {
    if (passThroughWallet) {
      return [];
    }

    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new GlowWalletAdapter(),
      new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Mainnet,
        options: {
          relayUrl: 'wss://relay.walletconnect.com',
          projectId: '4a4e231c4004ef7b77076a87094fba61',
          metadata: {
            name: 'Jupiter Aggregator',
            description: 'Jupiter: The best swap aggregator on Solana.  Built for smart traders who like money.',
            url: 'https://jup.ag',
            icons: ['https://jup.ag/svg/jupiter-logo.svg'],
          },
        },
      }),
    ];
  }, [network]);

  const onError = useCallback((error: WalletError) => {
    console.error({ type: 'error', message: error.message ? `${error.name}: ${error.message}` : error.name });
  }, []);

  return (
    <ConnectionProvider endpoint={selectedEndpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: React.FC<PropsWithChildren<IInit>> = ({ endpoint, defaultExplorer, children }) => {
  return (
    <>
      <NetworkConfigurationProvider>
        <AutoConnectProvider>
          <WalletContextProvider endpoint={endpoint}>
            <PreferredExplorerProvider defaultExplorer={defaultExplorer}>
              {children}
            </PreferredExplorerProvider>
          </WalletContextProvider>
        </AutoConnectProvider>
      </NetworkConfigurationProvider>
    </>
  );
};
