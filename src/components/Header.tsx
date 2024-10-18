import React, { useCallback, useMemo, useState } from 'react';
import { useSwapContext } from 'src/contexts/SwapContext';
import RefreshSVG from 'src/icons/RefreshSVG';
import SettingsSVG from 'src/icons/SettingsSVG';
import { formatNumber } from 'src/misc/utils';

import JupiterLogo from '../icons/JupiterLogo';

import { WalletButton } from './WalletComponents';
import SwapSettingsModal from './SwapSettingsModal/SwapSettingsModal';
import { useAccounts } from 'src/contexts/accounts';

const Header: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const {
    form,
    jupiter: { refresh },
  } = useSwapContext();
  const [showSlippapgeSetting, setShowSlippageSetting] = useState(false);

  const { refresh: refreshAccounts } = useAccounts();

  const onRefresh = useCallback(() => {
    refreshAccounts();
    refresh();
  }, [refreshAccounts, refresh]);

  const jupiterDirectLink = useMemo(() => {
    return `https://jup.ag/swap/${form.fromMint}-${form.toMint}?inAmount=${form.fromValue}`;
  }, [form]);

  const slippageText = useMemo(() => {
    const value = form.userSlippageMode === 'FIXED' ? form.slippageBps / 100 : form.dynamicSlippageBps / 100;
    return isNaN(value) ? '0' : formatNumber.format(String(value));
  }, [form.slippageBps, form.dynamicSlippageBps, form.userSlippageMode]);

  return (
    <div className="mt-2 h-7 pl-3 pr-2">
      <div className="w-full flex items-center justify-between ">
        <a href={jupiterDirectLink} target={'_blank'} rel="noreferrer noopener" className="flex items-center space-x-2">
          <JupiterLogo width={24} height={24} />
          <span className="font-bold text-sm text-white">Jupiter</span>
        </a>

        <div className="flex space-x-1 items-center">
          <button
            type="button"
            className="p-2 h-7 w-7 flex items-center justify-center border rounded-full border-white/10 bg-black/10 text-white/30 fill-current"
            onClick={onRefresh}
          >
            <RefreshSVG />
          </button>

          <button
            type="button"
            className="p-2 h-7 space-x-1 flex items-center justify-center border rounded-2xl border-white/10 bg-black/10 text-white/30 fill-current"
            onClick={() => setShowSlippageSetting(true)}
          >
            <SettingsSVG />
            <span suppressHydrationWarning className="text-xs text-white-30">
              {`${form.userSlippageMode === 'FIXED' ? 'F' : 'D'}->${slippageText}`}%
            </span>
          </button>

          <WalletButton setIsWalletModalOpen={setIsWalletModalOpen} />
        </div>
      </div>

      {showSlippapgeSetting ? (
        <div className="absolute z-10 top-0 left-0 w-full h-full overflow-hidden bg-black/50 flex items-center px-4">
          <SwapSettingsModal closeModal={() => setShowSlippageSetting(false)} />
        </div>
      ) : null}
    </div>
  );
};

export default Header;
