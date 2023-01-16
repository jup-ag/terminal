import { CSSProperties } from "react";
import { Root } from "react-dom/client";

import { Wallet } from "@solana/wallet-adapter-react";
import { PublicKey, TransactionError } from "@solana/web3.js";
import { SwapResult } from "@jup-ag/react-hook";

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

export interface IInit {
  mode: 'default' | 'outputOnly'
  mint?: string;
  endpoint: string;
  platformFeeAndAccounts?: PlatformFeeAndAccounts;

  // Display & Styling
  displayMode?: 'modal' | 'integrated' | 'widget';
  integratedTargetId?: string;
  widgetStyle?: {
    position?: WidgetPosition;
    size?: WidgetSize;
  };
  containerStyles?: CSSProperties;
  containerClassName?: string;

  // Passthrough & Callbacks
  passThroughWallet?: Wallet | null;
  onSwapError?: ({ error }: { error: string }) => void;
  onSuccess?: ({ txid }: { txid: string }) => void;

  // Internal resolves
  scriptDomain?: string;
}

export interface JupiterTerminal {
  _instance: React.ReactNode;
  init: (props: IInit) => void;
  resume: () => void;
  close: () => void;
  root: Root | null;

  // Passthrough & Callbacks
  passThroughWallet: Wallet | null;
  onSwapError?: ({ error }: { error?: TransactionError }) => void;
  onSuccess?: ({ txid }: { txid: string, lastSwapResult: SwapResult }) => void;
}