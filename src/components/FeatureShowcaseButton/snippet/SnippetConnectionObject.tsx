import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import prettier from 'prettier/standalone';
import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettierPluginTypescript from 'prettier/plugins/typescript';

const SnippetConnectionObject = () => {
  const [snippet, setSnippet] = useState(``);
  const unformattedSnippet = `
  window.Jupiter.init({
    // ...
    connectionObj: new Connection('https://api.mainnet-beta.solana.com')
  })
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
    <div className="flex w-full justify-center text-left">
      <SyntaxHighlighter language="typescript" showLineNumbers style={vs2015}>
        {snippet}
      </SyntaxHighlighter>
    </div>
  );
};

export default SnippetConnectionObject;
