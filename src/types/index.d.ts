import { CSSProperties } from 'react';
import { Root } from 'react-dom/client';
import { createStore } from 'jotai';
import { Wallet } from '@jup-ag/wallet-adapter';
import { Connection, PublicKey, TransactionError } from '@solana/web3.js';
import { SwapResult } from '@jup-ag/react-hook';
import { WalletContextState } from '@jup-ag/wallet-adapter';
import EventEmitter from 'events';
import { QuoteResponse } from 'src/contexts/SwapContext';

declare global {
  interface Window {
    Jupiter: JupiterTerminal;
  }
}

/** The position of the widget */

export type WidgetPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
/** The size of the widget */
export type WidgetSize = 'sm' | 'default';

export type SwapMode = "ExactInOrOut" | "ExactIn" | "ExactOut";

export interface FormProps {
  /** Default to `ExactInOrOut`. ExactOut can be used to get an exact output of a token (e.g. for Payments) */
  swapMode?: SwapMode;
  /** Initial amount to swap */
  initialAmount?: string;
  /** When true, user cannot change the amount (e.g. for Payments) */
  fixedAmount?: boolean;
  /** Initial input token to swap */
  initialInputMint?: string;
  /** Initial output token to swap */
  initialOutputMint?: string;
  /** Based token that can never changed  */
  fixedMint?: string;
  /** Referral account to use for the swap */
  referralAccount?: string;
  /** Referral fee to use for the swap */
  referralFee?: number;
}

/** Built in support for these explorers */
export type DEFAULT_EXPLORER = 'Solana Explorer' | 'Solscan' | 'Solana Beach' | 'SolanaFM';

export interface TransactionInstruction {
  accounts: {
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }[];
  data: string;
  programId: string;
}

export interface IInit {
  /** Settings saved in local storage will be prefixed with this
   * You can reset your user's local storage by changing this value
   */
  localStoragePrefix?: string;

  /** Configure Terminal's behaviour and allowed actions for your user */
  formProps?: FormProps;
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
    offset?: {
      x?: number;
      y?: number;
    };
  };
  /** In case additional styling is needed for Terminal container */
  containerStyles?: CSSProperties;
  /** In case additional styling is needed for Terminal container */
  containerClassName?: string;

  /** When true, wallet connection are handled by your dApp, and use `syncProps()` to syncronise wallet state with Terminal */
  enableWalletPassthrough?: boolean;
  /** Optional, if wallet state is ready, you can pass it in here, or just use `syncProps()` */
  passthroughWalletContextState?: WalletContextState;
  /** When enableWalletPassthrough is true, this allows Terminal to callback your dApp's wallet connection flow */
  onRequestConnectWallet?: () => void | Promise<void>;

  /** Callbacks */
  /** When an error has occured during swap */
  onSwapError?: ({
    error,
    quoteResponseMeta,
  }: {
    error?: TransactionError;
    quoteResponseMeta: QuoteResponse | null;
  }) => void;
  /** When a swap has been successful */
  onSuccess?: ({
    txid,
    swapResult,
    quoteResponseMeta,
  }: {
    txid: string;
    swapResult: SwapResult;
    quoteResponseMeta: QuoteResponse | null;
  }) => void;
  /** Callback when there's changes to the form */
  onFormUpdate?: (form: IForm) => void;
  /** Callback when there's changes to the screen */
  onScreenUpdate?: (screen: IScreen) => void;

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
  syncProps: (props: { passthroughWalletContextState?: IInit['passthroughWalletContextState'] }) => void;

  /** Callbacks */
  onSwapError: IInit['onSwapError'];
  onSuccess: IInit['onSuccess'];
  onFormUpdate: IInit['onFormUpdate'];
  onScreenUpdate: IInit['onScreenUpdate'];

  /** Special props */
  localStoragePrefix: string;
}
