import React from 'react';

import JupiterApp from './components/Jupiter';
import { ContextProvider } from './contexts/ContextProvider';
import { ScreenProvider } from './contexts/ScreenProvider';
import { TokenContextProvider } from './contexts/TokenContextProvider';
import WalletPassthroughProvider from './contexts/WalletPassthroughProvider';
import { IInit } from './types';

const RenderJupiter = (props: IInit) => {
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

export { RenderJupiter };
