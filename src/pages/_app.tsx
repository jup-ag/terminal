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
]

export default function App() {
  const [displayMode, setDisplayMode] = useState<IInit['displayMode']>('integrated');
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
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
        <div className="bg-landing-bg h-screen w-screen max-w-screen overflow-x-hidden flex flex-col justify-between">
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

            <div className="">
              <div className="flex flex-col items-center h-full w-full mt-4 md:mt-14">
                <div className="flex flex-col justify-center items-center text-center">
                  <div className="flex space-x-2">
                    <V2SexyChameleonText className="text-4xl md:text-[52px] font-semibold px-4 pb-2 md:px-0">
                      Jupiter Terminal
                    </V2SexyChameleonText>

                    <div className="px-1 py-0.5 bg-[#C7F284] rounded-md ml-2.5 font-semibold flex text-xs self-start">
                      v4
                    </div>
                  </div>
                  <p className="text-[#9D9DA6] max-w-[100%] md:max-w-[60%] text-md mt-4 heading-[24px]">
                    An open-sourced, lite version of Jupiter that provides end-to-end swap flow by linking it in your
                    HTML. Check out the visual demo for the various integration modes below.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="max-w-6xl  mt-3 rounded-xl flex flex-col md:flex-row w-full md:p-4 relative">

                  <ShouldWrapWalletProvider>
                    <div className="mt-8 md:mt-0 md:ml-4 h-full w-full rounded-xl flex flex-col">
                      {simulateWalletPassthrough ? (
                        <div className="absolute right-6 top-8 text-white flex flex-col justify-center text-center">
                          <div className="text-xs mb-1">Simulate dApp Wallet</div>
                          <UnifiedWalletButton />
                        </div>
                      ) : null}

                      <div className="mt-4 flex justify-center ">

                        {TERMINAL_MODE.map((mode) => (
                          <button
                            key={mode.value}
                            onClick={() => setDisplayMode(mode.value)}
                            type="button"
                            className={cn(
                              '!bg-none relative px-4 justify-center',
                              displayMode === mode.value ? '' : 'opacity-20 hover:opacity-70',
                            )}
                          >
                            <div className="flex items-center text-md text-white">
                              {displayMode === mode.value ? <V2SexyChameleonText>{mode.label}</V2SexyChameleonText> : mode.label}
                            </div>
                            {displayMode === mode.value ? (
                              <div className="absolute left-0 bottom-[-8px] w-full h-0.5 bg-gradient-to-r from-primary to-[#00BEF0]" />
                            ) : (
                              <div className="absolute left-0 bottom-[-8px] w-full h-[1px] bg-white/50" />
                            )}
                          </button>
                        ))}

                      </div>

                      <span className="flex justify-center text-center text-xs text-[#9D9DA6] mt-4">
                        {displayMode === 'modal' ? 'Jupiter renders as a modal and takes up the whole screen.' : null}
                        {displayMode === 'integrated' ? 'Jupiter renders as a part of your dApp.' : null}
                        {displayMode === 'widget'
                          ? 'Jupiter renders as part of a widget that can be placed at different positions on your dApp.'
                          : null}
                      </span>


                      <div className="flex flex-grow items-center justify-center text-white/75">
                        <TerminalGroup tab={displayMode} />
                      </div>

                      <div className="flex justify-center mt-2">
                        <button className="relative border border-landing-primary/20 text-sm text-landing-primary font-semibold px-4 py-2 rounded-lg hover:bg-landing-primary/10 transition-colors" onClick={() => setIsSideDrawerOpen(true)}>
                          Customize
                          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-landing-primary animate-pulse"></span>
                        </button>
                      </div>
                    </div>
                  </ShouldWrapWalletProvider>
                </div>
              </div>
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
