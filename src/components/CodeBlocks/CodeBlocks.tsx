import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import classNames from 'classnames';

import { FormProps, IInit } from 'src/types';
import { IFormConfigurator, INITIAL_FORM_CONFIG } from 'src/constants';
import { jsonToBase64 } from 'src/misc/utils';

function addInlinesToCode(code: string, insertLines: string) {
  let lines = code.split('\n');
  lines = [...lines.slice(0, lines.length - 1), insertLines, ...lines.slice(lines.length - 1, lines.length)];

  return lines.join('\n');
}

const CodeBlocks = ({
  formConfigurator,
  displayMode,
}: {
  formConfigurator: IFormConfigurator;
  displayMode: IInit['displayMode'];
}) => {
  // TODO: Update snippet
  const USE_WALLET_SNIPPET = `import { useWallet } from '@solana/wallet-adapter-react' // Or @jup-ag/wallet-adapter;
const { wallet } = useWallet();
`;

  const DISPLAY_MODE_VALUES = (() => {
    if (displayMode === 'modal') return {};
    if (displayMode === 'integrated') return { displayMode: 'integrated', integratedTargetId: 'integrated-terminal' };
    if (displayMode === 'widget') return { displayMode: 'widget' };
  })();
  
  // Filter out the key that's not default
  const filteredFormProps = Object.keys(formConfigurator.formProps).reduce<Partial<FormProps>>((acc, key) => {
    const itemKey = key as keyof FormProps;
    if (formConfigurator.formProps[itemKey] !== INITIAL_FORM_CONFIG.formProps[itemKey]) {
      acc[itemKey] = formConfigurator.formProps[itemKey] as any;
    }
    return acc;
  }, {})

  const valuesToFormat = {
    ...DISPLAY_MODE_VALUES,
    endpoint: 'https://api.mainnet-beta.solana.com',
    ...(formConfigurator.strictTokenList === false ? { strictTokenList: formConfigurator.strictTokenList } : undefined),
    ...(formConfigurator.defaultExplorer !== 'Solana Explorer'
      ? { defaultExplorer: formConfigurator.defaultExplorer }
      : undefined),
    ...(Object.keys(filteredFormProps || {}).length > 0 ? { formProps: filteredFormProps } : undefined),
  };

  const formPropsSnippet = Object.keys(valuesToFormat).length > 0 ? JSON.stringify(valuesToFormat, null, 4) : '';

  const INIT_SNIPPET = `window.Jupiter.init(${formPropsSnippet});`;

  let snippet = formConfigurator.simulateWalletPassthrough ? `${USE_WALLET_SNIPPET}${INIT_SNIPPET}` : INIT_SNIPPET;

  // TODO: Update snippet
  if (formConfigurator.simulateWalletPassthrough) {
    snippet = addInlinesToCode(snippet, `\t"passThroughWallet": wallet,`);
  }

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


  const [isCopiedShareLink, setIsCopiedShareLink] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsCopiedShareLink(false);
    }, 2000);
  }, [isCopiedShareLink]);
  const copyShareLink = () => {
    if (typeof window === 'undefined') return;

    const stringifiedQuery = JSON.stringify(jsonToBase64(valuesToFormat));
    navigator.clipboard.writeText(
      `${window.location.origin}?import=${stringifiedQuery.replaceAll('"', '')}`
    );
    setIsCopiedShareLink(true);
  }

  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <div className="relative w-full max-w-3xl overflow-hidden px-4 md:px-0">
        <p className="text-white self-start pb-2 font-semibold">Code snippet</p>

        <div className='absolute flex space-x-2 top-0 right-4 md:top-10 md:right-2 '>
          <button
            className={classNames(
              'text-xs text-white border rounded-xl px-2 py-1 opacity-50 hover:opacity-100',
              isCopied ? 'opacity-100 cursor-wait' : '',
            )}
            onClick={copyToClipboard}
          >
            {isCopied ? 'Copied!' : 'Copy to clipboard'}
          </button>

          <button
            className={classNames(
              'text-xs text-white border rounded-xl px-2 py-1 opacity-50 hover:opacity-100',
              isCopiedShareLink ? 'opacity-100 cursor-wait' : '',
            )}
            onClick={copyShareLink}
          >
            {isCopiedShareLink ? 'Copied share link!' : 'Share'}
          </button>
        </div>


        <SyntaxHighlighter language="typescript" showLineNumbers style={vs2015}>
          {snippet}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlocks;
