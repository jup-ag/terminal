import React from 'react';
import type { AppProps } from 'next/app'


import { ContextProvider } from '../contexts/ContextProvider';

import JupButton from 'src/components/JupButton';
import { Wallet } from '@solana/wallet-adapter-react';
import { FC, useEffect, useState } from 'react';
import { shortenAddress } from 'src/misc/utils';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletReadyState } from '@solana/wallet-adapter-base';

import 'tailwindcss/tailwind.css';
import '../styles/app.css';
import '../styles/globals.css';

import { Jupiter } from '../index';

if (typeof window !== 'undefined') {
  window.Jupiter = Jupiter
}

const InitJupWithWallet: FC<{ wallet: Wallet | null }> = ({ wallet }) => {
  const initWithWallet = () => {
    if (!wallet) return;

    window.Jupiter.init({
      passThroughWallet: wallet,
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
    window.Jupiter.init();
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
