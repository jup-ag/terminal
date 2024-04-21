import { Provider, useAtom } from 'jotai';
import JupiterApp from './components/Jupiter';
import { ContextProvider } from './contexts/ContextProvider';
import { PrioritizationFeeContextProvider } from './contexts/PrioritizationFeeContextProvider';
import { ScreenProvider } from './contexts/ScreenProvider';
import { TokenContextProvider } from './contexts/TokenContextProvider';
import WalletPassthroughProvider from './contexts/WalletPassthroughProvider';
import { appProps } from './library';

const App = () => {
  const [props] = useAtom(appProps);
  if (!props) return null;

  return (
    <ContextProvider {...props}>
      <WalletPassthroughProvider>
        <PrioritizationFeeContextProvider>
          <TokenContextProvider {...props}>
            <ScreenProvider>
              <JupiterApp {...props} />
            </ScreenProvider>
          </TokenContextProvider>
        </PrioritizationFeeContextProvider>
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
