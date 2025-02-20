import { ConnectionContext, UnifiedWalletProvider, WalletAdapterNetwork, WalletName } from '@jup-ag/wallet-adapter';
import React, { PropsWithChildren, useState } from 'react';

import { Connection } from '@solana/web3.js';
import { ReactNode, useMemo } from 'react';
import { IInit } from 'src/types';
import { NetworkConfigurationProvider } from './NetworkConfigurationProvider';
import { PreferredExplorerProvider } from './preferredExplorer';
import { IWalletNotification } from '@jup-ag/wallet-adapter/dist/types/contexts/WalletConnectionProvider';

const noop = () => {};
const WalletContextProvider: React.FC<PropsWithChildren<IInit>> = ({
  autoConnect,
  endpoint,
  connectionObj,
  children,
}) => {
  const enableWalletPassthrough = (() => {
    if (typeof window === 'undefined') return undefined;
    return window.Jupiter.enableWalletPassthrough;
  })();

  const wallets = useMemo(() => {
    if (enableWalletPassthrough) {
      return [];
    }

    return [];
  }, [enableWalletPassthrough]);

  const [showWalletStatus, setShowWalletStatus] = useState<{
    show: boolean;
    message: ReactNode;
  }>({
    show: false,
    message: '',
  });

  const ShouldWrapWalletProvider = useMemo(() => {
    return enableWalletPassthrough
      ? React.Fragment
      : ({ children }: { children: ReactNode }) => (
          <UnifiedWalletProvider
            wallets={wallets}
            config={{
              env: 'mainnet-beta',
              autoConnect: typeof autoConnect !== 'undefined' ? autoConnect : true,
              metadata: {
                name: 'Jupiter Terminal',
                url: 'https://terminal.jup.ag',
                description:
                  'An open-sourced, lite version of Jupiter that provides end-to-end swap flow by linking it in your HTML. Check out the visual demo for the various integration modes below.          ',
                iconUrls: [],
              },
              hardcodedWallets: [],
              walletPrecedence: [],
              notificationCallback: {
                onConnect: noop,
                onConnecting: noop,
                onDisconnect: noop,
                onNotInstalled: ({ walletName, metadata }: IWalletNotification) => {
                  setShowWalletStatus({
                    show: true,
                    message: (
                      <p className="space-y-1">
                        {walletName} is not installed.
                        <p className="space-x-1">
                          <a
                            className="underline font-semibold"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={metadata.url}
                          >
                            Visit {walletName} website
                          </a>
                          <span>to install it.</span>
                        </p>
                      </p>
                    ),
                  });

                  setTimeout(() => {
                    setShowWalletStatus({
                      show: false,
                      message: '',
                    });
                  }, 5_000);
                },
              },
              theme: 'jupiter',
            }}
          >
            {children}
          </UnifiedWalletProvider>
        );
  }, [autoConnect, enableWalletPassthrough, wallets]);

  const connection = useMemo(() => {
    const unpatchedConnection = (() => {
      if (endpoint) return new Connection(endpoint);
      if (connectionObj) return connectionObj;
    })();

    // Patch pre-2.0 and 2.0 RPC getLatestBlockhash being invalid
    if (unpatchedConnection) {
      return new Proxy(unpatchedConnection, {
        get: (target, prop, receiver) => {
          switch (prop) {
            case '_rpcRequest': {
              return async (...args: any[]) => {
                const [rpcMethod] = args;

                if (rpcMethod === 'getLatestBlockhash') {
                  // @ts-expect-error
                  const response: GetLatestBlockhashResponse = await target[prop](...args);

                  const apiVersion = response?.result?.context?.apiVersion;
                  const lastValidBlockHeight = response?.result?.value?.lastValidBlockHeight;
                  const modifiedLastValidBlockHeight = apiVersion.startsWith('2')
                    ? lastValidBlockHeight
                    : lastValidBlockHeight - 150;

                  return Promise.resolve({
                    ...response,
                    // Note: Function expecting string, but after parse we get number
                    id: response.id.toString(),
                    result: {
                      ...response.result,
                      value: {
                        ...response.result.value,
                        lastValidBlockHeight: Number(modifiedLastValidBlockHeight),
                      },
                    },
                  });
                }

                // @ts-expect-error
                return target[prop](...args);
              };
            }
          }

          return Reflect.get(target, prop, receiver);
        },
      });
    }

    throw new Error('No connection object or endpoint provided');
  }, [connectionObj, endpoint]);

  return (
    <>
      <ConnectionContext.Provider value={{ connection }}>
        <ShouldWrapWalletProvider>{children}</ShouldWrapWalletProvider>
      </ConnectionContext.Provider>
      {showWalletStatus.show && showWalletStatus.message ? (
        <div className="absolute bottom-2 w-full px-2">
          <div className="w-full h-full bg-white/10 rounded-lg p-2 text-warning text-xs">
            {showWalletStatus.message}
          </div>
        </div>
      ) : null}
    </>
  );
};

export const ContextProvider: React.FC<PropsWithChildren<IInit>> = (props) => {
  return (
    <>
      <NetworkConfigurationProvider>
        <WalletContextProvider {...props}>
          <PreferredExplorerProvider defaultExplorer={props.defaultExplorer}>
            {props.children}
          </PreferredExplorerProvider>
        </WalletContextProvider>
      </NetworkConfigurationProvider>
    </>
  );
};
