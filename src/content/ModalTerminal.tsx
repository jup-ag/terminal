import React from 'react';

import { Wallet } from '@solana/wallet-adapter-react';

import { FormProps } from 'src/types';

import WalletDisconnectedGraphic from 'src/icons/WalletDisconnectedGraphic';

const ModalTerminal = ({
  rpcUrl,
  formProps,
  fakeWallet,
}: {
  rpcUrl: string;
  formProps: FormProps;
  fakeWallet: Wallet | null;
}) => {
  const launchTerminal = () => {
    window.Jupiter.init({
      endpoint: rpcUrl,
      formProps,
      passThroughWallet: fakeWallet,
    });
  };

  return (
    <div
      className="p-4 hover:bg-white/10 rounded-xl cursor-pointer flex h-full w-full flex-col items-center justify-center text-white"
      onClick={launchTerminal}
    >
      <WalletDisconnectedGraphic />
      <span className="text-xs mt-4">Launch Terminal Modal</span>
    </div>
  );
};

export default ModalTerminal;
