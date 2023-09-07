import { CSSProperties } from 'react';
import { Root } from 'react-dom/client';
import { createStore } from 'jotai';
import { Wallet } from '@jup-ag/wallet-adapter';
import { PublicKey, TransactionError } from '@solana/web3.js';
import { SwapMode, SwapResult } from '@jup-ag/react-hook';
import { WalletContextState } from '@jup-ag/wallet-adapter';
import EventEmitter from 'events';

declare global {
  interface Window {
    Jupiter: JupiterTerminal;
  }
}

export type WidgetPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
export type WidgetSize = 'sm' | 'default';

export declare type PlatformFeeAndAccounts = {
  feeBps: number;
  feeAccounts: Map<string, PublicKey>;
};

export interface FormProps {
  swapMode?: SwapMode;
  initialAmount?: string;
  fixedAmount?: boolean;
  initialInputMint?: string;
  fixedInputMint?: boolean;
  initialOutputMint?: string;
  fixedOutputMint?: boolean;
}

export type DEFAULT_EXPLORER = 'Solana Explorer' | 'Solscan' | 'Solana Beach' | 'SolanaFM';
export interface IInit {
  endpoint: string;
  platformFeeAndAccounts?: PlatformFeeAndAccounts;
  formProps?: FormProps;
  strictTokenList?: boolean;
  defaultExplorer?: DEFAULT_EXPLORER;

  // Display & Styling
  displayMode?: 'modal' | 'integrated' | 'widget';
  integratedTargetId?: string;
  widgetStyle?: {
    position?: WidgetPosition;
    size?: WidgetSize;
  };
  containerStyles?: CSSProperties;
  containerClassName?: string;

  // Passthrough
  enableWalletPassthrough?: boolean;
  passthroughWalletContextState?: WalletContextState;
  onRequestConnectWallet?: () => void | Promise<void>; // When enableWalletPassthrough is true, and the user clicks on the connect wallet button, this callback will be called.

  // Callbacks
  onSwapError?: ({ error }: { error?: TransactionError }) => void;
  onSuccess?: ({ txid, swapResult }: { txid: string; swapResult: SwapResult }) => void;

  // Internal resolves
  scriptDomain?: string;
}

export interface JupiterTerminal {
  _instance: JSX.Element | null;
  init: (props: IInit) => void;
  resume: () => void;
  close: () => void;
  root: Root | null;

  // Passthrough
  enableWalletPassthrough: boolean;
  onRequestConnectWallet: IInit['onRequestConnectWallet'];
  store: ReturnType<typeof createStore>;
  syncProps: (props: {
    passthroughWalletContextState?: IInit['passthroughWalletContextState'];
  }) => void;

  // Callbacks
  onSwapError: IInit['onSwapError'];
  onSuccess: IInit['onSuccess'];
}
