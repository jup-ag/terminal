import React, { useMemo, useState } from 'react';
import { useSlippageConfig } from 'src/contexts/SlippageConfigProvider';
import { useSwapContext } from 'src/contexts/SwapContext';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import RefreshSVG from 'src/icons/RefreshSVG';
import SettingsSVG from 'src/icons/SettingsSVG';
import { formatNumber } from 'src/misc/utils';

import JupiterLogo from '../icons/JupiterLogo';

import { WalletButton } from './WalletComponents';
import SwapSettingsModal from './SwapSettingsModal/SwapSettingsModal'

const Header: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { wallet } = useWalletPassThrough();
  const { slippage } = useSlippageConfig();
  const { jupiter: { refresh } } = useSwapContext();

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);

  const [showSlippapgeSetting, setShowSlippageSetting] = useState(false);

  return (
    <div className='mt-2 h-7 pl-3 pr-2'>
      <div className="w-full flex items-center justify-between ">
        <div className="flex items-center space-x-2">
          <JupiterLogo width={24} height={24} />
          <span className="font-bold text-sm text-white">Jupiter</span>
        </div>

        <div className='flex space-x-1 items-center'>
          <button type="button" className='p-2 h-7 w-7 flex items-center justify-center border rounded-full border-white/10 bg-black/10 text-white/30 fill-current' onClick={refresh}>
            <RefreshSVG />
          </button>

          <button type="button" className='p-2 h-7 space-x-1 flex items-center justify-center border rounded-2xl border-white/10 bg-black/10 text-white/30 fill-current' onClick={() => setShowSlippageSetting(true)}>
            <SettingsSVG />
            <span suppressHydrationWarning className="text-xs text-white-30">
              {isNaN(slippage) ? '0' : formatNumber.format(slippage)}%
            </span>
          </button>

          <WalletButton setIsWalletModalOpen={setIsWalletModalOpen} />
        </div>
      </div>

      {showSlippapgeSetting ? (
        <div className='absolute z-10 top-0 left-0 w-full h-full overflow-hidden bg-black/50 flex items-center px-4'>
          <SwapSettingsModal closeModal={() => setShowSlippageSetting(false)} />
        </div>
      ) : null}
    </div>
  );
};

export default Header;
