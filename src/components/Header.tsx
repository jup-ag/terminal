import React, { useMemo } from 'react';
import { useSwapContext } from 'src/contexts/SwapContext';

import JupiterLogo from '../icons/JupiterLogo';
import { WalletButton } from './WalletComponents';

const Header: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const {
    form,
  } = useSwapContext();

  const jupiterDirectLink = useMemo(() => {
    return `https://jup.ag/swap/${form.fromMint}-${form.toMint}?inAmount=${form.fromValue}`;
  }, [form]);

  return (
    <div className="mt-2 h-7 pl-3 pr-2">
      <div className="w-full flex items-center justify-between ">
        <a href={jupiterDirectLink} target={'_blank'} rel="noreferrer noopener" className="flex items-center space-x-2">
          <JupiterLogo width={24} height={24} />
          <span className="font-bold text-sm text-white">Jupiter</span>
        </a>

        <div className="flex space-x-1 items-center">
          <WalletButton setIsWalletModalOpen={setIsWalletModalOpen} />
        </div>
      </div>
    </div>
  );
};

export default Header;
