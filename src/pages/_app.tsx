import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

import AppHeader from 'src/components/AppHeader/AppHeader';
import Footer from 'src/components/Footer/Footer';

import { IInit } from 'src/types';
import { IFormConfigurator, INITIAL_FORM_CONFIG, JUPITER_DEFAULT_RPC } from 'src/constants';
import { Wallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useForm } from 'react-hook-form';
import { WalletButton } from 'src/components/WalletComponents';
import Header from 'src/components/Header';
import JupiterApp from 'src/components/Jupiter';
import { RenderJupiter } from '../index';
import IntegratedTerminal from 'src/content/IntegratedTerminal';

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
  const [tab, setTab] = useState<IInit['displayMode']>('integrated');

  // Cleanup on tab change
  useEffect(() => {
    if (window.Jupiter._instance) {
      window.Jupiter._instance = null;
    }
  }, [tab]);

  const rpcUrl = JUPITER_DEFAULT_RPC;

  const { watch, reset, setValue, formState } = useForm<IFormConfigurator>({
    defaultValues: INITIAL_FORM_CONFIG,
  });

  const watchAllFields = watch();

  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (!watchAllFields.useWalletPassthrough) {
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
  }, [watchAllFields.useWalletPassthrough]);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <>
      <DefaultSeo
        title={'Locked DCA'}
        openGraph={{
          type: 'website',
          locale: 'en',
          title: 'Locked DCA',
          description: 'Locked DCA: lock more, earn more.',
          url: 'https://terminal.jup.ag/',
          site_name: 'Locked DCA',
          images: [
            {
              url: `https://og.jup.ag/api/jupiter`,
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

      <div className="bg-jupiter-dark-bg h-screen w-screen max-w-screen overflow-x-hidden flex flex-col justify-between">
        <div>
          <AppHeader />
        </div>

        <div className="flex flex-col w-full h-full items-center justify-center text-white">
          <span>[Title] - [Example of Integrating Jupiter DCA through a composable program]</span>
          
          <span>[Subtitle] - Locking a DCA through a period of time for extra incentives</span>

          <IntegratedTerminal
            rpcUrl={rpcUrl}
            formProps={watchAllFields.formProps}
            fakeWallet={wallet}
            strictTokenList={watchAllFields.strictTokenList}
            defaultExplorer={watchAllFields.defaultExplorer}
          />
        </div>

        <div className="w-full bg-jupiter-bg mt-12 text-white">
          <Footer />
        </div>
      </div>
    </>
  );
}
