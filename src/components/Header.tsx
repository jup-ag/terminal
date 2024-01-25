import React, { useMemo, useState } from 'react';
import { useSlippageConfig } from 'src/contexts/SlippageConfigProvider';
import { useSwapContext } from 'src/contexts/SwapContext';
import RefreshSVG from 'src/icons/RefreshSVG';
import SettingsSVG from 'src/icons/SettingsSVG';
import { formatNumber } from 'src/misc/utils';

import JupiterLogo from '../icons/JupiterLogo';

import SwapSettingsModal, { PRIORITY_PRESET } from './SwapSettingsModal/SwapSettingsModal';
import TransactionPrioritySVG from 'src/icons/TransactionPrioritySVG';
import SettingGearIcon from 'src/icons/SettingGearIcon';
import { FormSettingButton } from './FormSettingButton';

const Header: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { slippage } = useSlippageConfig();
  const {
    form,
    jupiter: { refresh, prioritizationFeeLamports },
  } = useSwapContext();
  const [showSlippapgeSetting, setShowSlippageSetting] = useState(false);

  const jupiterDirectLink = useMemo(() => {
    return `https://jup.ag/swap/${form.fromMint}-${form.toMint}?inAmount=${form.fromValue}`;
  }, [form]);

  const [filterDisplay, setFilterDisplay] = useState<'priorityOnly' | 'slippageOnly' | 'generalOnly'>('priorityOnly');
  const priortyText = useMemo(() => {
    return PRIORITY_PRESET.find((a) => JSON.stringify(a.value) === JSON.stringify(prioritizationFeeLamports))?.text;
  }, [prioritizationFeeLamports]);

  const openPrioritySettings = () => {
    setShowSlippageSetting(true);
    setFilterDisplay('priorityOnly');
  };

  const openSlippageSettings = () => {
    setShowSlippageSetting(true);
    setFilterDisplay('slippageOnly');
  };

  const openGeneralSwapSettings = () => {
    setShowSlippageSetting(true);
    setFilterDisplay('generalOnly');
  };

  return (
    <div className="mt-2 h-7 pl-3 pr-2">
      <div className="w-full flex items-center justify-between ">
        <a href={jupiterDirectLink} target={'_blank'} rel="noreferrer noopener" className="flex items-center space-x-2">
          <JupiterLogo width={24} height={24} />
        </a>

        <div className="flex space-x-1 items-center">
        <FormSettingButton     onClick={refresh}
          >
            <RefreshSVG />
          </FormSettingButton>

          <FormSettingButton onClick={openPrioritySettings}>
            <div className="text-white/35 fill-current">
              <TransactionPrioritySVG />
            </div>

            <span className="flex text-xs leading-none">
              {priortyText || (
                <>
                  Custom
                  <span className="hidden sm:block">
                    {typeof prioritizationFeeLamports === 'number' &&
                      `: (${formatNumber.format(prioritizationFeeLamports)} SOL)`}
                  </span>
                </>
              )}
            </span>
          </FormSettingButton>
          <FormSettingButton onClick={openSlippageSettings}>
            <SettingsSVG />
            <span suppressHydrationWarning className="text-xs text-white-30">
              {isNaN(slippage) ? '0' : formatNumber.format(slippage)}%
            </span>
          </FormSettingButton>
          <FormSettingButton onClick={openGeneralSwapSettings}>
            <SettingGearIcon />
          </FormSettingButton>
        </div>
      </div>

      {showSlippapgeSetting ? (
        <div className="absolute z-10 top-0 left-0 w-full h-full overflow-hidden bg-black/50 flex items-center px-4">
          <SwapSettingsModal closeModal={() => setShowSlippageSetting(false)} filterDisplay={filterDisplay} />
        </div>
      ) : null}
    </div>
  );
};

export default Header;
