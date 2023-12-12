import { JupiterProvider } from '@jup-ag/react-hook';
import { useConnection } from '@jup-ag/wallet-adapter';
import React, { useMemo, useState, useEffect } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { useScreenState } from 'src/contexts/ScreenProvider';
import { SwapContextProvider, useSwapContext } from 'src/contexts/SwapContext';
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
import useTPSMonitor from './RPCBenchmark/useTPSMonitor';
import CloseIcon from 'src/icons/CloseIcon';

const Content = () => {
  const { screen } = useScreenState();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { message } = useTPSMonitor();
  const [isMessageClosed, setIsMessageClosed] = useState(false);

  const {
    formProps: { darkMode },
  } = useSwapContext();

  return (
    <div className={`relative h-full ${darkMode ? '' : 'bg-white'}`}>
      {screen === 'Initial' ? (
        <>
          <Header setIsWalletModalOpen={setIsWalletModalOpen} />
          <InitialScreen isWalletModalOpen={isWalletModalOpen} setIsWalletModalOpen={setIsWalletModalOpen} />
        </>
      ) : null}

      {screen === 'Confirmation' ? <ReviewOrderScreen /> : null}
      {screen === 'Swapping' ? <SwappingScreen /> : null}

      {!isMessageClosed && message ? (
        <div className="absolute w-full px-3 py-2 bottom-1">
          <div className=" bg-[#FBA43A] rounded-xl flex items-center justify-between px-3 py-2">
            <div className="pr-2">{message}</div>
            <div className="cursor-pointer" onClick={() => setIsMessageClosed(true)}>
              <CloseIcon width={12} height={12} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const queryClient = new QueryClient();

const JupiterApp = (props: IInit) => {
  const { displayMode, platformFeeAndAccounts, formProps } = props;
  const { connection } = useConnection();
  const { wallet } = useWalletPassThrough();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey, [wallet?.adapter.publicKey]);

  const [asLegacyTransaction, setAsLegacyTransaction] = useState(false);
  // Auto detech if wallet supports it, and enable it if it does
  useEffect(() => {
    // So our user can preview the quote before connecting
    if (!wallet?.adapter) {
      return;
    }

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
