import { CSSProperties } from 'react';
import { Root } from 'react-dom/client';

import { Wallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionError } from '@solana/web3.js';
import { SwapMode, SwapResult } from '@jup-ag/react-hook';

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

export interface ConfigurableProps {
  swapMode?: SwapMode;
  initialAmount?: string;
  fixedAmount?: boolean;
  initialInputMint?: string;
  fixedInputMint?: boolean;
  initialOutputMint?: string;
  fixedOutputMint?: boolean;
}

export interface IInit {
  endpoint: string;
  platformFeeAndAccounts?: PlatformFeeAndAccounts;
  configurableProps?: ConfigurableProps;
  
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
  onSwapError?: ({ error }: { error?: TransactionError }) => void;
  onSuccess?: ({ txid, swapResult }: { txid: string; swapResult: SwapResult }) => void;
  
  // Internal resolves
  scriptDomain?: string;
  
  /** Deprecated
    use configurableProps for more flexibility in customising interactions. 
    existing user on `mode` props will have their capability unaffected, and mapped accordingly to `configurableProps`

    mode: 'default'
    ```tsx
    const configurableProps = {
      fixedInputMint: undefined,
      fixedOutputMint: undefined,
      swapModeExactOut: undefined,
      fixedAmount: undefined,
    }
    ```
    
    mode: 'outputOnly'
    ```tsx
    const configurableProps = {
      fixedInputMint: undefined,
      swapModeExactOut: undefined,
      fixedAmount: undefined,
      initialOutputMint: 'So11111111111111111111111111111111111111112',
      fixedOutputMint: true,
    }
    ```
  */
  mode?: 'default' | 'outputOnly';
  mint?: string;
}

export interface JupiterTerminal {
  _instance: React.ReactNode;
  init: (props: IInit) => void;
  resume: () => void;
  close: () => void;
  root: Root | null;

  // Passthrough & Callbacks
  passThroughWallet: IInit['passThroughWallet'];
  onSwapError: IInit['onSwapError'];
  onSuccess: IInit['onSuccess'];
}
