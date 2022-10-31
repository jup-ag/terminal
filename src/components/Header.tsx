import { useWallet } from '@solana/wallet-adapter-react';
import React, { useMemo } from 'react';

import JupiterLogo from '../icons/JupiterLogo';

import { WalletButton } from './WalletComponents';
import WalletConnectButton from './WalletConnectButton';

const Header: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { wallet } = useWallet();

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);

  return (
    <div className="w-full flex items-center justify-between h-16 px-6 py-4">
      <div className="flex space-x-2">
        <JupiterLogo />
        <span className="font-bold">Jupiter</span>
      </div>

      <div>
        {!walletPublicKey ? <WalletConnectButton setIsWalletModalOpen={setIsWalletModalOpen} /> : <WalletButton setIsWalletModalOpen={setIsWalletModalOpen} />}
      </div>
    </div>
  );
};

export default Header;
