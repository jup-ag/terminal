import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import prettier from 'prettier/standalone';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettierPluginTypescript from 'prettier/plugins/typescript';

const SnippetSyncProps = () => {
  const [snippet, setSnippet] = useState(``);
  const unformattedSnippet = `
  const passthroughWalletContextState = useWallet();

  useEffect(() => {
    if (!window.Jupiter.syncProps) return;
    window.Jupiter.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState.connected, props]);
`;

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

  return (
    <div className='flex w-full justify-center text-left'>
      <SyntaxHighlighter language="typescript" showLineNumbers style={vs2015}>
        {snippet}
      </SyntaxHighlighter>
    </div>
  );
};

export default SnippetSyncProps;
