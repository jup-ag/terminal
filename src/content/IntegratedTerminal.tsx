import React, { useCallback, useEffect, useState, memo } from 'react';
import { useUnifiedWallet, useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { useFormContext, useWatch } from 'react-hook-form';

const IntegratedTerminal = memo(() => {
  const { control } = useFormContext();
  const simulateWalletPassthrough = useWatch({ control, name: 'simulateWalletPassthrough' });
  const formProps = useWatch({ control, name: 'formProps' });
  const defaultExplorer = useWatch({ control, name: 'defaultExplorer' });
  const branding = useWatch({ control: control, name: 'branding' });
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
      branding,
      containerStyles:{
        zIndex: 20,
      }
    });
  }, [defaultExplorer, formProps, passthroughWalletContextState, setShowModal, simulateWalletPassthrough, branding]);

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
  }, [isLoaded, simulateWalletPassthrough, launchTerminal]);

  // To make sure passthrough wallet are synced
  useEffect(() => {
    if (!window.Jupiter.syncProps) return;
    window.Jupiter.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState]);

  return (
    <div className=" w-full rounded-2xl text-white flex flex-col items-center  mb-4 overflow-hidden mt-9">
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
            className={`flex h-full overflow-auto justify-center bg-black rounded-xl ${!isLoaded ? 'hidden' : ''}`}
          />
        </div>
      </div>
    </div>
  );
});

IntegratedTerminal.displayName = 'IntegratedTerminal';

export default IntegratedTerminal;
