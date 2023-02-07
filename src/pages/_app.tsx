import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';

import 'tailwindcss/tailwind.css';
import '../styles/app.css';
import '../styles/globals.css';

import AppHeader from 'src/components/AppHeader/AppHeader';
import SexyChameleonText from 'src/components/SexyChameleonText/SexyChameleonText';
import TerminalModalIcon from 'src/icons/TerminalModalIcon';
import TerminalIntegratedIcon from 'src/icons/TerminalIntegratedIcon';
import TerminalWidgetIcon from 'src/icons/TerminalWidgetIcon';
import Footer from 'src/components/Footer/Footer';

import JupButton from 'src/components/JupButton';
import ModalTerminal from 'src/content/ModalTerminal';
import IntegratedTerminal from 'src/content/IntegratedTerminal';
import { IInit } from 'src/types';
import WidgetTerminal from 'src/content/WidgetTerminal';

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
  const [tab, setTab] = useState<IInit['displayMode']>('modal');

  // Cleanup on tab change
  useEffect(() => {
    if (window.Jupiter._instance) {
      window.Jupiter._instance = null;
    }
  }, [tab]);

  const [rpcUrl, setRPCUrl] = useState<string>('https://neat-hidden-sanctuary.solana-mainnet.discover.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed');

  const validateURL = (url: string) => {
    const URLRegex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    return Boolean(url.match(URLRegex));
  }

  const handleCusomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRPCUrl(e.target.value);
  };

  const isCustomUrlValid = validateURL(rpcUrl);

  return (
    <div className="bg-jupiter-dark-bg h-screen w-screen overflow-auto flex flex-col justify-between">
      <div>
        <AppHeader />

        <div className="flex">
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

            <div className="space-x-2 p-1.5 mt-12 bg-black/30 rounded-xl">
              <JupButton
                size="sm"
                onClick={() => {
                  setTab('modal');
                }}
                type="button"
                className={tab === 'modal' ? 'bg-white/10' : 'opacity-20 hover:opacity-70'}
              >
                <div className="flex items-center space-x-2 text-xs">
                  <TerminalModalIcon />
                  <div>Modal</div>
                </div>
              </JupButton>
              <JupButton
                size="sm"
                onClick={() => {
                  setTab('integrated');
                }}
                type="button"
                className={tab === 'integrated' ? 'bg-white/10' : 'opacity-20 hover:opacity-70'}
              >
                <div className="flex items-center space-x-2 text-xs">
                  <TerminalIntegratedIcon />
                  <div>Integrated</div>
                </div>
              </JupButton>
              <JupButton
                size="sm"
                onClick={() => {
                  setTab('widget');
                }}
                type="button"
                className={tab === 'widget' ? 'bg-white/10' : 'opacity-20 hover:opacity-70'}
              >
                <div className="flex items-center space-x-2 text-xs">
                  <TerminalWidgetIcon />
                  <div>Widget</div>
                </div>
              </JupButton>
            </div>

            <span className="flex justify-center text-center text-xs max-w-[90%] md:max-w-[50%] text-[#9D9DA6] mt-4">
              {tab === 'modal' ? 'Jupiter renders as a modal and takes up the whole screen.' : null}
              {tab === 'integrated' ? 'Jupiter renders as a part of your dApp.' : null}
              {tab === 'widget'
                ? 'Jupiter renders as part of a widget that can be placed at different positions on your dApp.'
                : null}
            </span>

            <div className='max-w-3xl px-4 md:px-0  flex flex-col lg:flex-row items-end mt-12'>
              <div>
                <p className='font-semibold text-lg text-white'>RPC</p>
                <div className=' rounded-xl overflow-hidden'>
                  <p className="lg:w-[60%] text-[#9D9DA6] text-xs my-1">
                    You will need a Solana RPC endpoint to connect to the network. (e.g Quiknode, RPCPool, etc.)
                  </p>
                </div>
              </div>

              <input
                className="w-full mt-2 lg:mt-0 lg:w-[340px] rounded-xl items-center bg-black/30 text-sm text-white/50 placeholder:text-white/30 placeholder:text-white text-left px-4 py-3.5"
                value={rpcUrl}
                onChange={handleCusomInput}
                placeholder={`e.g. https://api.mainnet-beta.solana.com`}
              />
              {!!rpcUrl && !isCustomUrlValid && (
                <p className="text-[rgba(240,74,68,0.7)] !mt-2 pl-2 text-xs">Invalid URL!</p>
              )}
            </div>

            <div className="w-full max-w-3xl px-4 md:px-0 text-white/75 mb-16">
              {tab === 'modal' ? <ModalTerminal rpcUrl={rpcUrl} /> : null}
              {tab === 'integrated' ? <IntegratedTerminal rpcUrl={rpcUrl} /> : null}
              {tab === 'widget' ? <WidgetTerminal rpcUrl={rpcUrl} /> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-jupiter-bg">
        <Footer />
      </div>
    </div>
  );
}
