import React, { FC, MouseEvent, useCallback } from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

export const WalletModalButton: FC<{ darkMode: boolean; setIsWalletModalOpen(toggle: boolean): void }> = ({
  darkMode = false,
  setIsWalletModalOpen,
}) => {
  const { connecting } = useWalletPassThrough();

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (window.Jupiter.enableWalletPassthrough && window.Jupiter.onRequestConnectWallet) {
      window.Jupiter.onRequestConnectWallet();
    } else {
      setIsWalletModalOpen(true);
    }
  }, []);

  return (
    <button
      type="button"
      className={`py-2 px-3 h-7 flex items-center rounded-2xl text-xs ${
        darkMode ? 'text-white bg-[#191B1F]' : 'text-white bg-[#1e96fc]'
      }`}
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
