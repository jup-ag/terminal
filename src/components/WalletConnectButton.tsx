import { useWallet } from '@solana/wallet-adapter-react';
import React from 'react';

import JupButton from './JupButton';

const WalletConnectButton: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { wallet, connect, connecting } = useWallet();

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
