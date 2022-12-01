import React, { FC, useEffect, useState } from 'react';

import { Wallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletReadyState } from '@solana/wallet-adapter-base';

import JupButton from 'src/components/JupButton';
import { shortenAddress } from 'src/misc/utils';
import { IInit } from 'src/types';
import { WRAPPED_SOL_MINT } from 'src/constants';

import { ContextProvider } from '../contexts/ContextProvider';

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

const ModalTerminal = () => {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsActive(Boolean(window.Jupiter._instance))
    }, 500)

    return () => clearInterval(intervalId);
  }, [])

  return (
    <>
      <div>
        <h2 className='font-bold text-lg mb-4'>Active instance</h2>

        <JupButton disabled={!isActive} onClick={() => {
          if (typeof window !== 'undefined') {
            window.Jupiter.resume();
          }
        }}>
          {isActive ? 'Resume Activity' : 'No active instance'}
        </JupButton>
      </div>

      <hr className='my-8' />

      <div className='h-full flex flex-col lg:flex-row lg:space-x-10' >
        <div>
          <h2 className='font-bold text-lg mb-4'>Default Mode</h2>
          <div className='border p-4'>
            <p className='text-lg font-semibold p-2'>Jupiter without wallet passthrough</p>
            <JupButton onClick={() => {
              window.Jupiter.init({
                mode: 'default',
                endpoint: 'https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci',
              });
            }}>
              Init Jupiter (without wallet)
            </JupButton>
          </div>

          <div className='border p-4'>
            <p className='text-lg font-semibold p-2'>Jupiter with wallet passthrough</p>
            <ContextProvider>
              <WithAppWallet mode={'default'} />
            </ContextProvider>
          </div>
        </div>

        <div className='mt-8 lg:mt-0'>
          <h2 className='font-bold text-lg mb-4'>Output Only Mode</h2>
          <div className='border p-4'>
            <p className='text-lg font-semibold p-2'>Jupiter without wallet passthrough</p>
            <JupButton onClick={() => {
              window.Jupiter.init({
                mode: 'outputOnly',
                mint: WRAPPED_SOL_MINT.toString(),
                endpoint: 'https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci',
              });
            }}>
              Init Jupiter (without wallet)
            </JupButton>
          </div>

          <div className='border p-4'>
            <p className='text-lg font-semibold p-2'>Jupiter with wallet passthrough</p>
            <ContextProvider>
              <WithAppWallet mode={'outputOnly'} />
            </ContextProvider>
          </div>
        </div>
      </div>
    </>
  )
}

export default ModalTerminal