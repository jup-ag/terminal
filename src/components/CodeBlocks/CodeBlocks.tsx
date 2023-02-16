import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import classNames from 'classnames';

import { SwapMode, WRAPPED_SOL_MINT } from '@jup-ag/core';
import { IFormConfigurator } from 'src/pages/_app';
import { IInit } from 'src/types';

const CodeBlocks = ({
  formProps,
  displayMode,
}: {
  formProps: IFormConfigurator;
  displayMode: IInit['displayMode'];
}) => {
  const USE_WALLET_SNIPPET = `import { useWallet } from '@solana/wallet-adapter-react';
const { wallet } = useWallet();
`;

  const DISPLAY_MODE_VALUES = (() => {
    if (displayMode === 'modal') return {};
    if (displayMode === 'integrated') return { displayMode: 'integrated', integratedTargetId: 'integrated-terminal' };
    if (displayMode === 'widget') return { displayMode: 'widget' };
  })();

  const FIXED_INPUT_MINT_VALUES = {
    initialInputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    fixedInputMint: true,
  };
  const FIXED_OUTPUT_MINT_VALUES = {
    initialOutputMint: WRAPPED_SOL_MINT.toString(),
    fixedOutputMint: true,
  };
  const FIXED_AMOUNT_VALUES = {
    initialAmount: formProps.initialAmount,
    fixedAmount: true,
  };

  const formPropsToFormat = {
    ...(formProps.fixedInputMint ? FIXED_INPUT_MINT_VALUES : undefined),
    ...(formProps.fixedOutputMint ? FIXED_OUTPUT_MINT_VALUES : undefined),
    ...(formProps.fixedAmount ? FIXED_AMOUNT_VALUES : undefined),
    ...(formProps.initialAmount ? { initialAmount: formProps.initialAmount } : undefined),
    ...(formProps.swapMode === SwapMode.ExactOut ? { swapMode: formProps.swapMode } : undefined),
  };
  const valuesToFormat = {
    ...DISPLAY_MODE_VALUES,
    endpoint: 'https://api.mainnet-beta.solana.com',
    ...(Object.keys(formPropsToFormat).length > 0 ? { formProps: formPropsToFormat } : undefined),
  };

  const formPropsSnippet = Object.keys(valuesToFormat).length > 0 ? JSON.stringify(valuesToFormat, null, 4) : '';

  const INIT_SNIPPET = `window.Jupiter.init(${formPropsSnippet});`;

  const snippet = formProps.useWalletPassthrough ? `${USE_WALLET_SNIPPET}${INIT_SNIPPET}` : INIT_SNIPPET;

  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, [isCopied]);

  const copyToClipboard = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(snippet);
    setIsCopied(true);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <div className="relative w-full max-w-3xl overflow-hidden px-4 md:px-0">
        <p className="text-white self-start pb-2 font-semibold">Code snippet</p>

        <button
          className={classNames(
            'absolute top-0 right-4 md:top-10 md:right-2 text-xs text-white border rounded-xl px-2 py-1 opacity-50 hover:opacity-100',
            isCopied ? 'opacity-100 cursor-wait' : '',
          )}
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

export default CodeBlocks;
