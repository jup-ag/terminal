import React, { useEffect } from 'react';
import { useUnifiedWalletContext, useUnifiedWallet } from '@jup-ag/wallet-adapter';
import { DEFAULT_EXPLORER, FormProps } from 'src/types';
import WalletDisconnectedGraphic from 'src/icons/WalletDisconnectedGraphic';
import { IFormConfigurator } from 'src/constants';

const ModalTerminal = (props: {
  formProps: FormProps;
  simulateWalletPassthrough: boolean;
  defaultExplorer: DEFAULT_EXPLORER;
  branding: IFormConfigurator['branding'];
}) => {
  const { formProps, simulateWalletPassthrough, defaultExplorer, branding } = props;

  const passthroughWalletContextState = useUnifiedWallet();
  const { setShowModal } = useUnifiedWalletContext();

  const launchTerminal = () => {
    window.Jupiter.init({
      formProps,
      enableWalletPassthrough: simulateWalletPassthrough,
      passthroughWalletContextState: simulateWalletPassthrough ? passthroughWalletContextState : undefined,
      onRequestConnectWallet: () => setShowModal(true),
      defaultExplorer,
      branding,
    });
  };

  // To make sure passthrough wallet are synced
  useEffect(() => {
    if (!window.Jupiter.syncProps) return;
    window.Jupiter.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState, props]);

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
