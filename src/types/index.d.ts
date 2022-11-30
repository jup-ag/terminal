import { CSSProperties } from "react";

declare global {
  interface Window {
    Jupiter: JupiterTerminal;
  }
}

export interface IInit {
  mode: 'default' | 'outputOnly'
  mint?: string;
  endpoint: string;
  containerStyles?: CSSProperties;
  containerClassName?: string;

  // Passthrough & Callbacks
  passThroughWallet?: Wallet | null;
  onSwapError?: ({ error: string }) => void;
  onSuccess?: ({ txid: string }) => void;
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