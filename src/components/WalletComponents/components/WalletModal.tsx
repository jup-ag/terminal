import React, { FC, MouseEvent } from 'react';
import { WalletListItem } from './WalletListItem';
import { Adapter, WalletReadyState } from '@solana/wallet-adapter-base';

import GlassBox from '../../GlassBox/GlassBox';

import CloseIcon from 'src/icons/CloseIcon';
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';

const PRIORITISE: {
  [value in WalletReadyState]: number;
} = {
  [WalletReadyState.Installed]: 1,
  [WalletReadyState.Loadable]: 2,
  [WalletReadyState.NotDetected]: 3,
  [WalletReadyState.Unsupported]: 3,
};
export interface WalletModalProps {
  setIsWalletModalOpen(toggle: boolean): void
}

export const WalletModal: FC<WalletModalProps> = ({ setIsWalletModalOpen }) => {
  const { wallets, select } = useWallet();

  const handleWalletClick = async (event: MouseEvent, wallet: Adapter) => {
    event.preventDefault();

    try {
      // Might throw WalletReadyState.WalletNotReady
      select(wallet.name);

      if (wallet.readyState === WalletReadyState.NotDetected) {
        throw WalletReadyState.NotDetected;
      }
      setIsWalletModalOpen(false);
    } catch (error) {
      // TODO: A small toast or something to indicate the error
    }
  };

  const renderWalletList = (walletList: WalletContextState['wallets'], startKeyboardIndex: number = 0) => (
    <div className="h-full overflow-y-auto grid grid-cols-2 content-start gap-3 px-5" translate="no">
      {walletList.map((wallet, index) => {
        return (
          <ul key={index}>
            <WalletListItem
              handleClick={(event) => handleWalletClick(event, wallet.adapter)}
              wallet={wallet.adapter}
            />
          </ul>
        );
      })}
    </div>
  );

  return (
    <GlassBox
      className="flex-col overflow-y-auto max-h-screen overflow-hidden dark:text-white pb-7 !bg-white dark:!bg-white/5"
      style={{ maxHeight: '90vh', height: '90%', width: '90%' }}
    >
      <div className="p-5 flex justify-between">
        <div>
          <div className="font-md font-semibold">
            <span>Connect Wallet</span>
          </div>
          <div className="text-xs text-black-50 dark:text-white-50">
            <span>You need to connect a Solana wallet.</span>
          </div>
        </div>
        {/* // TODO: Close modal */}
        <div className="cursor-pointer" onClick={() => {}}>
          <CloseIcon />
        </div>
      </div>

      {renderWalletList(
        wallets
          .sort((a, b) => PRIORITISE[a.readyState] - PRIORITISE[b.readyState])
      )}
    </GlassBox>
  );
};
