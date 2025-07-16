import { useEffect, useMemo, useState } from 'react';
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
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { cn } from 'src/misc/cn';
import { useFormContext, useWatch } from 'react-hook-form';

const SyntaxHighlighter = dynamic(() => import('react-syntax-highlighter'), { ssr: false });


function applyCustomColors(colors: {
  primary?: string;
  background?: string;
  primaryText?: string;
  warning?: string;
  interactive?: string;
  module?: string;
}) {
  const root = document.documentElement;

  if (colors.primary) {
    root.style.setProperty('--jupiter-terminal-primary', colors.primary);
  }
  if (colors.background) {
    root.style.setProperty('--jupiter-terminal-background', colors.background);
  }
  if (colors.primaryText) {
    root.style.setProperty('--jupiter-terminal-primary-text', colors.primaryText);
  }
  if (colors.warning) {
    root.style.setProperty('--jupiter-terminal-warning', colors.warning);
  }
  if (colors.interactive) {
    root.style.setProperty('--jupiter-terminal-interactive', colors.interactive);
  }
  if (colors.module) {
    root.style.setProperty('--jupiter-terminal-module', colors.module);
  }
}


const CodeBlocks = ({ displayMode }: { displayMode: IInit['displayMode'] }) => {
  const { control } = useFormContext<IFormConfigurator>();

  const formProps = useWatch({ control, name: 'formProps' });
  const defaultExplorer = useWatch({ control, name: 'defaultExplorer' });
  const simulateWalletPassthrough = useWatch({ control, name: 'simulateWalletPassthrough' });
  const colors = useWatch({ control, name: 'colors' });
  // Apply custom colors when they change
  useEffect(() => {
    if (colors) {
      applyCustomColors(colors);
    }
  }, [colors]);

  const DISPLAY_MODE_VALUES = (() => {
    if (displayMode === 'modal') return {};
    if (displayMode === 'integrated') return { displayMode: 'integrated', integratedTargetId: 'integrated-terminal' };
    if (displayMode === 'widget') return { displayMode: 'widget' };
  })();

  // Filter out the key that's not default, excluding colors
  const filteredFormProps = Object.keys(formProps).reduce<Partial<FormProps>>((acc, key) => {
    const itemKey = key as keyof FormProps;
    // Skip colors property entirely
    if (formProps[itemKey] !== INITIAL_FORM_CONFIG.formProps[itemKey]) {
      acc[itemKey] = formProps[itemKey] as any;
    }
    return acc;
  }, {});

  const valuesToFormat = {
    ...DISPLAY_MODE_VALUES,
    ...(defaultExplorer !== 'Solana Explorer' ? { defaultExplorer: defaultExplorer } : undefined),
    ...(Object.keys(filteredFormProps || {}).length > 0 ? { formProps: filteredFormProps } : undefined),
    ...(simulateWalletPassthrough ? { enableWalletPassthrough: true } : undefined),
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

  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';

  const headTag = `<!-- Attach the loading script in your <head /> -->
<script src='${origin}/main-v4.js'></script>
`;

  const bodyTag = useMemo(() => {
    if (displayMode === 'integrated') {
      return `<!-- Prepare a div in your <body> for Terminal to render -->
<!-- Adjust the width and height to suit your requirements -->
<div id="integrated-terminal" style="width: 400px; height: 568px;"></div>
`;
    }

    return '';
  }, [displayMode]);

  const INIT_SNIPPET = `
  window.Jupiter.init(${formPropsSnippet});
  `;
  const unformattedSnippet = [simulateWalletPassthrough ? USE_WALLET_SNIPPET : '', INIT_SNIPPET].join('\n');

  const { data: npmSnippet, refetch: refetchNpmSnippet } = useQuery<string>(
    ['npmSnippet'],
    async () => {
      const formatted = prettier.format(
        `
        // npm install @jup-ag/terminal
        import '@jup-ag/terminal/css';

        const walletProps = useWallet();
        useEffect(() => {
          if (typeof window !== "undefined") {
            import("@jup-ag/terminal").then((mod) => {
              const init = mod.init;
              init(${formPropsSnippet});
            });
          }
        }, []);
        `,
        {
          parser: 'typescript',
          plugins: [prettierPluginBabel, prettierPluginEstree, prettierPluginTypescript],
        },
      );
      return formatted;
    },
    {
      initialData: '',
    },
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
        refetchNpmSnippet();
      });
  }, [unformattedSnippet, refetchNpmSnippet]);

  const documentSnippet = useMemo(() => [headTag, bodyTag].filter(Boolean).join('\n'), [headTag, bodyTag]);

  // Generate CSS variables snippet based on user's color selections
  const cssVariablesSnippet = useMemo(() => {
    if (!colors) return '';

    const cssVars = Object.entries(colors)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([key, value]) => `  --jupiter-terminal-${key}: ${value};`)
      .join('\n');

    if (!cssVars) return '';

    return `/* CSS Variables - Generated from user color selections */
:root {
${cssVars}
}`;
  }, [colors]);

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
        <p className="text-white self-start pb-2 font-semibold">Setup HTML</p>
        <p className="text-white self-start pb-2 text-xs text-white/50">
          Terminal is designed to work anywhere the web runs, including React, Plain HTML/JS, and many other frameworks.
        </p>

        <SyntaxHighlighter language="html" showLineNumbers style={vs2015}>
          {documentSnippet}
        </SyntaxHighlighter>
      </div>

      <div className="my-4" />

      <div className="relative w-full max-w-full lg:max-w-[80%] xl:max-w-[70%] overflow-hidden px-4 md:px-0">
        <p className="text-white self-start pb-2 font-semibold">Code snippet</p>

        <div className="absolute flex space-x-2 top-0 right-4 md:right-2 ">
          <button
            className={cn(
              'text-xs text-white border rounded-xl px-2 py-1 opacity-50 hover:opacity-100',
              isCopied ? 'opacity-100 cursor-wait' : '',
            )}
            onClick={copyToClipboard}
          >
            {isCopied ? 'Copied!' : 'Copy to clipboard'}
          </button>

          <button
            className={cn(
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

        <div className="flex w-full justify-between">
          <Link
            target="_blank"
            rel={'noopener noreferrer'}
            href={'https://github.com/jup-ag/terminal/tree/main/src/content'}
            className="mt-2 flex items-center justify-center space-x-1 text-sm text-white/50 hover:underline"
          >
            <p>Open Example directory</p>
            <ExternalIcon />
          </Link>
          <Link
            target="_blank"
            rel={'noopener noreferrer'}
            href={'https://github.com/jup-ag/terminal/blob/main/src/types/index.d.ts'}
            className="mt-2 flex items-center justify-center space-x-1 text-sm text-white/50 hover:underline"
          >
            <p>Show fully typed API</p>
            <ExternalIcon />
          </Link>
        </div>
        {/* CSS Variables Code Block */}
        {cssVariablesSnippet && (
          <>
            <div className="mt-10">
              <hr className="opacity-10 pt-10" />
              <p className="text-white self-start pb-2 font-semibold">CSS Variables</p>

              <div>
                <SyntaxHighlighter language="css" showLineNumbers style={vs2015}>
                  {cssVariablesSnippet}
                </SyntaxHighlighter>
              </div>
            </div>
          </>
        )}
        <div className="mt-10">
          <hr className="opacity-10 pt-10" />
          <p className="text-white self-start pb-2 font-semibold">Alternatively, install from NPM</p>
          <div>
            <SyntaxHighlighter language="typescript" showLineNumbers style={vs2015}>
              {npmSnippet}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeBlocks;
