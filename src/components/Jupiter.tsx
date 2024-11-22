import { JupiterProvider } from '@jup-ag/react-hook';
import { useConnection } from '@jup-ag/wallet-adapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { useScreenState } from 'src/contexts/ScreenProvider';
import { SwapContextProvider } from 'src/contexts/SwapContext';
import { USDValueProvider } from 'src/contexts/USDValueProvider';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import { ROUTE_CACHE_DURATION } from 'src/misc/constants';
import { IInit } from 'src/types';

import { PublicKey } from '@solana/web3.js';
import { PrioritizationFeeContextProvider } from 'src/contexts/PrioritizationFeeContextProvider';
import CloseIcon from 'src/icons/CloseIcon';
import Header from '../components/Header';
import { AccountsProvider } from '../contexts/accounts';
import useTPSMonitor from './RPCBenchmark/useTPSMonitor';
import InitialScreen from './screens/InitialScreen';
import ReviewOrderScreen from './screens/ReviewOrderScreen';
import SwappingScreen from './screens/SwappingScreen';

const Content = () => {
  const { screen } = useScreenState();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { message } = useTPSMonitor();
  const [isMessageClosed, setIsMessageClosed] = useState(false);

  // ID is required for scoped preflight by tailwind to work
  return (
    <div id="jupiter-terminal" className="relative h-full">
      {screen === 'Initial' ? (
        <>
          <Header setIsWalletModalOpen={setIsWalletModalOpen} />
          <InitialScreen isWalletModalOpen={isWalletModalOpen} setIsWalletModalOpen={setIsWalletModalOpen} />
        </>
      ) : null}

      {screen === 'Confirmation' ? <ReviewOrderScreen /> : null}
      {screen === 'Swapping' ? <SwappingScreen /> : null}

      {!isMessageClosed && message ? (
        <div className="absolute bottom-1 px-3 py-2 w-full">
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

const JupiterApp = (props: IInit) => {
  const { platformFeeAndAccounts: ogPlatformFeeAndAccounts, refetchIntervalForTokenAccounts } = props;
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

  const platformFeeAndAccounts = useMemo(() => {
    if (!ogPlatformFeeAndAccounts?.referralAccount || !ogPlatformFeeAndAccounts?.feeBps) return undefined;

    return {
      referralAccount: new PublicKey(ogPlatformFeeAndAccounts.referralAccount),
      feeBps: ogPlatformFeeAndAccounts?.feeBps,
      feeAccounts: ogPlatformFeeAndAccounts?.feeAccounts || new Map(),
    };
  }, [ogPlatformFeeAndAccounts]);

  return (
    <AccountsProvider refetchIntervalForTokenAccounts={refetchIntervalForTokenAccounts}>
      <JupiterProvider
        connection={connection}
        routeCacheDuration={ROUTE_CACHE_DURATION}
        wrapUnwrapSOL={true}
        userPublicKey={walletPublicKey || undefined}
        platformFeeAndAccounts={platformFeeAndAccounts}
        asLegacyTransaction={asLegacyTransaction}
      >
        <PrioritizationFeeContextProvider {...props}>
          <SwapContextProvider
            {...props}
            asLegacyTransaction={asLegacyTransaction}
            setAsLegacyTransaction={setAsLegacyTransaction}
          >
            <USDValueProvider {...props}>
              <Content />
            </USDValueProvider>
          </SwapContextProvider>
        </PrioritizationFeeContextProvider>
      </JupiterProvider>
    </AccountsProvider>
  );
};

export default JupiterApp;
