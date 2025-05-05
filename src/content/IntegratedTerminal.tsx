import React, { useCallback, useEffect, useState } from 'react';
import { DEFAULT_EXPLORER, FormProps } from 'src/types';
import { useUnifiedWallet, useUnifiedWalletContext } from '@jup-ag/wallet-adapter';

const IntegratedTerminal = (props: {
  formProps: FormProps;
  simulateWalletPassthrough: boolean;
  defaultExplorer: DEFAULT_EXPLORER;
}) => {
  const { formProps, simulateWalletPassthrough, defaultExplorer } = props;
  const [isLoaded, setIsLoaded] = useState(false);

  const passthroughWalletContextState = useUnifiedWallet();
  const { setShowModal } = useUnifiedWalletContext();

  const launchTerminal = useCallback(async () => {
    window.Jupiter.init({
      displayMode: 'integrated',
      integratedTargetId: 'integrated-terminal',

      formProps,
      enableWalletPassthrough: simulateWalletPassthrough,
      passthroughWalletContextState: simulateWalletPassthrough ? passthroughWalletContextState : undefined,
      onRequestConnectWallet: () => setShowModal(true),
      defaultExplorer,
    });
  }, [
    defaultExplorer,
    formProps,
    passthroughWalletContextState,
    setShowModal,
    simulateWalletPassthrough,
  ]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (!isLoaded || !window.Jupiter.init) {
      intervalId = setInterval(() => {
        setIsLoaded(Boolean(window.Jupiter.init));
      }, 500);
    }

    if (intervalId) {
      return () => clearInterval(intervalId);
    }
  }, [isLoaded]);

  useEffect(() => {
    setTimeout(() => {
      if (isLoaded && Boolean(window.Jupiter.init)) {
        launchTerminal();
      }
    }, 200);
  }, [isLoaded, simulateWalletPassthrough, props, launchTerminal]);

  // To make sure passthrough wallet are synced
  useEffect(() => {
    if (!window.Jupiter.syncProps) return;
    window.Jupiter.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState, props]);

  return (
    <div className="min-h-[600px] h-[600px] w-full rounded-2xl text-white flex flex-col items-center p-2 lg:p-4 mb-4 overflow-hidden mt-9">
      <div className="flex flex-col lg:flex-row h-full w-full overflow-auto">
        <div className="w-full h-full rounded-xl overflow-hidden flex justify-center">
          {/* Loading state */}
          {!isLoaded ? (
            <div className="h-full w-full animate-pulse bg-white/10 mt-4 lg:mt-0 lg:ml-4 flex items-center justify-center rounded-xl">
              <p className="">Loading...</p>
            </div>
          ) : null}

          <div
            id="integrated-terminal"
            className={`flex h-full w-full max-w-[384px] overflow-auto justify-center bg-black rounded-xl ${
              !isLoaded ? 'hidden' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default IntegratedTerminal;
