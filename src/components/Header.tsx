import React, { useMemo, useState } from 'react';
import { useSlippageConfig } from 'src/contexts/SlippageConfigProvider';
import { useSwapContext } from 'src/contexts/SwapContext';
import RefreshSVG from 'src/icons/RefreshSVG';
import SettingsSVG from 'src/icons/SettingsSVG';
import { formatNumber } from 'src/misc/utils';

import JupiterLogo from '../icons/JupiterLogo';

import { WalletButton } from './WalletComponents';
import SwapSettingsModal from './SwapSettingsModal/SwapSettingsModal';

const Header: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { slippage } = useSlippageConfig();
  const {
    form,
    formProps: { darkMode },
    jupiter: { refresh },
  } = useSwapContext();
  const [showSlippapgeSetting, setShowSlippageSetting] = useState(false);

  const jupiterDirectLink = useMemo(() => {
    return `https://jup.ag/swap/${form.fromMint}-${form.toMint}?inAmount=${form.fromValue}`;
  }, [form]);

  return (
    <div className="pl-3 pr-2 mt-2 h-7">
      <div className="flex items-center justify-between w-full ">
        <a href={jupiterDirectLink} target={'_blank'} rel="noreferrer noopener" className="flex items-center space-x-2">
          <JupiterLogo width={24} height={24} />
          <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Jupiter</span>
        </a>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            className={`flex items-center justify-center p-2 border rounded-full fill-current h-7 w-7 border-white/10 bg-black/10 ${
              darkMode ? 'text-white/30' : 'text-black/30'
            }`}
            onClick={refresh}
          >
            <RefreshSVG />
          </button>

          <button
            type="button"
            className={`flex items-center justify-center p-2 space-x-1 border fill-current h-7 rounded-2xl border-white/10 bg-black/10 ${
              darkMode ? 'text-white/30' : 'text-black/30'
            }`}
            onClick={() => setShowSlippageSetting(true)}
          >
            <SettingsSVG />
            <span suppressHydrationWarning className="text-xs text-white-30">
              {isNaN(slippage) ? '0' : formatNumber.format(slippage)}%
            </span>
          </button>

          <WalletButton setIsWalletModalOpen={setIsWalletModalOpen} />
        </div>
      </div>

      {showSlippapgeSetting ? (
        <div className="absolute top-0 left-0 z-10 flex items-center w-full h-full px-4 overflow-hidden bg-black/50">
          <SwapSettingsModal closeModal={() => setShowSlippageSetting(false)} />
        </div>
      ) : null}
    </div>
  );
};

export default Header;
