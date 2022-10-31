import { JupiterProvider } from '@jup-ag/react-hook';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import React, { useMemo, useState } from 'react';
import { WRAPPED_SOL_MINT } from '../constants';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { AccountsProvider } from '../contexts/accounts';
import { useScreenState } from 'src/contexts/ScreenProvider';
import InitialScreen from './screens/InitialScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';
import { SwapContextProvider } from 'src/contexts/SwapContext';
import { ROUTE_CACHE_DURATION } from 'src/misc/constants';
import SwappingScreen from './screens/SwappingScreen';


const Content = () => {
  const { screen, setScreen } = useScreenState();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const onClose = () => {
    window.Jupiter.close();
  }

  return (
    <div>
      <div className="flex flex-col h-screen max-h-[90vh] md:max-h-[600px] max-w-[448px] overflow-auto text-black relative bg-[#F3F5F6] rounded-lg z-50">
        {/* Header */}
        <Header setIsWalletModalOpen={setIsWalletModalOpen} />

        {screen === 'Initial' ? (
          // TODO: Read from init function
          <InitialScreen mint={WRAPPED_SOL_MINT} isWalletModalOpen={isWalletModalOpen} setIsWalletModalOpen={setIsWalletModalOpen} />
        ) : null}

        {screen === 'Confirmation' ? (<ConfirmationScreen />) : null}
        {screen === 'Swapping' ? (<SwappingScreen />) : null}

        {/* Footer */}
        <div className="mt-auto rounded-b-xl">
          <Footer />
        </div>
      </div>

      <div onClick={onClose} className="absolute w-screen h-screen top-0 left-0 z-1" />
    </div>
  )
}

const JupiterApp = () => {
  const { wallet } = useWallet();
  const { connection } = useConnection();

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey, [
    wallet?.adapter.publicKey,
  ]);

  return (
    <AccountsProvider>
      <JupiterProvider
        connection={connection}
        cluster={'mainnet-beta'}
        routeCacheDuration={ROUTE_CACHE_DURATION}
        wrapUnwrapSOL={false}
        userPublicKey={walletPublicKey || undefined}
      >
        <SwapContextProvider>
          <Content />
        </SwapContextProvider>
      </JupiterProvider>
    </AccountsProvider>
  );
};

export default JupiterApp;
