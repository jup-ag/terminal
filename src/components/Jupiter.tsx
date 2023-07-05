import { JupiterProvider } from '@jup-ag/react-hook';
import { useConnection } from '@solana/wallet-adapter-react';
import React, { useMemo, useState, useEffect } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { useScreenState } from 'src/contexts/ScreenProvider';
import { SwapContextProvider } from 'src/contexts/SwapContext';
import { ROUTE_CACHE_DURATION } from 'src/misc/constants';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import { IInit } from 'src/types';
import { SlippageConfigProvider } from 'src/contexts/SlippageConfigProvider';
import { USDValueProvider } from 'src/contexts/USDValueProvider';

import Header from '../components/Header';
import { AccountsProvider } from '../contexts/accounts';
import InitialScreen from './screens/InitialScreen';
import ReviewOrderScreen from './screens/ReviewOrderScreen';
import SwappingScreen from './screens/SwappingScreen';

const Content = () => {
  const { screen } = useScreenState();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { wallet, connected } = useWalletPassThrough();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);

  const [mercuryoRedirectURL, setMercuryoRedirectURL] = useState('')

  useEffect(() => {
    if (!walletPublicKey) {
      setMercuryoRedirectURL('');
      return;
    }

    (async () => {
      const queryParams = new URLSearchParams({
        widget_id: '9df1f243-4895-4dff-9b07-79fb9723c77b',
        type: 'buy',
        currency: 'SOL',
        network: 'SOLANA',
        fix_currency: 'true',
        address: walletPublicKey.toString(),
      });
  
      const originalUrl = `https://exchange.mercuryo.io?${queryParams.toString()}`;
      const getSignatureResponse = await fetch('/api/generateMercuryo', { method: 'POST', body: walletPublicKey.toString() });
      const signature = await getSignatureResponse.json();
  
      setMercuryoRedirectURL(`${originalUrl}&signature=${signature.result}`)
    })()
  }, [walletPublicKey])

  return (
    <>
      {screen === 'Initial' ? (
        <>
          <Header setIsWalletModalOpen={setIsWalletModalOpen} />
          <InitialScreen isWalletModalOpen={isWalletModalOpen} setIsWalletModalOpen={setIsWalletModalOpen} />
        </>
      ) : null}

      {screen === 'Confirmation' ? <ReviewOrderScreen /> : null}
      {screen === 'Swapping' ? <SwappingScreen /> : null}

      {connected && mercuryoRedirectURL ? (
        <a
          href={mercuryoRedirectURL}
          className="text-white text-xs rounded-lg border border-white/10 absolute bottom-4 left-4 flex px-2 py-1 font-semibold cursor-pointer"
        >
          {'Buy'}
        </a>
      ) : null}
    </>
  );
};

const queryClient = new QueryClient();

const JupiterApp = (props: IInit) => {
  const { displayMode, platformFeeAndAccounts, formProps } = props;
  const { connection } = useConnection();
  const { wallet } = useWalletPassThrough();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey, [wallet?.adapter.publicKey]);

  const [asLegacyTransaction, setAsLegacyTransaction] = useState(true);
  // Auto detech if wallet supports it, and enable it if it does
  useEffect(() => {
    if (wallet?.adapter?.supportedTransactionVersions?.has(0)) {
      setAsLegacyTransaction(false);
      return;
    }
    setAsLegacyTransaction(true);
  }, [wallet?.adapter]);

  return (
    <QueryClientProvider client={queryClient}>
      <AccountsProvider>
        <SlippageConfigProvider>
          <JupiterProvider
            connection={connection}
            routeCacheDuration={ROUTE_CACHE_DURATION}
            wrapUnwrapSOL={true}
            userPublicKey={walletPublicKey || undefined}
            platformFeeAndAccounts={platformFeeAndAccounts}
            asLegacyTransaction={asLegacyTransaction}
          >
            <SwapContextProvider
              displayMode={displayMode}
              formProps={formProps}
              scriptDomain={props.scriptDomain}
              asLegacyTransaction={asLegacyTransaction}
              setAsLegacyTransaction={setAsLegacyTransaction}
            >
              <USDValueProvider>
                <Content />
              </USDValueProvider>
            </SwapContextProvider>
          </JupiterProvider>
        </SlippageConfigProvider>
      </AccountsProvider>
    </QueryClientProvider>
  );
};

export default JupiterApp;
