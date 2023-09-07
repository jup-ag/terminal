import classNames from 'classnames';
import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import { IFormConfigurator, INITIAL_FORM_CONFIG } from 'src/constants';
import { jsonToBase64 } from 'src/misc/utils';
import { FormProps, IInit } from 'src/types';

import Link from 'next/link';
import ExternalIcon from 'src/icons/ExternalIcon';
// Formatters
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettierPluginTypescript from 'prettier/plugins/typescript';
import prettier from 'prettier/standalone';

const CodeBlocks = ({
  formConfigurator,
  displayMode,
}: {
  formConfigurator: IFormConfigurator;
  displayMode: IInit['displayMode'];
}) => {
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
  }, {});

  const valuesToFormat = {
    ...DISPLAY_MODE_VALUES,
    endpoint: 'https://api.mainnet-beta.solana.com',
    ...(formConfigurator.strictTokenList === false ? { strictTokenList: formConfigurator.strictTokenList } : undefined),
    ...(formConfigurator.defaultExplorer !== 'Solana Explorer'
      ? { defaultExplorer: formConfigurator.defaultExplorer }
      : undefined),
    ...(Object.keys(filteredFormProps || {}).length > 0 ? { formProps: filteredFormProps } : undefined),
    ...(formConfigurator.simulateWalletPassthrough ? { enableWalletPassthrough: true } : undefined),
  };

  const formPropsSnippet = Object.keys(valuesToFormat).length > 0 ? JSON.stringify(valuesToFormat, null, 4) : '';

  const USE_WALLET_SNIPPET = `
  import { useWallet } from '@solana/wallet-adapter-react' // Or @jup-ag/wallet-adapter;
  const passthroughWalletContextState = useWallet();

  // To make sure passthrough wallet are synced
  useEffect(() => {
    if (!window.Jupiter.syncProps) return;
    window.Jupiter.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState.connected, props]);
`;
  const INIT_SNIPPET = `window.Jupiter.init(${formPropsSnippet});`;
  const unformattedSnippet = [formConfigurator.simulateWalletPassthrough ? USE_WALLET_SNIPPET : '', INIT_SNIPPET].join(
    '\n',
  );

  const [snippet, setSnippet] = useState(``);
  useEffect(() => {
    prettier
      .format(unformattedSnippet, {
        parser: 'typescript',
        plugins: [prettierPluginBabel, prettierPluginEstree, prettierPluginTypescript],
      })
      .then((res) => {
        setSnippet(res);
      });
  }, [unformattedSnippet]);

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
    navigator.clipboard.writeText(`${window.location.origin}?import=${stringifiedQuery.replaceAll('"', '')}`);
    setIsCopiedShareLink(true);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <div className="relative w-full max-w-full lg:max-w-[80%] xl:max-w-[70%] overflow-hidden px-4 md:px-0">
        <p className="text-white self-start pb-2 font-semibold">Code snippet</p>

        <div className="absolute flex space-x-2 top-0 right-4 md:right-2 ">
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

        <Link
          target="_blank"
          rel={'noopener noreferrer'}
          href={'https://github.com/jup-ag/terminal/tree/main/src/content'}
          className="mt-2 flex items-center justify-center space-x-1 text-sm text-white/50 hover:underline"
        >
          <p>Open Example directory</p>
          <ExternalIcon />
        </Link>
      </div>
    </div>
  );
};

export default CodeBlocks;
