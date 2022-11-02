import type { AppProps } from 'next/app'
import ReactDOM from "react-dom/client";

import { TokenContextProvider } from '../contexts/TokenContextProvider';
import { ContextProvider } from '../contexts/ContextProvider';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import JupiterApp from 'src/components/Jupiter';
import JupButton from 'src/components/JupButton';
import { ScreenProvider } from 'src/contexts/ScreenProvider';
import { Wallet } from '@solana/wallet-adapter-react';
import { FC, useEffect, useState } from 'react';
import WalletPassthroughProvider from 'src/contexts/WalletPassthroughProvider';
import { shortenAddress } from 'src/misc/utils';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletReadyState } from '@solana/wallet-adapter-base';

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

const InitJupWithWallet: FC<{ wallet: Wallet | null }> = ({ wallet }) => {
  const initWithWallet = () => {
    if (!wallet) return;

    window.Jupiter.init({
      passThroughWallet: wallet,
      containerId: 'jupiter-instance'
    });
  }

  return (
    <JupButton onClick={initWithWallet}>
      Init Jupiter (with wallet connected)
    </JupButton>
  )
}

const WithAppWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  
  useEffect(() => {
    const fakeWallet: Wallet = {
      adapter: new UnsafeBurnerWalletAdapter(),
      readyState: WalletReadyState.Installed,
    }

    fakeWallet.adapter.connect()
      .then(() => {
        setWallet(fakeWallet)
      });
  }, [])

  return (
    <div className='flex flex-col space-y-8'>
      <div className="ml-2">
        <div className="text-sm text-black-50 dark:text-white">
          <span className='font-semibold'>Fake wallet:</span> {shortenAddress(`${wallet?.adapter.publicKey}`)}
        </div>
      </div>

      <InitJupWithWallet wallet={wallet} />
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  // TODO: Init configurable endpoints

  const initWithoutWallet = () => {
    window.Jupiter.init({
      containerId: 'jupiter-instance'
    });
  }

  return (
    <div className='flex flex-col h-screen w-screen items-center justify-center'>
      <h1 className='text-2xl'>Jupiter Embed App</h1>

      <div className='mt-10'>
        <div className='mt-10 border p-4'>
          <p className='text-lg font-semibold p-2'>Jupiter without wallet passthrough</p>
          <JupButton onClick={initWithoutWallet}>
            Init Jupiter (without wallet)
          </JupButton>
        </div>

        <div className='mt-10 border p-4'>
          <p className='text-lg font-semibold p-2'>Jupiter with wallet passthrough</p>
          <ContextProvider>
            <WithAppWallet />
          </ContextProvider>
        </div>
      </div>
    </div>
  );
}
