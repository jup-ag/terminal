import React from 'react';

import JupiterApp from './components/Jupiter';
import { ContextProvider } from './contexts/ContextProvider';
import { ScreenProvider } from './contexts/ScreenProvider';
import { TokenContextProvider } from './contexts/TokenContextProvider';
import WalletPassthroughProvider from './contexts/WalletPassthroughProvider';
import { Provider, useAtom } from 'jotai';
import { appProps } from './library';

const App = () => {
  const [props] = useAtom(appProps);
  if (!props) return null;

  return (
    <ContextProvider {...props}>
      <WalletPassthroughProvider>
        <TokenContextProvider {...props}>
          <ScreenProvider>
            <JupiterApp {...props} />
          </ScreenProvider>
        </TokenContextProvider>
      </WalletPassthroughProvider>
    </ContextProvider>
  );
};

const RenderJupiter = () => {
  return (
    <Provider store={typeof window !== 'undefined' ? window.Jupiter.store : undefined}>
      <App />
    </Provider>
  );
};

export { RenderJupiter };
