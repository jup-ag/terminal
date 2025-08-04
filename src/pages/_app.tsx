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
import DeprecatedBanner from 'src/components/DeprecatedBanner';
import DeprecatedModal from 'src/components/DeprecatedModal';

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

export default function App() {
  const [tab, setTab] = useState<IInit['displayMode']>('integrated');

  // Cleanup on tab change
  useEffect(() => {
    if (window.Jupiter._instance) {
      window.Jupiter._instance = null;
    }

    setTerminalInView(false);
  }, [tab]);

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
    <FormProvider {...methods}>
      <QueryClientProvider client={queryClient}>
        <DefaultSeo
          title={'Jupiter Terminal'}
          openGraph={{
            type: 'website',
            locale: 'en',
            title: 'Jupiter Terminal',
            description:
              'Jupiter Terminal: An open-sourced, lite version of Jupiter that provides end-to-end swap flow.',
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
        <DeprecatedModal/>
        <div className="bg-v3-bg h-screen w-screen max-w-screen overflow-x-hidden flex flex-col justify-between">
          <div>
            <AppHeader />
            <div className="mb-4 w-full">
              <DeprecatedBanner/>
            </div>
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
                <div className="max-w-6xl bg-black/25 mt-12 rounded-xl flex flex-col md:flex-row w-full md:p-4 relative">
                  {/* Desktop configurator */}
                  <div className="hidden md:flex">
                    <FormConfigurator />
                  </div>

                  <ShouldWrapWalletProvider>
                    <div className="mt-8 md:mt-0 md:ml-4 h-full w-full bg-black/40 rounded-xl flex flex-col">
                      {simulateWalletPassthrough ? (
                        <div className="absolute right-6 top-8 text-white flex flex-col justify-center text-center">
                          <div className="text-xs mb-1">Simulate dApp Wallet</div>
                          <UnifiedWalletButton />
                        </div>
                      ) : null}

                      <div className="mt-4 flex justify-center ">
                        <button
                          onClick={() => {
                            setTab('modal');
                          }}
                          type="button"
                          className={cn(
                            '!bg-none relative px-4 justify-center',
                            tab === 'modal' ? '' : 'opacity-20 hover:opacity-70',
                          )}
                        >
                          <div className="flex items-center text-md text-white">
                            {tab === 'modal' ? <V2SexyChameleonText>Modal</V2SexyChameleonText> : 'Modal'}
                          </div>

                          {tab === 'modal' ? (
                            <div className="absolute left-0 bottom-[-8px] w-full h-0.5 bg-gradient-to-r from-primary to-[#00BEF0]" />
                          ) : (
                            <div className="absolute left-0 bottom-[-8px] w-full h-[1px] bg-white/50" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setTab('integrated');
                          }}
                          type="button"
                          className={cn(
                            '!bg-none relative px-4 justify-center',
                            tab === 'integrated' ? '' : 'opacity-20 hover:opacity-70',
                          )}
                        >
                          <div className="flex items-center text-md text-white">
                            {tab === 'integrated' ? (
                              <V2SexyChameleonText>Integrated</V2SexyChameleonText>
                            ) : (
                              'Integrated'
                            )}
                          </div>
                          {tab === 'integrated' ? (
                            <div className="absolute left-0 bottom-[-8px] w-full h-0.5 bg-gradient-to-r from-primary to-[#00BEF0]" />
                          ) : (
                            <div className="absolute left-0 bottom-[-8px] w-full h-[1px] bg-white/50" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setTab('widget');
                          }}
                          type="button"
                          className={cn(
                            '!bg-none relative px-4 justify-center',
                            tab === 'widget' ? '' : 'opacity-20 hover:opacity-70',
                          )}
                        >
                          <div className="flex items-center text-md text-white">
                            {tab === 'widget' ? <V2SexyChameleonText>Widget</V2SexyChameleonText> : 'Widget'}
                          </div>

                          {tab === 'widget' ? (
                            <div className="absolute left-0 bottom-[-8px] w-full h-0.5 bg-gradient-to-r from-primary to-[#00BEF0]" />
                          ) : (
                            <div className="absolute left-0 bottom-[-8px] w-full h-[1px] bg-white/50" />
                          )}
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
                        <TerminalGroup tab={tab} />
                      </div>
                    </div>
                  </ShouldWrapWalletProvider>
                </div>
              </div>
              {/* Mobile configurator */}
              <div className="flex md:hidden">
                <FormConfigurator />
              </div>
            </div>
          </div>

          <CodeBlocks displayMode={tab} />

          <div className="w-full mt-12">
            <Footer />
          </div>
        </div>
      </QueryClientProvider>
    </FormProvider>
  );
}
