import { useUnifiedWalletContext, Wallet } from '@jup-ag/wallet-adapter';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { useScreenState } from 'src/contexts/ScreenProvider';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import CloseIcon from 'src/icons/CloseIcon';

const WalletScreen = () => {
  const { setScreen } = useScreenState();
  const { handleConnectClick } = useUnifiedWalletContext();

  const { wallets } = useWalletPassThrough();

  const handleConnect = async (event: MouseEvent<HTMLElement>, wallet: Wallet) => {
    try {
      await handleConnectClick(event, wallet.adapter);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setScreen('Initial');
    }
  };

  const numberOfWallets = useMemo(() => {
    return wallets?.length;
  }, [wallets]);

  const hasWallet = useMemo(() => {
    return numberOfWallets > 0;
  }, [numberOfWallets]);

  return (
    <div className="text-primary-text p-2">
      <div className="flex justify-between items-center mb-2 h-[28px] ">
        <h1 className="text-sm font-bold">Available Wallets ({numberOfWallets})</h1>
        <button
          onClick={() => setScreen('Initial')}
          className="text-primary-text hover:text-primary-text/50 transition-colors bg-interactive rounded-full p-1"
        >
          <CloseIcon width={15} height={15} />
        </button>
      </div>
      {!hasWallet && (
        <div className="text-sm font-medium text-primary-text flex items-center justify-center h-full py-4">
          No wallet found
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {wallets?.map((wallet) => (
          <button
            key={wallet.adapter.name}
            onClick={(e) => handleConnect(e, wallet)}
            className={`w-full text-left bg-interactive p-4 rounded-lg transition-colors ${'hover:bg-interactive/80 cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {wallet.adapter.icon && (
                  <img src={wallet.adapter.icon} alt={`${wallet.adapter.name} icon`} className="w-8 h-8" />
                )}
                <div>
                  <h2 className="text-sm font-medium">{wallet.adapter.name}</h2>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WalletScreen;
