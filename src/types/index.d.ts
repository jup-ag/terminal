declare global {
  interface Window {
    Jupiter: JupiterEmbed;
  }
}

export interface IInit {
  passThroughWallet?: Wallet | null;
  containerStyles?: { zIndex: CSSProperties["zIndex"] };
}

export interface JupiterEmbed {
  _instance: React.ReactNode;
  passThroughWallet: Wallet | null;
  init: ({
    passThroughWallet,
    containerStyles,
  }?: IInit) => void;
  close: () => void;
  root: Root | null;
}