import React, { useMemo } from 'react';
import { useSlippageConfig } from 'src/contexts/SlippageConfigProvider';
import { useSwapContext } from 'src/contexts/SwapContext';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import RefreshSVG from 'src/icons/RefreshSVG';
import SettingsSVG from 'src/icons/SettingsSVG';
import { formatNumber } from 'src/misc/utils';

import JupiterLogo from '../icons/JupiterLogo';

import { WalletButton } from './WalletComponents';
import WalletConnectButton from './WalletConnectButton';

const Header: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { wallet } = useWalletPassThrough();
  const { slippage } = useSlippageConfig();
  const { jupiter: { refresh } } = useSwapContext();

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);


  return (
    <div>
      <div className="w-full flex items-center justify-between h-16 pl-3 pr-2">
        <div className="flex items-center space-x-2">
          <JupiterLogo width={24} height={24} />
          <span className="font-bold text-sm text-white">Jupiter</span>
        </div>

        <div>
          {!walletPublicKey ? <WalletConnectButton setIsWalletModalOpen={setIsWalletModalOpen} /> : <WalletButton setIsWalletModalOpen={setIsWalletModalOpen} />}
        </div>
      </div>

      <div className='flex space-x-2 justify-end px-2'>
        <button type="button" className='p-2 h-7 w-7 flex items-center justify-center border rounded-full border-white/10 text-white/30 fill-current' onClick={refresh}>
          <RefreshSVG />
        </button>

        <button type="button" className='p-2 h-7 space-x-1 flex items-center justify-center border rounded-2xl border-white/10 text-white/30 fill-current'>
          <SettingsSVG />
          <span suppressHydrationWarning className="text-xs text-white-30">
            {isNaN(slippage) ? '0' : formatNumber.format(slippage)}%
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
