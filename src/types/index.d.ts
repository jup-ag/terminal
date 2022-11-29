import { CSSProperties } from "react";

declare global {
  interface Window {
    Jupiter: JupiterEmbed;
  }
}

export interface IInit {
  mode: 'default' | 'outputOnly'
  mint?: string;
  endpoint: string;
  passThroughWallet?: Wallet | null;
  containerStyles?: CSSProperties
  containerClassName?: string
}

export interface JupiterEmbed {
  _instance: React.ReactNode;
  passThroughWallet: Wallet | null;
  init: ({
    mode,
    mint,
    endpoint,
    passThroughWallet,
    containerStyles,
  }: IInit) => void;
  resume: () => void;
  close: () => void;
  root: Root | null;
}