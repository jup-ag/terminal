import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, MouseEvent, useCallback } from 'react';
import JupButton from 'src/components/JupButton';

export const WalletModalButton: FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { connecting } = useWallet();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setIsWalletModalOpen(true);
    },
    [],
  );

  return (
    <JupButton onClick={handleClick}>
      {connecting && (
        <span>
          <span>Connecting...</span>
        </span>
      )}
      {/* Mobile */}
      {!connecting && (
        <span className="block md:hidden">
          <span>Connect</span>
        </span>
      )}
      {/* Desktop */}
      {!connecting && (
        <span className="hidden md:block">
          <span>Connect Wallet</span>
        </span>
      )}
    </JupButton>
  );
};
