import { Wallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import { FormProps } from 'src/types';
import { useDebouncedEffect } from 'src/misc/utils';
import { getPlatformFeeAccounts, JUPITER_FEE_OWNER } from '@jup-ag/react-hook';
import { Connection } from '@solana/web3.js';

const IntegratedTerminal = ({
  rpcUrl,
  formProps,
  fakeWallet,
}: {
  rpcUrl: string;
  formProps: FormProps;
  fakeWallet: Wallet | null;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const launchTerminal = async () => {
    window.Jupiter.init({
      displayMode: 'integrated',
      integratedTargetId: 'integrated-terminal',
      endpoint: rpcUrl,
      formProps,
      passThroughWallet: fakeWallet,
    });
  };

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
  }, []);

  useDebouncedEffect(
    () => {
      if (isLoaded && Boolean(window.Jupiter.init)) {
        launchTerminal();
      }
    },
    [isLoaded, formProps, fakeWallet],
    200,
  );

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
            className={`flex h-full w-full max-w-[384px] overflow-auto justify-center bg-[#282830] rounded-xl ${
              !isLoaded ? 'hidden' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default IntegratedTerminal;
