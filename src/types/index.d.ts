import { CSSProperties } from "react";

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
  onSwapError?: ({ error: string }) => void;
  onSuccess?: ({ txid: string }) => void;

  // More settings
  preload?: boolean;
}

export interface JupiterTerminal {
  _instance: React.ReactNode;
  init: (props: IInit) => void;
  resume: () => void;
  close: () => void;
  root: Root | null;
  
  // Passthrough & Callbacks
  passThroughWallet: Wallet | null;
  onSwapError?: ({ error: string }) => void;
  onSuccess?: ({ txid: string }) => void;
}