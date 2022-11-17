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
import { IInit } from 'src/types';
import { WRAPPED_SOL_MINT } from 'src/constants';

if (typeof window !== 'undefined') {
  window.Jupiter = Jupiter
}

const InitJupWithWallet: FC<{ mode: IInit['mode'], wallet: Wallet | null }> = ({ mode = 'default', wallet }) => {
  const initWithWallet = () => {
    if (!wallet) return;

    if (mode === 'default') {
      window.Jupiter.init({
        mode,
        endpoint: "https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci",
        passThroughWallet: wallet,
      });
    } else if (mode === 'outputOnly') {
      window.Jupiter.init({
        mode,
        mint: WRAPPED_SOL_MINT.toString(),
        endpoint: 'https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci',
        passThroughWallet: wallet,
      });
    }
  }

  return (
    <JupButton onClick={() => initWithWallet()}>
      Init Jupiter (with wallet connected)
    </JupButton>
  )
}

const WithAppWallet = ({ mode = 'default' }: { mode: IInit['mode'] }) => {
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

      <InitJupWithWallet mode={mode} wallet={wallet} />
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className='flex flex-col h-screen w-screen items-center justify-center'>
      <h1 className='text-2xl'>Jupiter Embed App</h1>

      <div className='flex mt-10 space-x-10' >
        <div>
          <h2 className='font-bold text-lg'>Default Mode</h2>
          <div className='mt-10 border p-4'>
            <p className='text-lg font-semibold p-2'>Jupiter without wallet passthrough</p>
            <JupButton onClick={() => {
              window.Jupiter.init({
                mode: 'default',
                endpoint: 'https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci'
              });
            }}>
              Init Jupiter (without wallet)
            </JupButton>
          </div>

          <div className='mt-10 border p-4'>
            <p className='text-lg font-semibold p-2'>Jupiter with wallet passthrough</p>
            <ContextProvider>
              <WithAppWallet mode={'default'} />
            </ContextProvider>
          </div>
        </div>

        <div>
          <h2 className='font-bold text-lg'>Output Only Mode</h2>
          <div className='mt-10 border p-4'>
            <p className='text-lg font-semibold p-2'>Jupiter without wallet passthrough</p>
            <JupButton onClick={() => {
              window.Jupiter.init({
                mode: 'outputOnly',
                mint: WRAPPED_SOL_MINT.toString(),
                endpoint: 'https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci'
              });
            }}>
              Init Jupiter (without wallet)
            </JupButton>
          </div>

          <div className='mt-10 border p-4'>
            <p className='text-lg font-semibold p-2'>Jupiter with wallet passthrough</p>
            <ContextProvider>
              <WithAppWallet mode={'outputOnly'} />
            </ContextProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
