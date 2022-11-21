import React from 'react';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  BackpackWalletAdapter,
  CoinbaseWalletAdapter,
  ExodusWalletAdapter,
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';
import { NetworkConfigurationProvider, useNetworkConfiguration } from './NetworkConfigurationProvider';

const WalletContextProvider: FC<{ endpoint?: string, children: ReactNode }> = ({ endpoint, children }) => {
  const { autoConnect } = useAutoConnect();
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;
  const selectedEndpoint = useMemo(() => endpoint ?? clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new SlopeWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new ExodusWalletAdapter(),
      new SolletWalletAdapter(),
      new GlowWalletAdapter(),
    ],
    [network]
  );

  const onError = useCallback(
    (error: WalletError) => {
      console.error({ type: 'error', message: error.message ? `${error.name}: ${error.message}` : error.name });
    },
    []
  );

  return (
    <ConnectionProvider endpoint={selectedEndpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FC<{ endpoint?: string, children: ReactNode }> = ({ endpoint, children }) => {
  return (
    <>
      <NetworkConfigurationProvider>
        <AutoConnectProvider>
          <WalletContextProvider endpoint={endpoint}>{children}</WalletContextProvider>
        </AutoConnectProvider>
      </NetworkConfigurationProvider>
    </>
  );
};