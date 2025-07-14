import React, { useCallback } from 'react';
import { useSwapContext } from 'src/contexts/SwapContext';
import RefreshSVG from 'src/icons/RefreshSVG';

import { WalletButton } from './WalletComponents';
import { useBranding } from 'src/contexts/BrandingProvider';
import { useBalances } from 'src/hooks/useBalances';

const Header = () => {
  const { refresh, enableWalletPassthrough } = useSwapContext();
  const { refetch: refetchBalances } = useBalances();
  const { logoUri, name } = useBranding();

  const onRefresh = useCallback(() => {
    refetchBalances();
    refresh();
  }, [refetchBalances, refresh]);

  return (
    <div className="mt-2 h-7 pl-3 pr-2">
      <div className="w-full flex items-center justify-between ">
        <div className="flex items-center space-x-2">
          <img src={logoUri} alt="Terminal Branding" className="w-6 h-6" />
          <span className="font-bold text-sm text-primary-text">{name}</span>
        </div>

        <div className="flex space-x-1 items-center">
          <button
            type="button"
            className="p-2 h-7 w-7 flex items-center justify-center  rounded-full  bg-interactive text-primary-text fill-current"
            onClick={onRefresh}
          >
            <RefreshSVG />
          </button>
          {!enableWalletPassthrough && <WalletButton />}
        </div>
      </div>
    </div>
  );
};

export default Header;
