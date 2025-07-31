import { useScreenState } from 'src/contexts/ScreenProvider';
import { SwapContextProvider } from 'src/contexts/SwapContext';
import { IInit } from 'src/types';

import Header from '../components/Header';
import InitialScreen from './screens/InitialScreen';
import ReviewOrderScreen from './screens/ReviewOrderScreen';
import SwappingScreen from './screens/SwappingScreen';
import WalletScreen from './screens/WalletScreen';
import JupiterLogoV2 from 'src/icons/JupiterLogoV2';
import { BrandingProvider } from 'src/contexts/BrandingProvider';

const Content = () => {
  const { screen } = useScreenState();

  // ID is required for scoped preflight by tailwind to work
  return (
    <div id="jupiter-plugin" className=" h-full bg-background relative flex flex-col justify-between">
      <div>
        {screen === 'Initial' ? (
          <>
            <Header />
            <InitialScreen />
          </>
        ) : null}
        {screen === 'Confirmation' ? <ReviewOrderScreen /> : null}
        {screen === 'Swapping' ? <SwappingScreen /> : null}
        {screen === 'Wallet' ? <WalletScreen /> : null}
      </div>
      <span className="text-primary-text/50 text-xs p-2 flex-row flex gap-1  justify-center">
        Powered by
        <a href={'https://jup.ag'} target={'_blank'} rel="noreferrer noopener" className="flex items-center gap-1 ">
          <JupiterLogoV2 className="text-primary-text/50" width={15} height={15} />
          Jupiter
        </a>
      </span>
    </div>
  );
};

const JupiterApp = (props: IInit) => {
  return (
    <SwapContextProvider {...props}>
      <BrandingProvider {...props}>
        <Content />
      </BrandingProvider>
    </SwapContextProvider>
  );
};

export default JupiterApp;
