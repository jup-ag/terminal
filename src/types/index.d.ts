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

/** The position of the widget */

export type WidgetPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'; 
/** The size of the widget */
export type WidgetSize = 'sm' | 'default'; 

export declare type PlatformFeeAndAccounts = {
  feeBps: number;
  feeAccounts: Map<string, PublicKey>;
};

export interface FormProps {
  /** Default to `ExactIn`. ExactOut can be used to get an exact output of a token (e.g. for Payments) */
  swapMode?: SwapMode; 
  /** Initial amount to swap */
  initialAmount?: string; 
  /** When true, user cannot change the amount (e.g. for Payments) */
  fixedAmount?: boolean; 
  /** Initial input token to swap */
  initialInputMint?: string; 
  /** When true, user cannot change the input token */
  fixedInputMint?: boolean; 
  /** Initial output token to swap */
  initialOutputMint?: string; 
  /** When true, user cannot change the output token (e.g. to buy your project's token) */
  fixedOutputMint?: boolean; 
}

/** Built in support for these explorers */
export type DEFAULT_EXPLORER = 'Solana Explorer' | 'Solscan' | 'Solana Beach' | 'SolanaFM';

export interface IInit {
  /** Solana RPC endpoint */
  endpoint: string; 
  /** TODO: Update to use the new platform fee and accounts */
  platformFeeAndAccounts?: PlatformFeeAndAccounts; 
  /** Configure Terminal's behaviour and allowed actions for your user */
  formProps?: FormProps; 
  /** Only allow strict token by [Jupiter Token List API](https://station.jup.ag/docs/token-list/token-list-api) */
  strictTokenList?: boolean; 
  /** Default explorer for your user */
  defaultExplorer?: DEFAULT_EXPLORER; 
  /** Auto connect to wallet on subsequent visits */
  autoConnect?: boolean; 

  /** Display & Styling */
  
  /** Display mode */
  displayMode?: 'modal' | 'integrated' | 'widget'; 
  /** When displayMode is 'integrated', this is the id of the element to render the integrated widget into */
  integratedTargetId?: string; 
  /** When displayMode is 'widget', this is the behaviour and style of the widget */
  widgetStyle?: { 
    position?: WidgetPosition;
    size?: WidgetSize;
  };
  /** In case additional styling is needed for Terminal container */
  containerStyles?: CSSProperties; 
  /** In case additional styling is needed for Terminal container */
  containerClassName?: string; 

  /** Passthrough */
  
  /** When true, wallet connection are handled by your dApp, and use `syncProps()` to syncronise wallet state with Terminal */
  enableWalletPassthrough?: boolean; 
  /** Optional, if wallet state is ready, you can pass it in here, or just use `syncProps()` */
  passthroughWalletContextState?: WalletContextState; 
  /** When enableWalletPassthrough is true, this allows Terminal to callback your dApp's wallet connection flow */
  onRequestConnectWallet?: () => void | Promise<void>; 

  /** Callbacks */
  /** When an error has occured during swap */
  onSwapError?: ({ error }: { error?: TransactionError }) => void; 
  /** When a swap has been successful */
  onSuccess?: ({ txid, swapResult }: { txid: string; swapResult: SwapResult }) => void; 

  /** Internal resolves */
  
  /** Internal use to resolve domain when loading script */
  scriptDomain?: string; 
}

export interface JupiterTerminal {
  _instance: JSX.Element | null;
  init: (props: IInit) => void;
  resume: () => void;
  close: () => void;
  root: Root | null;

  /** Passthrough */
  enableWalletPassthrough: boolean;
  onRequestConnectWallet: IInit['onRequestConnectWallet'];
  store: ReturnType<typeof createStore>;
  syncProps: (props: {
    passthroughWalletContextState?: IInit['passthroughWalletContextState'];
  }) => void;

  /** Callbacks */

  onSwapError: IInit['onSwapError'];
  onSuccess: IInit['onSuccess'];
}
