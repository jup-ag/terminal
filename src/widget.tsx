import React from 'react';
import ReactDOM from "react-dom/client";
import { Wallet } from "@solana/wallet-adapter-react";

import JupiterApp from "./components/Jupiter";
import { ContextProvider } from "./contexts/ContextProvider";
import { ScreenProvider } from "./contexts/ScreenProvider";
import { TokenContextProvider } from "./contexts/TokenContextProvider";
import WalletPassthroughProvider from "./contexts/WalletPassthroughProvider";

const renderJupiterApp = () => {
  return (
    <div className='absolute top-0 w-screen h-screen flex items-center justify-center bg-black/25'>
      <ContextProvider customEndpoint={'https://mango.rpcpool.com'}>
        <WalletPassthroughProvider>
          <TokenContextProvider>
            <ScreenProvider>
              <JupiterApp />
            </ScreenProvider>
          </TokenContextProvider>
        </WalletPassthroughProvider>
      </ContextProvider>
    </div>
  )
}

interface IInit {
  passThroughWallet?: Wallet | null;
  containerId: string;
}

interface JupiterEmbed {
  containerId: string;
  _instance: React.ReactNode;
  passThroughWallet: Wallet | null;
  init: ({ passThroughWallet, containerId }: IInit) => void;
  close: () => void;
  root: ReactDOM.Root | null;
}

declare global {
  interface Window {
    Jupiter: JupiterEmbed;
  }
}

(() => {
  if (typeof window !== 'undefined') {
    window.Jupiter = {
      containerId: '',
      _instance: null,
      passThroughWallet: null,
      root: null,
      init: ({ containerId, passThroughWallet = null }) => {
        const targetDiv = document.getElementById(containerId) ?? document.createElement('div');

        const addedPassThrough = !window.Jupiter.passThroughWallet && passThroughWallet;
        const removedPassThrough = window.Jupiter.passThroughWallet && !passThroughWallet;
        window.Jupiter.passThroughWallet = passThroughWallet;

        if (addedPassThrough || removedPassThrough) {
          window.Jupiter.root?.unmount();
          window.Jupiter._instance = null;
          window.Jupiter.init({ containerId, passThroughWallet })
        }

        if (window.Jupiter._instance) {
          targetDiv.classList.remove('hidden')
          targetDiv.classList.add('block')
          return;
        }

        targetDiv.id = containerId
        document.body.appendChild(targetDiv);

        const root = ReactDOM.createRoot(
          targetDiv
        );
        window.Jupiter.root = root;

        const element = window.Jupiter._instance || renderJupiterApp();
        root.render(element);
        window.Jupiter.containerId = containerId;
        window.Jupiter._instance = element;
      },
      close: () => {
        if (window.Jupiter._instance) {
          const targetDiv = document.getElementById(window.Jupiter.containerId);
          if (targetDiv) {
            targetDiv.classList.add('hidden')
          }
        }
      }
    }
  }
})();