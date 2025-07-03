import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon-96x96.png" />
          <meta name="theme-color" content="#103145" />

          <meta
            name="description"
            content="Jupiter Terminal: An open-sourced, lite version of Jupiter that provides end-to-end swap flow."
          />

          <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
          <link rel="apple-touch-icon" href="/apple-icon-57x57.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        {/* Default to dark mode */}
        <body className="text-black dark:text-white">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
