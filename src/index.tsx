import React from 'react';

import JupiterApp from './components/Jupiter';
import { ContextProvider } from './contexts/ContextProvider';
import { ScreenProvider } from './contexts/ScreenProvider';
import { TokenContextProvider } from './contexts/TokenContextProvider';
import WalletPassthroughProvider from './contexts/WalletPassthroughProvider';
import { IInit } from './types';
import { Provider } from 'jotai';

const RenderJupiter = (props: IInit) => {
  return (
    <Provider store={typeof window !== 'undefined' ? window.Jupiter.store : undefined}>
      <ContextProvider {...props}>
        <WalletPassthroughProvider>
          <TokenContextProvider {...props}>
            <ScreenProvider>
              <JupiterApp {...props} />
            </ScreenProvider>
          </TokenContextProvider>
        </WalletPassthroughProvider>
      </ContextProvider>
    </Provider>
  );
};

export { RenderJupiter };
