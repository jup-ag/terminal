import React from 'react';

import { Wallet } from '@solana/wallet-adapter-react';

import { DEFAULT_EXPLORER, FormProps } from 'src/types';

import WalletDisconnectedGraphic from 'src/icons/WalletDisconnectedGraphic';

const ModalTerminal = (props: {
  rpcUrl: string;
  formProps: FormProps;
  fakeWallet: Wallet | null;
  strictTokenList: boolean;
  defaultExplorer: DEFAULT_EXPLORER;
}) => {
  const {
    rpcUrl,
    formProps,
    fakeWallet,
    strictTokenList,
    defaultExplorer
  } = props;
  
  const launchTerminal = () => {
    window.Jupiter.init({
      endpoint: rpcUrl,
      formProps,
      passThroughWallet: fakeWallet,
      strictTokenList,
      defaultExplorer
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
