import React, { useEffect, useState } from 'react';

import { Wallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletReadyState } from '@solana/wallet-adapter-base';

import JupButton from 'src/components/JupButton';
import { shortenAddress } from 'src/misc/utils';
import { IInit } from 'src/types';
import { WRAPPED_SOL_MINT } from 'src/constants';

import { ContextProvider } from '../contexts/ContextProvider';
import { PlayIcon } from 'src/icons/PlayIcon';
import WalletConnectedGraphic from 'src/icons/WalletConnectedGraphic';
import WalletDisconnectedGraphic from 'src/icons/WalletDisconnectedGraphic';
import InfoIcon from 'src/icons/InfoIcon';

const endpoint = 'https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci';
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

  const initWithWallet = () => {
    if (!wallet) return;

    if (mode === 'default') {
      window.Jupiter.init({
        mode,
        endpoint,
        passThroughWallet: wallet,
      });
    } else if (mode === 'outputOnly') {
      window.Jupiter.init({
        mode,
        mint: WRAPPED_SOL_MINT.toString(),
        endpoint,
        passThroughWallet: wallet,
      });
    }
  }

  return (
    <div className='p-4 hover:bg-black/25 rounded-xl cursor-pointer flex flex-col items-center text-white' onClick={initWithWallet}>
      <WalletConnectedGraphic />
      <span className='text-xs mt-4'>Wallet Passthrough</span>
      <span className='text-[10px] text-white/50'>
        Fake wallet: {shortenAddress(`${wallet?.adapter.publicKey}`)}
      </span>
    </div>
  );
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
      <div className='flex flex-col md:flex-row items-center justify-between mt-9'>
        <div className='flex items-center space-x-2 has-tooltip'>
          <h2 className='font-semibold text-xl'>Active instance</h2>
          
          <div className='mt-1 relative'>
            <InfoIcon />
            <p className='tooltip w-[320px] right-[-80px] md:right-unset text-xs'>Once initialized and closed, previous activity can be resumed.</p>
          </div>
        </div>

        <JupButton className='mt-4 md:mt-0 h-12' disabled={!isActive} onClick={() => {
          if (typeof window !== 'undefined') {
            window.Jupiter.resume();
          }
        }}>
          <div className='flex items-center space-x-2 h-full'>
            {isActive
              ? (
                <>
                  <PlayIcon />
                  <span>Resume Activity</span>
                </>
              )
              : <span>No active instance</span>
            }
          </div>
        </JupButton>
      </div>

      <div className='py-4'>
        <div className='border-b border-white/10' />
      </div>

      <div>
        <div className='flex flex-col md:flex-row justify-between'>
          <div>
            <h2 className='font-semibold text-lg'>Default Mode</h2>
            <p className='text-white/30 text-xs md:max-w-[65%]'>In this mode, users can swap between any token pair.</p>
          </div>

          <div className='flex justify-center'>
            {/* Without wallet */}
            <div className='p-4 hover:bg-black/25 rounded-xl cursor-pointer flex flex-col items-center text-white'
              onClick={() => {
                window.Jupiter.init({
                  mode: 'default',
                  endpoint,
                });
              }}
            >
              <WalletDisconnectedGraphic />
              <span className='text-xs mt-4'>Without wallet</span>
            </div>

            {/* Wallet passthrough */}
            <ContextProvider>
              <WithAppWallet mode={'default'} />
            </ContextProvider>
          </div>
        </div>

        <div className='py-4'>
          <div className='border-b border-white/10' />
        </div>

        <div className='flex flex-col md:flex-row justify-between'>
          <div>
            <h2 className='font-semibold text-lg'>Fixed output mode</h2>
            <p className='text-white/30 text-xs md:max-w-[65%]'>In this mode, users can only swap to a fixed output token.</p>
          </div>

          <div className='flex justify-center'>
            {/* Without wallet */}
            <div className='p-4 hover:bg-black/25 rounded-xl cursor-pointer flex flex-col items-center text-white'
              onClick={() => {
                window.Jupiter.init({
                  mode: 'outputOnly',
                  mint: WRAPPED_SOL_MINT.toString(),
                  endpoint,
                });
              }}
            >
              <WalletDisconnectedGraphic />
              <span className='text-xs mt-4'>Without wallet</span>
            </div>

            {/* Wallet passthrough */}
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