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
    </>
  );
};

const queryClient = new QueryClient();

const JupiterApp = (props: IInit) => {
  const {
    displayMode,
    platformFeeAndAccounts,
    formProps,
  } = props;
  const { connection } = useConnection();
  const { wallet } = useWalletPassThrough();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey, [wallet?.adapter.publicKey]);

  const [asLegacyTransaction, setAsLegacyTransaction] = useState(true);
  // Auto detech if wallet supports it, and enable it if it does
  useEffect(() => {
    if (wallet?.adapter?.supportedTransactionVersions?.has(0)) {
      setAsLegacyTransaction(false)
      return;
    }
    setAsLegacyTransaction(true)
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
