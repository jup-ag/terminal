import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import prettier from 'prettier/standalone';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettierPluginTypescript from 'prettier/plugins/typescript';

const SnippetNewCallbacks = () => {
  const [snippet, setSnippet] = useState(``);
  const unformattedSnippet = `
  window.Jupiter.init({
    /** When an error has occured during swap */
    onSwapError ({ error, quoteResponseMeta }) {},

    /** When a swap has been successful */
    onSuccess ({ txid, swapResult, quoteResponseMeta, result }) {},

    /** Callback when there's changes to the form */
    onFormUpdate (form: IForm) {},

    /** Callback when there's changes to the screen */
    onScreenUpdate (screen: IScreen) {},
    
    /** Advanced usage: Request Ix instead */
    onRequestIxCallback() {},
  });
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
    <div className="flex justify-center w-full text-left">
      <SyntaxHighlighter language="typescript" showLineNumbers style={vs2015}>
        {snippet}
      </SyntaxHighlighter>
    </div>
  );
};

export default SnippetNewCallbacks;
