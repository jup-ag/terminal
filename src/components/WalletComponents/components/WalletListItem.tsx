import { Adapter } from '@solana/wallet-adapter-base';
import React, { DetailedHTMLProps, FC, ImgHTMLAttributes, MouseEventHandler, useCallback, useRef } from 'react';
import Image from 'next/image';

import UnknownImage from 'public/coins/unknown.svg';
import { isMobile } from '../../../misc/utils';

const CUSTOM_WALLET_ICONS: Record<string, { light: string; dark: string }> = {};

export interface WalletIconProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  wallet: Adapter | null;
  width?: number;
  height?: number;
}

export const WalletIcon: FC<WalletIconProps> = ({ wallet, ...props }) => {
  const [hasError, setHasError] = React.useState(false);
  const haveCustomIcon = wallet?.name ? CUSTOM_WALLET_ICONS[wallet.name] : undefined;

  let src: string = '';
  if (haveCustomIcon) {
    src = haveCustomIcon.light;
  } else if (wallet && wallet.icon) {
    src = wallet.icon;
  }

  if (wallet && src && !hasError) {
    return (
      <Image
        width={props.width || 24}
        height={props.height || 24}
        src={src}
        alt={`${wallet.name} icon`}
        className="object-contain"
        onError={() => {
          setHasError(true);
        }}
      />
    );
  } else {
    return <Image alt="unknown" src={UnknownImage} width={props.width || 24} height={props.height || 24} />;
  }
};

export interface WalletListItemProps {
  handleClick: MouseEventHandler<HTMLLIElement>;
  tabIndex?: number;
  wallet: Adapter;
}

export const WalletListItem = React.forwardRef(
  (
    { handleClick, wallet }: WalletListItemProps,
    ref: React.ForwardedRef<HTMLLIElement>,
  ) => {
    return (
      <li
        ref={ref}
        className={`relative list-none h-full flex justify-between p-5 cursor-pointer dark:text-white jup-gradient before:hidden before:hover:block hover:border-none border-2 border-black-10 dark:border-white-10 rounded-lg`}
        onClick={handleClick}
      >
        <div
          className={`absolute top-0 left-0  w-full h-full`}
        >
          <div
            className={`absolute top-0 left-0 w-full h-full`}
            style={{ zIndex: -1 }}
          />
        </div>

        <div className="flex items-center overflow-hidden">
          {isMobile() ? <WalletIcon wallet={wallet} /> : <WalletIcon wallet={wallet} width={30} height={30} />}
          <div className="font-medium ml-3 truncate text-xs md:text-sm">{wallet.name}</div>
        </div>
      </li>
    );
  },
);

WalletListItem.displayName = 'WalletListItem';
