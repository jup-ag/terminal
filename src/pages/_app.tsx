import { UnifiedWalletButton, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { DefaultSeo } from 'next-seo';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

import AppHeader from 'src/components/AppHeader/AppHeader';
import Footer from 'src/components/Footer/Footer';

import { SolflareWalletAdapter, UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import CodeBlocks from 'src/components/CodeBlocks/CodeBlocks';
import FormConfigurator from 'src/components/FormConfigurator';
import { IFormConfigurator, INITIAL_FORM_CONFIG } from 'src/constants';
import { IInit } from 'src/types';
import V2SexyChameleonText from 'src/components/SexyChameleonText/V2SexyChameleonText';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setTerminalInView } from 'src/stores/jotai-terminal-in-view';
import { cn } from 'src/misc/cn';
import { TerminalGroup } from 'src/content/TerminalGroup';
import SideDrawer from 'src/components/SideDrawer/SideDrawer';
import JupiterLogo from 'src/icons/JupiterLogo';
import CloseIcon from 'src/icons/CloseIcon';

const isDevNodeENV = process.env.NODE_ENV === 'development';
const isDeveloping = isDevNodeENV && typeof window !== 'undefined';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const TERMINAL_MODE: { label: string; value: IInit['displayMode'] }[] = [
  {
    label: 'Modal',
    value: 'modal',
  },
  {
    label: 'Integrated',
    value: 'integrated',
  },
  {
    label: 'Widget',
    value: 'widget',
  },
];

export default function App() {
  const [displayMode, setDisplayMode] = useState<IInit['displayMode']>('integrated');
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(true);
  const [sideDrawerTab, setSideDrawerTab] = useState<'config' | 'snippet'>('config');

  // Cleanup on tab change
  useEffect(() => {
    if (window.Jupiter._instance) {
      window.Jupiter._instance = null;
    }

    setTerminalInView(false);
  }, [displayMode]);

  const methods = useForm<IFormConfigurator>({
    defaultValues: INITIAL_FORM_CONFIG,
  });

  const { control } = methods;
  const simulateWalletPassthrough = useWatch({ control, name: 'simulateWalletPassthrough' });

  // Solflare wallet adapter comes with Metamask Snaps supports
  const wallets = useMemo(() => [new UnsafeBurnerWalletAdapter(), new SolflareWalletAdapter()], []);

  const ShouldWrapWalletProvider = useMemo(() => {
    return simulateWalletPassthrough
      ? ({ children }: { children: ReactNode }) => (
          <UnifiedWalletProvider
            wallets={wallets}
            config={{
              env: 'mainnet-beta',
              autoConnect: true,
              metadata: {
                name: 'Jupiter Terminal',
                description: '',
                url: 'https://terminal.jup.ag',
                iconUrls: [''],
              },
              theme: 'jupiter',
            }}
          >
            {children}
          </UnifiedWalletProvider>
        )
      : React.Fragment;
  }, [wallets, simulateWalletPassthrough]);

  return (
    <QueryClientProvider client={queryClient}>
      <DefaultSeo
        title={'Jupiter Terminal'}
        openGraph={{
          type: 'website',
          locale: 'en',
          title: 'Jupiter Terminal',
          description: 'Jupiter Terminal: An open-sourced, lite version of Jupiter that provides end-to-end swap flow.',
          url: 'https://terminal.jup.ag/',
          site_name: 'Jupiter Terminal',
          images: [
            {
              url: `https://static.jup.ag/static/jupiter-meta-main.jpg`,
              alt: 'Jupiter Aggregator',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
          site: 'jup.ag',
          handle: '@JupiterExchange',
        }}
      />
      <FormProvider {...methods}>
        <div className="bg-landing-bg h-screen w-screen max-w-screen overflow-x-hidden flex flex-col justify-between gap-y-4">
          <SideDrawer isOpen={isSideDrawerOpen} setIsOpen={setIsSideDrawerOpen}>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center py-4 px-4 text-white gap-2 border-b border-white/10">
                <h1 className="flex items-center text-lg font-semibold text-white">
                  <JupiterLogo />
                  <span className="ml-3">Jupiter</span>
                </h1>
                <button
                  className="p-2 text-white/50 hover:text-gray-300 transition-colors"
                  onClick={() => setIsSideDrawerOpen(false)}
                  aria-label="Close drawer"
                >
                  <CloseIcon width={20} height={20} />
                </button>
              </div>

              <div className="flex justify-between items-center my-4 mx-4 text-white gap-2 border border-white/10 rounded-full">
                <button
                  className={cn('flex-1 p-2 rounded-full text-landing-primary', {
                    'bg-landing-primary/20 ': sideDrawerTab === 'config',
                  })}
                  onClick={() => setSideDrawerTab('config')}
                >
                  Config
                </button>
                <button
                  className={cn('flex-1 p-2 rounded-full text-landing-primary', {
                    'bg-landing-primary/20 ': sideDrawerTab === 'snippet',
                  })}
                  onClick={() => setSideDrawerTab('snippet')}
                >
                  Snippet
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2">
                {sideDrawerTab === 'config' ? <FormConfigurator /> : <CodeBlocks displayMode={'integrated'} />}
              </div>
            </div>
          </SideDrawer>
          <div>
            <AppHeader isSideDrawerOpen={isSideDrawerOpen} setIsSideDrawerOpen={setIsSideDrawerOpen} />

            <div className="px-2">
              <div className="flex flex-col items-center h-full w-full mt-4 md:mt-5">
                <div className="flex flex-col justify-center items-center text-center">
                  <div className="flex space-x-2">
                    <V2SexyChameleonText className="text-4xl md:text-[52px] font-semibold px-4 pb-2 md:px-0">
                      Jupiter Plugin
                    </V2SexyChameleonText>
                  </div>
                  <p className="text-[#9D9DA6] text-md mt-4 heading-[24px]">
                    Seamlessly embed a full Jupiter Ultra Swap directly in your application
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="max-w-[420px] mt-8 rounded-xl flex flex-col md:flex-row w-full relative border border-white/10">
                  <ShouldWrapWalletProvider>
                    <div className=" h-full w-full rounded-xl flex flex-col b">
                      <div className="flex flex-row justify-between py-3 px-2 border-b border-white/10">
                        {TERMINAL_MODE.map((mode) => (
                          <button
                            key={mode.value}
                            onClick={() => setDisplayMode(mode.value)}
                            type="button"
                            className={cn(
                              'relative px-4 py-2 justify-center text-white/20  rounded-full text-sm flex-1 ',
                              {
                                'bg-landing-primary/10 text-landing-primary': displayMode === mode.value,
                              },
                            )}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-grow  justify-center text-white/75 flex-col mx-auto px-2 ">
                        <div className="flex flex-row justify-between  min-h-[57px] items-center">
                          <div className="flex justify-between flex-row">
                            <button
                              className="relative text-sm text-landing-primary font-semibold p-1  rounded-lg underline"
                              onClick={() => setIsSideDrawerOpen(true)}
                            >
                              Customize
                              {/* <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M128 80a48 48 0 1 0 48 48a48.05 48.05 0 0 0-48-48m0 80a32 32 0 1 1 32-32a32 32 0 0 1-32 32m88-29.84q.06-2.16 0-4.32l14.92-18.64a8 8 0 0 0 1.48-7.06a107.2 107.2 0 0 0-10.88-26.25a8 8 0 0 0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186 40.54a8 8 0 0 0-3.94-6a107.7 107.7 0 0 0-26.25-10.87a8 8 0 0 0-7.06 1.49L130.16 40h-4.32L107.2 25.11a8 8 0 0 0-7.06-1.48a107.6 107.6 0 0 0-26.25 10.88a8 8 0 0 0-3.93 6l-2.64 23.76q-1.56 1.49-3 3L40.54 70a8 8 0 0 0-6 3.94a107.7 107.7 0 0 0-10.87 26.25a8 8 0 0 0 1.49 7.06L40 125.84v4.32L25.11 148.8a8 8 0 0 0-1.48 7.06a107.2 107.2 0 0 0 10.88 26.25a8 8 0 0 0 6 3.93l23.72 2.64q1.49 1.56 3 3L70 215.46a8 8 0 0 0 3.94 6a107.7 107.7 0 0 0 26.25 10.87a8 8 0 0 0 7.06-1.49L125.84 216q2.16.06 4.32 0l18.64 14.92a8 8 0 0 0 7.06 1.48a107.2 107.2 0 0 0 26.25-10.88a8 8 0 0 0 3.93-6l2.64-23.72q1.56-1.48 3-3l23.78-2.8a8 8 0 0 0 6-3.94a107.7 107.7 0 0 0 10.87-26.25a8 8 0 0 0-1.49-7.06Zm-16.1-6.5a74 74 0 0 1 0 8.68a8 8 0 0 0 1.74 5.48l14.19 17.73a91.6 91.6 0 0 1-6.23 15l-22.6 2.56a8 8 0 0 0-5.1 2.64a74 74 0 0 1-6.14 6.14a8 8 0 0 0-2.64 5.1l-2.51 22.58a91.3 91.3 0 0 1-15 6.23l-17.74-14.19a8 8 0 0 0-5-1.75h-.48a74 74 0 0 1-8.68 0a8 8 0 0 0-5.48 1.74l-17.78 14.2a91.6 91.6 0 0 1-15-6.23L82.89 187a8 8 0 0 0-2.64-5.1a74 74 0 0 1-6.14-6.14a8 8 0 0 0-5.1-2.64l-22.58-2.52a91.3 91.3 0 0 1-6.23-15l14.19-17.74a8 8 0 0 0 1.74-5.48a74 74 0 0 1 0-8.68a8 8 0 0 0-1.74-5.48L40.2 100.45a91.6 91.6 0 0 1 6.23-15L69 82.89a8 8 0 0 0 5.1-2.64a74 74 0 0 1 6.14-6.14A8 8 0 0 0 82.89 69l2.51-22.57a91.3 91.3 0 0 1 15-6.23l17.74 14.19a8 8 0 0 0 5.48 1.74a74 74 0 0 1 8.68 0a8 8 0 0 0 5.48-1.74l17.77-14.19a91.6 91.6 0 0 1 15 6.23L173.11 69a8 8 0 0 0 2.64 5.1a74 74 0 0 1 6.14 6.14a8 8 0 0 0 5.1 2.64l22.58 2.51a91.3 91.3 0 0 1 6.23 15l-14.19 17.74a8 8 0 0 0-1.74 5.53Z"/></svg> */}
                              <span className="absolute top-1 -right-0.5 h-1.5 w-1.5 rounded-full bg-landing-primary animate-pulse "></span>
                            </button>
                          </div>
                          <div
                            className={cn('text-white text-center', {
                              hidden: !simulateWalletPassthrough,
                            })}
                          >
                            <UnifiedWalletButton />
                          </div>
                        </div>
                        <TerminalGroup tab={displayMode} />
                      </div>
                      <span className="flex justify-center text-center text-xs text-[#9D9DA6] mb-2">
                        {displayMode === 'modal' ? 'Jupiter renders as a modal and takes up the whole screen.' : null}
                        {displayMode === 'integrated' ? 'Jupiter renders as a part of your dApp.' : null}
                        {displayMode === 'widget'
                          ? 'Jupiter renders as part of a widget that can be placed at different positions on your dApp.'
                          : null}
                      </span>
                    </div>
                  </ShouldWrapWalletProvider>
                </div>
              </div>
            </div>
          </div>

          <div className="text-white grid  md:grid-cols-2 gap-4 px-2 mt-4 max-w-[700px] mx-auto">
            <div className="bg-[#182220] rounded-xl p-4 relative h-[160px] flex flex-col gap-y-2 ">
              <div className="text-xl font-semibold">Swap fees</div>
              <div className="text-white/60 text-sm">Earn swap fees easily.</div>

              <img src="/upsell/swap_fee.svg" alt="swap-fees" className="absolute top-0 right-0" />
            </div>
            <div className="bg-[#151E31] rounded-xl p-4 relative gap-y-2 flex flex-col h-[160px]">
              <div className="text-xl font-semibold w-[80%]">Customizable Options</div>
              <div className="text-white/60 w-[80%] text-sm">
                Multiple display options and other configurations to match your application&apos;s needs.
              </div>

              <img src="/upsell/customizable_options.svg" alt="swap-fees" className="absolute top-0 right-0" />
            </div>
            <div className="bg-[#002F25] rounded-xl p-4 relative h-[160px] flex flex-col gap-y-2">
              <div className="text-xl font-semibold w-[80%]">Ultra Swap</div>
              <div className="text-white/60 w-[80%] text-sm">
                Seamlessly integrate end to end jup.ag swap experience with all Ultra features
              </div>
              <img src="/upsell/seemless_integration.svg" alt="swap-fees" className="absolute top-0 right-0" />
            </div>
            <div className="bg-[#231B32] rounded-xl p-4 relative h-[160px] flex flex-col gap-y-2">
              <div className="text-xl font-semibold w-[80%]">RPC-less</div>
              <div className="text-white/60 w-[80%] text-sm">
              All the Ultra goodness without any RPCs - we handle everything for you, including transaction sending
              </div>
              <img src="/upsell/rpc_less.svg" alt="swap-fees" className="absolute top-0 right-0" />
            </div>
          </div>
          <div className="w-full mt-12">
            <Footer />
          </div>
        </div>
      </FormProvider>
    </QueryClientProvider>
  );
}
