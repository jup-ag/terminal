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
import { PreferredExplorerProvider } from './preferredExplorer';
import { IInit } from 'src/types';

const WalletContextProvider: FC<{ endpoint?: string; children: ReactNode }> = ({ endpoint, children }) => {
  const { autoConnect } = useAutoConnect();
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;
  const selectedEndpoint: string = useMemo(() => endpoint ?? clusterApiUrl(network), [network]);

  const enableWalletPassthrough = (() => {
    if (typeof window === 'undefined') return undefined;
    return window.Jupiter.enableWalletPassthrough;
  })();

  const wallets = useMemo(() => {
    if (enableWalletPassthrough) {
      return [];
    }

    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new GlowWalletAdapter(),
    ];
  }, [network]);

  const onError = useCallback((error: WalletError) => {
    console.error({ type: 'error', message: error.message ? `${error.name}: ${error.message}` : error.name });
  }, []);

  const ShouldWrapWalletProvider = enableWalletPassthrough ? React.Fragment : ({ children }: { children: ReactNode }) => <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>{children}</WalletProvider>;

  return (
    <ConnectionProvider endpoint={selectedEndpoint}>
      <ShouldWrapWalletProvider>
        {children}
      </ShouldWrapWalletProvider>
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
