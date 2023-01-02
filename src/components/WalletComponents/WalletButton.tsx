import React, { FC, useMemo, useRef, useState } from 'react';
import { useScreenState } from 'src/contexts/ScreenProvider';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import { useOutsideClick } from 'src/misc/utils';
import { CurrentUserBadge } from '../CurrentUserBadge';

import { WalletModalButton } from './components/WalletModalButton';

export const WalletButton: FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { publicKey, connected, connecting, disconnect } = useWalletPassThrough();
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLUListElement>(null);
  const { screen } = useScreenState();

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const passThroughWallet = window.Jupiter.passThroughWallet;
  const onClickDisconnect = () => {
    setActive(false);
    disconnect();
  };

  const closePopup = () => {
    setActive(false);
  };
  useOutsideClick(ref, closePopup);

  if ((!connected && !connecting) || !base58) {
    return <WalletModalButton setIsWalletModalOpen={setIsWalletModalOpen} />;
  }

  return (
    <div className="cursor-pointer relative">
      <div onClick={() => setActive(!active)}>
        <CurrentUserBadge />
      </div>

      {screen === 'Initial' && Boolean(passThroughWallet) === false ? (
        <ul
          aria-label="dropdown-list"
          className={
            active
              ? 'absolute block top-10 right-0 text-sm bg-black rounded-lg p-2 text-white dark:bg-white dark:text-black'
              : 'hidden'
          }
          ref={ref}
          role="menu"
        >
          <li onClick={onClickDisconnect} className="wallet-adapter-dropdown-list-item" role="menuitem">
            <span>Disconnect</span>
          </li>
        </ul>
      ) : null}
    </div>
  );
};
