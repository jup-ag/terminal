
import { useEffect, useMemo, useState } from 'react';

import { useScreenState } from 'src/contexts/ScreenProvider';
import { SwapContextProvider } from 'src/contexts/SwapContext';
import { USDValueProvider } from 'src/contexts/USDValueProvider';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import { ROUTE_CACHE_DURATION } from 'src/misc/constants';
import { IInit } from 'src/types';

import { PublicKey } from '@solana/web3.js';
import CloseIcon from 'src/icons/CloseIcon';
import Header from '../components/Header';
import { AccountsProvider } from '../contexts/accounts';
import InitialScreen from './screens/InitialScreen';
import ReviewOrderScreen from './screens/ReviewOrderScreen';
import SwappingScreen from './screens/SwappingScreen';

const Content = () => {
  const { screen } = useScreenState();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

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
    </div>
  );
};

const JupiterApp = (props: IInit) => {
  return (
    <AccountsProvider>
      <SwapContextProvider {...props}>
        <USDValueProvider {...props}>
          <Content />
        </USDValueProvider>
      </SwapContextProvider>
    </AccountsProvider>
  );
};

export default JupiterApp;
