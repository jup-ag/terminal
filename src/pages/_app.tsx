import React, { useEffect, useMemo, useState } from 'react';
import type { AppProps } from 'next/app';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

import AppHeader from 'src/components/AppHeader/AppHeader';
import SexyChameleonText from 'src/components/SexyChameleonText/SexyChameleonText';
import Footer from 'src/components/Footer/Footer';

import ModalTerminal from 'src/content/ModalTerminal';
import IntegratedTerminal from 'src/content/IntegratedTerminal';
import { IInit } from 'src/types';
import WidgetTerminal from 'src/content/WidgetTerminal';
import { JUPITER_DEFAULT_RPC, WRAPPED_SOL_MINT } from 'src/constants';
import classNames from 'classnames';
import FormConfigurator from 'src/components/FormConfigurator';
import { SwapMode } from '@jup-ag/react-hook';
import { Wallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useForm } from 'react-hook-form';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const CodeBlocks = ({ formProps, displayMode }: { formProps: IFormConfigurator, displayMode: IInit['displayMode'] }) => {
  const USE_WALLET_SNIPPET = `import { useWallet } from '@solana/wallet-adapter-react';
const { wallet } = useWallet();
`;

  const DISPLAY_MODE_VALUES = (() => {
    if (displayMode === 'modal') return {};
    if (displayMode === 'integrated') return { displayMode: 'integrated', integratedTargetId: 'integrated-terminal' };
    if (displayMode === 'widget') return { displayMode: 'widget' };
  })()

  const FIXED_INPUT_MINT_VALUES = {
    initialInputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    fixedInputMint: true
  }
  const FIXED_OUTPUT_MINT_VALUES = {
    initialOutputMint: WRAPPED_SOL_MINT.toString(),
    fixedOutputMint: true
  }
  const FIXED_AMOUNT_VALUES = {
    initialAmount: formProps.initialAmount,
    fixedAmount: true
  }

  const formPropsToFormat = {
    ...formProps.fixedInputMint ? FIXED_INPUT_MINT_VALUES : undefined,
    ...formProps.fixedOutputMint ? FIXED_OUTPUT_MINT_VALUES : undefined,
    ...formProps.fixedAmount ? FIXED_AMOUNT_VALUES : undefined,
    ...formProps.initialAmount ? { initialAmount: formProps.initialAmount } : undefined,
    ...formProps.swapMode === SwapMode.ExactOut ? { swapMode: formProps.swapMode } : undefined,
  }
  const valuesToFormat = {
    ...DISPLAY_MODE_VALUES,
    endpoint: 'https://api.mainnet-beta.solana.com',
    ...(Object.keys(formPropsToFormat).length > 0) ? { formProps: formPropsToFormat } : undefined,
  }

  const formPropsSnippet = Object.keys(valuesToFormat).length > 0
    ? JSON.stringify(valuesToFormat, null, 4)
    : '';

  const INIT_SNIPPET = `window.Jupiter.init(${formPropsSnippet});`;

  const snippet = formProps.useWalletPassthrough ? `${USE_WALLET_SNIPPET}${INIT_SNIPPET}` : INIT_SNIPPET;

  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, [isCopied])

  const copyToClipboard = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(snippet)
    setIsCopied(true);
  }

  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <div className="relative w-full max-w-3xl overflow-hidden px-4 md:px-0">
        <p className="text-white self-start pb-2 font-semibold">Code snippet</p>

        <button
          className={classNames("absolute top-0 right-4 md:top-10 md:right-2 text-xs text-white border rounded-xl px-2 py-1 opacity-50 hover:opacity-100", isCopied ? 'opacity-100 cursor-wait' : '')}
          onClick={copyToClipboard}
        >
          {isCopied ? 'Copied!' : 'Copy to clipboard'}
        </button>

        <SyntaxHighlighter language="typescript" showLineNumbers style={vs2015}>
          {snippet}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export interface IFormConfigurator {
  fixedInputMint: boolean;
  fixedOutputMint: boolean;
  swapMode: SwapMode;
  fixedAmount: boolean;
  initialAmount: string;
  useWalletPassthrough: boolean;
  initialInputMint: string;
  initialOutputMint: string;
}

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
    defaultValues: {
      fixedInputMint: false,
      fixedOutputMint: false,
      swapMode: SwapMode.ExactIn,
      fixedAmount: false,
      initialAmount: '',
      useWalletPassthrough: false,
      initialInputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      initialOutputMint: WRAPPED_SOL_MINT.toString(),
    },
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

  return (
    <div className="bg-jupiter-dark-bg h-screen w-screen max-w-screen overflow-x-hidden flex flex-col justify-between">
      <div>
        <AppHeader />

        <div className="">
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

          <div className="flex justify-center">
            <div className="max-w-6xl bg-black/25 mt-12 rounded-xl flex flex-col md:flex-row w-full md:p-4">
              <FormConfigurator {...watchAllFields} reset={reset} setValue={setValue} formState={formState} />

              <div className="mt-8 md:mt-0 md:ml-4 h-full w-full bg-black/40 rounded-xl flex flex-col">
                <div className="mt-4 flex justify-center ">
                  <button
                    onClick={() => {
                      setTab('modal');
                    }}
                    type="button"
                    className={classNames(
                      '!bg-none relative px-4 justify-center',
                      tab === 'modal' ? '' : 'opacity-20 hover:opacity-70',
                    )}
                  >
                    <div className="flex items-center text-md text-white">Modal</div>

                    {tab === 'modal' ? (
                      <div className="absolute left-0 bottom-[-8px] w-full h-0.5 bg-gradient-to-r from-[rgba(252,192,10,1)] to-[rgba(78,186,233,1)]" />
                    ) : (
                      <div className="absolute left-0 bottom-[-8px] w-full h-[1px] bg-white/50" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setTab('integrated');
                    }}
                    type="button"
                    className={classNames(
                      '!bg-none relative px-4 justify-center',
                      tab === 'integrated' ? '' : 'opacity-20 hover:opacity-70',
                    )}
                  >
                    <div className="flex items-center text-md text-white">Integrated</div>
                    {tab === 'integrated' ? (
                      <div className="absolute left-0 bottom-[-8px] w-full h-0.5 bg-gradient-to-r from-[rgba(252,192,10,1)] to-[rgba(78,186,233,1)]" />
                    ) : (
                      <div className="absolute left-0 bottom-[-8px] w-full h-[1px] bg-white/50" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setTab('widget');
                    }}
                    type="button"
                    className={classNames(
                      '!bg-none relative px-4 justify-center',
                      tab === 'widget' ? '' : 'opacity-20 hover:opacity-70',
                    )}
                  >
                    <div className="flex items-center text-md text-white">Widget</div>
                    {tab === 'widget' ? (
                      <div className="absolute left-0 bottom-[-8px] w-full h-0.5 bg-gradient-to-r from-[rgba(252,192,10,1)] to-[rgba(78,186,233,1)]" />
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
                  {tab === 'modal' ? (
                    <ModalTerminal rpcUrl={rpcUrl} formProps={watchAllFields} fakeWallet={wallet} />
                  ) : null}
                  {tab === 'integrated' ? (
                    <IntegratedTerminal rpcUrl={rpcUrl} formProps={watchAllFields} fakeWallet={wallet} />
                  ) : null}
                  {tab === 'widget' ? (
                    <WidgetTerminal rpcUrl={rpcUrl} formProps={watchAllFields} fakeWallet={wallet} />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <CodeBlocks formProps={watchAllFields} displayMode={tab} />
      </div>

      <div className="w-full bg-jupiter-bg mt-12">
        <Footer />
      </div>
    </div>
  );
}
