import { useConnection } from '@jup-ag/wallet-adapter';
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
  const { refetchIntervalForTokenAccounts } = props;
  const { wallet } = useWalletPassThrough();

  return (
    <AccountsProvider refetchIntervalForTokenAccounts={refetchIntervalForTokenAccounts}>
      <SwapContextProvider {...props}>
        <USDValueProvider {...props}>
          <Content />
        </USDValueProvider>
      </SwapContextProvider>
    </AccountsProvider>
  );
};

export default JupiterApp;
