import React, { useEffect, useMemo, useState } from 'react';
import type { AppProps } from 'next/app';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

import AppHeader from 'src/components/AppHeader/AppHeader';
import SexyChameleonText from 'src/components/SexyChameleonText/SexyChameleonText';
import Footer from 'src/components/Footer/Footer';

import ModalTerminal from 'src/content/ModalTerminal';
import IntegratedTerminal from 'src/content/IntegratedTerminal';
import { FormProps, IInit } from 'src/types';
import WidgetTerminal from 'src/content/WidgetTerminal';
import { JUPITER_DEFAULT_RPC, WRAPPED_SOL_MINT } from 'src/constants';
import classNames from 'classnames';
import FormConfigurator from 'src/components/FormConfigurator';
import { SwapMode } from '@jup-ag/react-hook';
import { Wallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletReadyState } from '@solana/wallet-adapter-base';

const isDeveloping = process.env.NODE_ENV === 'development' && typeof window !== 'undefined';
// In NextJS preview env settings
const isPreview = Boolean(process.env.NEXT_PUBLIC_IS_NEXT_PREVIEW);
if ((isDeveloping || isPreview) && typeof window !== 'undefined') {
  // Initialize an empty value, simulate webpack IIFE when imported
  (window as any).Jupiter = {};

  // Perform local fetch on development, and next preview
  Promise.all([import('../library'), import('../index')]).then((res) => {
    const [libraryProps, rendererProps] = res;

    (window as any).Jupiter = libraryProps;
    (window as any).JupiterRenderer = rendererProps;
  });
}

