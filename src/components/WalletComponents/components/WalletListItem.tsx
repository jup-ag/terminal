import { Adapter } from '@solana/wallet-adapter-base';
import React, { DetailedHTMLProps, FC, ImgHTMLAttributes, MouseEventHandler, useCallback, useRef } from 'react';
import Image from 'next/image';

import MathWalletLight from './icons/math-wallet.svg';
import LedgerWalletLight from './icons/ledger-wallet.svg';

import { LedgerWalletAdapter, MathWalletAdapter, XDEFIWalletAdapter } from '@solana/wallet-adapter-wallets';

import UnknownImage from 'public/coins/unknown.svg';
import { isMobile } from '../../../misc/utils';

const CUSTOM_WALLET_ICONS: Record<string, { light: string; dark: string }> = {
  MathWallet: {
    light: MathWalletLight,
    dark: new MathWalletAdapter().icon,
  },
  Ledger: {
    light: LedgerWalletLight,
    dark: new LedgerWalletAdapter().icon,
  },
  XDEFI: {
    light:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0LjI2MjggMTMuNDAxM0MxMi40MjI4IDE0LjUzMDcgOS45NTk5NyAxNS4xMTI0IDcuNDY1NjkgMTQuOTg4MUM1LjM2ODU1IDE0Ljg4NjUgMy42NDg1NSAxNC4xNDExIDIuNjA4NTUgMTIuOTE1N0MxLjY5NDI2IDExLjgyMDEgMS4zMzk5OCAxMC4zNzQ1IDEuNTc5OTggOC43MTE0M0MxLjY2MTMyIDguMTU4NzQgMS44MjgwMiA3LjYyMTY2IDIuMDc0MjYgNy4xMTg5NkwyLjEwODU1IDcuMDQ4MzdDMi45NzE4IDUuNDA1OTUgNC4yNTI5MyA0LjAxMzk3IDUuODI1ODQgMy4wMDk0MkM3LjM5ODc1IDIuMDA0ODYgOS4yMDkyNCAxLjQyMjM2IDExLjA3OTEgMS4zMTkyNEMxMi45NDkgMS4yMTYxMSAxNC44MTM4IDEuNTk1OTIgMTYuNDkwMSAyLjQyMTI4QzE4LjE2NjMgMy4yNDY2NSAxOS41OTYyIDQuNDg5MTIgMjAuNjM5IDYuMDI2NDFDMjEuNjgxOSA3LjU2MzcxIDIyLjMwMTcgOS4zNDI4NSAyMi40Mzc0IDExLjE4ODdDMjIuNTczMiAxMy4wMzQ2IDIyLjIyMDMgMTQuODgzNiAyMS40MTM0IDE2LjU1MzhDMjAuNjA2NSAxOC4yMjQgMTkuMzczNSAxOS42NTc3IDE3LjgzNTYgMjAuNzE0QzE2LjI5NzggMjEuNzcwMiAxNC41MDgxIDIyLjQxMjYgMTIuNjQyOCAyMi41Nzc4TDEyLjc1NzEgMjMuODczOEMxNC44NTE0IDIzLjY4OTQgMTYuODYxIDIyLjk2OTEgMTguNTg3OCAyMS43ODM3QzIwLjMxNDcgMjAuNTk4NCAyMS42OTkzIDE4Ljk4ODkgMjIuNjA1MiAxNy4xMTM4QzIzLjUxMTEgMTUuMjM4NyAyMy45MDcxIDEzLjE2MjcgMjMuNzU0MiAxMS4wOTA0QzIzLjYwMTIgOS4wMTgwOCAyMi45MDQ2IDcuMDIwODggMjEuNzMyOSA1LjI5NTU1QzIwLjU2MTMgMy41NzAyMiAxOC45NTUgMi4xNzYzIDE3LjA3MjQgMS4yNTExMUMxNS4xODk4IDAuMzI1OTA5IDEzLjA5NTcgLTAuMDk4NjQxMSAxMC45OTY1IDAuMDE5Mjc4N0M4Ljg5NzMzIDAuMTM3MTk4IDYuODY1NDQgMC43OTM1MiA1LjEwMTAyIDEuOTIzNTlDMy4zMzY2IDMuMDUzNjUgMS45MDA1MyA0LjYxODQ4IDAuOTM0MjY0IDYuNDYzOUwwLjg4ODU0OCA2LjU1NzA3QzAuNTgzMDgzIDcuMTgwOSAwLjM3Njg0NyA3Ljg0NzU2IDAuMjc3MTIgOC41MzM1NEMtMC4wMDg1OTQ1IDEwLjU2MDggMC40MzQyNiAxMi4zNjUxIDEuNTkxNCAxMy43NTQyQzIuODU3MTIgMTUuMjczMyA0LjkxNzEyIDE2LjE3NjggNy4zODg1NSAxNi4yOTU0QzEwLjM5NzEgMTYuNDQ1MSAxMy4zODg1IDE1LjYzNDcgMTUuNTExNCAxNC4xNDM5TDE0LjI2MjggMTMuNDAxM1oiIGZpbGw9IiMzMzMzMzMiLz4KPHBhdGggZD0iTTE2Ljc4IDE0Ljg3NTFDMTUuNTgyOSAxNS45MDI5IDEyLjggMTcuNzY2NCA4LjE4Mjg2IDE4LjAyMDVDMy4wMTQyOSAxOC4zMDI5IDAuODYwMDAxIDE2LjY0MjcgMC44NDAwMDEgMTYuNjI1N0wwLjQyMjg1NiAxNy4xMzM5TDAuODQyODU2IDE2LjYzNDJMMCAxNy42MzM3QzAuMDkxNDI4NiAxNy43MDk5IDIuMTU3MTQgMTkuMzU4OSA3LjAwODU3IDE5LjM1ODlDNy40MDU3MSAxOS4zNTg5IDcuODIyODYgMTkuMzU4OSA4LjI1NzE0IDE5LjMyNUMxMy44MzcxIDE5LjAxNzIgMTYuOTAyOSAxNi42MTE2IDE3Ljk3MTQgMTUuNTgzOEwxNi43OCAxNC44NzUxWiIgZmlsbD0iIzMzMzMzMyIvPgo8cGF0aCBkPSJNMTkuMDIgMTYuMjE5MkMxOC4zMTIxIDE3LjEzODcgMTcuNDQwOCAxNy45MjMzIDE2LjQ0ODYgMTguNTM0NUMxMi45NTE1IDIwLjc2NSA4LjUwMjg5IDIxLjA1MyA1LjM4ODYgMjAuODk3OEw1LjMyMjg5IDIyLjE5OTRDNS44NDU3NSAyMi4yMjQ4IDYuMzQ4NjEgMjIuMjM2MSA2LjgzNzE4IDIyLjIzNjFDMTUuNjIgMjIuMjM2MSAxOS4xNjg2IDE4LjI4MzIgMjAuMTYgMTYuODcxNEwxOS4wMTcyIDE2LjIwNzkiIGZpbGw9IiMzMzMzMzMiLz4KPHBhdGggZD0iTTE4LjY4NTcgMTEuMjkyMkMxOS4yNjggMTEuMjkyMiAxOS43NCAxMC44MjU3IDE5Ljc0IDEwLjI1MDNDMTkuNzQgOS42NzQ4OSAxOS4yNjggOS4yMDg0MiAxOC42ODU3IDkuMjA4NDJDMTguMTAzNCA5LjIwODQyIDE3LjYzMTQgOS42NzQ4OSAxNy42MzE0IDEwLjI1MDNDMTcuNjMxNCAxMC44MjU3IDE4LjEwMzQgMTEuMjkyMiAxOC42ODU3IDExLjI5MjJaIiBmaWxsPSIjMzMzMzMzIi8+Cjwvc3ZnPgo=',
    dark: new XDEFIWalletAdapter().icon,
  },
};

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
