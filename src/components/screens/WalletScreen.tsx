import { useUnifiedWalletContext, Wallet } from '@jup-ag/wallet-adapter';
import { MouseEvent, useEffect, useState } from 'react';
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

  return (
    <div className="text-white p-2">
      <div className="flex justify-between items-center mb-2 h-[28px] ">
        <h1 className="text-sm font-bold">Available Wallets</h1>
        <button onClick={() => setScreen('Initial')} className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-full p-1">
            <CloseIcon  width={15} height={15}/>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {wallets?.map((wallet) => (
          <button
            key={wallet.adapter.name}
            onClick={(e) => handleConnect(e, wallet)}
            className={`w-full text-left bg-gray-800 p-4 rounded-lg transition-colors ${'hover:bg-gray-700 cursor-pointer'}`}
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