export default function App({ Component, pageProps }: AppProps) {
  const [tab, setTab] = useState<IInit['displayMode']>('widget');

  // Cleanup on tab change
  useEffect(() => {
    if (window.Jupiter._instance) {
      window.Jupiter._instance = null;
    }
  }, [tab]);

  const rpcUrl = JUPITER_DEFAULT_RPC;

  const [fixedInputMint, setFixedInputMint] = useState(false);
  const [fixedOutputMint, setFixedOutputMint] = useState(false);
  const [swapModeExactOut, setSwapModeExactOut] = useState(false);
  const [fixedAmount, setFixedAmount] = useState(false);
  const [initialAmount, setInitialAmount] = useState('');
  const [useWalletPassthrough, setUseWalletPassthrough] = useState(false);

  const formProps: FormProps = useMemo(() => {
    return {
      swapMode: swapModeExactOut ? SwapMode.ExactOut : SwapMode.ExactIn,
      initialAmount,
      fixedAmount,
      initialInputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      fixedInputMint,
      initialOutputMint: WRAPPED_SOL_MINT.toString(),
      fixedOutputMint,
    };
  }, [
    fixedInputMint,
    fixedOutputMint,
    swapModeExactOut,
    fixedAmount,
    initialAmount,
    useWalletPassthrough,
  ]);

  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (!useWalletPassthrough) {
      setWallet(null);
      return;
    }

    const fakeWallet: Wallet = {
      adapter: new UnsafeBurnerWalletAdapter(),
      readyState: WalletReadyState.Installed,
    };

    fakeWallet.adapter.connect().then(() => {
      setWallet(fakeWallet);
    });
  }, [useWalletPassthrough]);

  return (
    <div className="bg-jupiter-dark-bg h-screen w-screen overflow-auto flex flex-col justify-between">
      <div>
        <AppHeader />

        <div className=''>
          <div className="flex flex-col items-center h-full w-full mt-4 md:mt-14">
            <div className="flex flex-col justify-center items-center text-center">
              <SexyChameleonText className="text-4xl md:text-[52px] font-semibold px-4 pb-2 md:px-0">
                Jupiter Terminal
              </SexyChameleonText>
              <p className="text-[#9D9DA6] w-[80%] md:max-w-[60%] text-md mt-4 heading-[24px]">
                An open-sourced, lite version of Jupiter that provides end-to-end swap flow by linking it in your HTML.
                Check out the visual demo for the various integration modes below.
              </p>
            </div>
          </div>

          <div className='flex justify-center'>
            <div className='max-w-6xl bg-black/25 mt-12 rounded-xl flex flex-col md:flex-row w-full md:p-4'>
              <FormConfigurator
                fixedInputMint={fixedInputMint}
                setFixedInputMint={setFixedInputMint}
                fixedOutputMint={fixedOutputMint}
                setFixedOutputMint={setFixedOutputMint}
                swapModeExactOut={swapModeExactOut}
                setSwapModeExactOut={setSwapModeExactOut}
                initialAmount={initialAmount}
                setInitialAmount={setInitialAmount}
                fixedAmount={fixedAmount}
                setFixedAmount={setFixedAmount}
                useWalletPassthrough={useWalletPassthrough}
                setUseWalletPassthrough={setUseWalletPassthrough}
              />

              <div className='mt-8 md:mt-0 md:ml-4 h-full w-full bg-black/40 rounded-xl flex flex-col'>
                  <div className="mt-4 flex justify-center ">
                    <button
                      onClick={() => {
                        setTab('modal');
                      }}
                      type="button"
                      className={classNames('!bg-none relative px-4 justify-center', tab === 'modal' ? '' : 'opacity-20 hover:opacity-70')}
                    >
                      <div className="flex items-center text-md text-white">
                        Modal
                      </div>

                      {tab === 'modal'
                        ? <div className='absolute left-0 bottom-[-8px] w-full h-0.5 bg-gradient-to-r from-[rgba(252,192,10,1)] to-[rgba(78,186,233,1)]' />
                        : <div className='absolute left-0 bottom-[-8px] w-full h-[1px] bg-white/50' />}
                    </button>

                    <button
                      onClick={() => {
                        setTab('integrated');
                      }}
                      type="button"
                      className={classNames('!bg-none relative px-4 justify-center', tab === 'integrated' ? '' : 'opacity-20 hover:opacity-70')}
                    >
                      <div className="flex items-center text-md text-white">
                        Integrated
                      </div>
                      {tab === 'integrated' ? <div className='absolute left-0 bottom-[-8px] w-full h-0.5 bg-gradient-to-r from-[rgba(252,192,10,1)] to-[rgba(78,186,233,1)]' />
                        : <div className='absolute left-0 bottom-[-8px] w-full h-[1px] bg-white/50' />}
                    </button>

                    <button
                      onClick={() => {
                        setTab('widget');
                      }}
                      type="button"
                      className={classNames('!bg-none relative px-4 justify-center', tab === 'widget' ? '' : 'opacity-20 hover:opacity-70')}
                    >
                      <div className="flex items-center text-md text-white">
                        Widget
                      </div>
                      {tab === 'widget' ? <div className='absolute left-0 bottom-[-8px] w-full h-0.5 bg-gradient-to-r from-[rgba(252,192,10,1)] to-[rgba(78,186,233,1)]' />
                        : <div className='absolute left-0 bottom-[-8px] w-full h-[1px] bg-white/50' />}
                    </button>
                  </div>

                  <span className="flex justify-center text-center text-xs text-[#9D9DA6] mt-4">
                    {tab === 'modal' ? 'Jupiter renders as a modal and takes up the whole screen.' : null}
                    {tab === 'integrated' ? 'Jupiter renders as a part of your dApp.' : null}
                    {tab === 'widget'
                      ? 'Jupiter renders as part of a widget that can be placed at different positions on your dApp.'
                      : null}
                  </span>

                <div className="flex flex-grow items-center justify-center text-white/75">
                  {tab === 'modal' ? <ModalTerminal rpcUrl={rpcUrl} formProps={formProps} fakeWallet={wallet} /> : null}
                  {tab === 'integrated' ? <IntegratedTerminal rpcUrl={rpcUrl} formProps={formProps} fakeWallet={wallet} /> : null}
                  {tab === 'widget' ? <WidgetTerminal rpcUrl={rpcUrl} formProps={formProps} fakeWallet={wallet} /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-jupiter-bg mt-12">
        <Footer />
      </div>
    </div >
  );
}
