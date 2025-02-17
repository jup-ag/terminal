import React, { FC, MouseEvent, useCallback } from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

export const WalletModalButton: FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { connecting } = useWalletPassThrough();

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (window.Jupiter.enableWalletPassthrough && window.Jupiter.onRequestConnectWallet) {
      window.Jupiter.onRequestConnectWallet();
    } else { 
      setIsWalletModalOpen(true);
    }
  }, [setIsWalletModalOpen]);

  return (
    <button
      type="button"
      className="py-2 px-3 h-7 flex items-center rounded-2xl text-xs bg-[#1A2633] text-white"
      onClick={handleClick}
    >
      {connecting ? (
        <span>
          <span>Connecting...</span>
        </span>
      ) : (
        <span>
          <span>Connect Wallet</span>
        </span>
      )}
    </button>
  );
};
