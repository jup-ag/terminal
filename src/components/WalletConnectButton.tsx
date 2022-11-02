import React from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

import JupButton from './JupButton';

const WalletConnectButton: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { wallet, connect, connecting } = useWalletPassThrough();

  const onClick = () => {
    if (wallet) connect();
    else {
      setIsWalletModalOpen(true);
    }
  };

  return (
    <JupButton onClick={onClick}>
      {connecting && (
        <span>
          <span>Connecting...</span>
        </span>
      )}
      {!connecting && (
        <span>
          <span>Connect</span>
        </span>
      )}
    </JupButton>
  );
};

export default WalletConnectButton;
