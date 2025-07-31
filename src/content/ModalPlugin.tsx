import React, { useEffect } from 'react';
import { useUnifiedWalletContext, useUnifiedWallet } from '@jup-ag/wallet-adapter';
import WalletDisconnectedGraphic from 'src/icons/WalletDisconnectedGraphic';
import { useFormContext, useWatch } from 'react-hook-form';

const ModalPlugin = () => {
  const { control } = useFormContext();
  const simulateWalletPassthrough = useWatch({ control, name: 'simulateWalletPassthrough' });
  const formProps = useWatch({ control, name: 'formProps' });
  const defaultExplorer = useWatch({ control, name: 'defaultExplorer' });
  const branding = useWatch({ control: control, name: 'branding' });

  const passthroughWalletContextState = useUnifiedWallet();
  const { setShowModal } = useUnifiedWalletContext();

  const launchPlugin = () => {
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
  }, [passthroughWalletContextState]);

  return (
    <div
      className="p-4 hover:bg-white/10 rounded-xl cursor-pointer flex h-full w-full flex-col items-center justify-center text-white"
      onClick={launchPlugin}
    >
      <WalletDisconnectedGraphic />
      <span className="text-xs mt-4">Launch Plugin Modal</span>
    </div>
  );
};

export default ModalPlugin;
