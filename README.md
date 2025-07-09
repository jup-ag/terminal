<a href="https://www.readme-i18n.com/jup-ag/terminal">🌍 Available Translations</a>
---

# Jupiter Terminal

Jupiter Terminal is an open-sourced, lite version of Jupiter that provides end-to-end swap flow by linking it in your HTML.

Visit our Demo / Playground over at https://terminal.jup.ag

With several templates to get you started, and auto generated code snippets.

<img src="public/demo/terminal-hero.gif" />

---

### Terminal V4 - Ultra mode is here
Ultra mode will automatically come with major innovations - such as 
- real-time slippage estimation
- dynamic priority fees
- optimised transaction landing
- new Jupiter Shield (coming soon)

[Announcements on X](https://x.com/JupiterExchange/status/1883073621389685128)

### V4 Deprecations
Ultra mode streamlines the codebase, automates many annoyances like fees estimation, slippage estimation, and more. Therefore, many "features/manual toggles" are deprecated.
- Fee supports coming to Ultra soon.
- onRequestIx
- onRequestIxCallback
- onSubmitWithIx
- maxAccounts
- useUserSlippage
- initialSlippageBps
- ExactOut
- Strict token list

*Existing features and manual mode from V3 can still be accessed via `main-v3.js`.

---

## Core features

- `main-v4.js` bundle (~78Kb gzipped)

  - app bundle (~425KB gzipped) are loaded on-demand when `init()` is called
  - alternatively, preload app bundle with `data-preload` attributes

- Agnostic

  - Work with any dApp, `Integrated` or as a standalone `Widget`, or `Modal`
  - Any framework, React, Plain HTML, and other frameworks.
  - Responsive on any screen size

- Form customisation

  - From Full swap experience, Payment Flow, to Ape-ing tokens
  - Fixed input/output amount, or mint
  - ExactIn, and ExactOut (e.g. Payment) swap mode

- Built-in Wallets

  - Wallet Standard
  - Passthrough Wallet from your dApp
  - Powered by [Unified Wallet Kit](https://github.com/TeamRaccoons/wallet-kit)

- Lite, but powerful

  - Jupiter v6 API with Metis **(New✨)**
  - State sharing with syncProps() **(New✨)**
  - Price API integration, with high decimal/precision support to trade meme tokens
  - ExactOut (e.g Payment)

- Fees Support
  - Customisable fees
  - Track fees with Jupiter Referral Dashboard

---

## Getting started

- [Demo + Auto Code Gen](https://terminal.jup.ag)
- [TLDR Example](https://github.com/jup-ag/terminal/tree/main/src/content)
- [NPM example](#npm-support)
- Or, step by step 👇

### 1. Setup HTML

Terminal is designed to work anywhere the web runs, including React, Plain HTML/JS, and many other frameworks.

```html
<!-- Attach the loading script in your <head /> -->
<script src="https://terminal.jup.ag/main-v4.js"></script>

<!-- Optionally, preload for better experience, or integrated mode -->
<script src="https://terminal.jup.ag/main-v4.js" data-preload></script>
```

### 2. Initialize Jupiter Terminal

#### Scenario 1: Terminal as part of your dApp (Passthrough Wallet)

Your dApp already has a `<WalletProvider />`.

```tsx
window.Jupiter.init({ enableWalletPassthrough: true });
```

Then, syncronise wallet state between your dApp and Jupiter Terminal with `syncProps()`

```tsx
import { useWallet } from '@solana/wallet-adapter-react'; // Or @jup-ag/wallet-adapter;

const passthroughWalletContextState = useWallet();
useEffect(() => {
  if (!window.Jupiter.syncProps) return;
  window.Jupiter.syncProps({ passthroughWalletContextState });
}, [passthroughWalletContextState.connected, props]);
```

#### Scenario 2: Standalone Terminal

Your dApp does not have a `<WalletProvider />`, or is a plain HTML/JS website.

```tsx
window.Jupiter.init({});
```

### 3. Setup other props

```tsx
window.Jupiter.init({
  // ...other props
});
```

### 4. Finishing touches

Terminal are light, but full of features, such as customising form behaviour, fees, styling and much more.

[Go to our Demo](https://terminal.jup.ag) to explore all these features, with automagically generated integration code.

Or, [check out our fully typed API reference](https://github.com/jup-ag/terminal/blob/main/src/types/index.d.ts) for more details.

<img src="public/demo/terminal-codegen.gif" />

---

<br/>
<br/>
<br/>

## Additional API Reference

### Typescript Support

Since Jupiter Terminal is not published on npm, and are only importable via CDN, to get proper typing, you can create a typing decalarion `jupiter-terminal.d.ts` file in your project, and copy the contents in [src/types/index.d.ts](https://github.com/jup-ag/terminal/blob/main/src/types/index.d.ts)

```tsx
declare global {
  interface Window {
    Jupiter: JupiterTerminal;
  }
}
// ...
// ...
// ...
```

---

### Resuming / Closing activity

- Everytime `init()` is called, it will create a new activity.

- If you want to resume the previous activity, you can use `resume()`.

- `close()` function only hide the widget.

```tsx
if (window.Jupiter._instance) {
  window.Jupiter.resume();
}

window.Jupiter.close();
```

### Default Explorer

- `defaultExplorer?: 'Solana Explorer' | 'Solscan' | 'Solana Beach' | 'SolanaFM';`
- Default: `Solana Explorer`

The default explorer is set to `Solana Explorer`;

You can change the default explorer by passing in the explorer name to the `defaultExplorer` prop.

---

### Terminal callbacks

Callbacks that may be useful for your dApp, from form updates, to swap success/error.

```tsx
window.Jupiter.init({
  /** Callbacks */
  /** When an error has occured during swap */
  onSwapError ({ error, quoteResponseMeta }: { error TransactionError; quoteResponseMeta: QuoteResponse | null }) {}
  /** When a swap has been successful */
  onSuccess ({ txid, swapResult, quoteResponseMeta }: { txid: string; swapResult: SwapResult; quoteResponseMeta: QuoteResponsea | null }) {}
  /** Callback when there's changes to the form */
  onFormUpdate (form: IForm) {}
  /** Callback when there's changes to the screen */
  onScreenUpdate (screen: IScreen) {}
});
```

### Customising styles: CSSProperties

Any CSS-in-JS can be injected to the outer-most container via containerStyles api.

Examples:

- Custom zIndex

```tsx
window.Jupiter.init({
  // ...
  containerStyles: { zIndex: 100 },
});
```

- Custom height

```tsx
window.Jupiter.init({
  // ...
  containerStyles: { maxHeight: '90vh' },
});
```

### Customising className: Tailwind className

Tailwind classes can be injected to the outer-most container via containerClassName api.

Example:

- Custom breakpoints

```tsx
window.Jupiter.init({
  // ...
  containerClassName: 'max-h-[90vh] lg:max-h-[600px]',
});
```

### NPM support

```
"@solana/spl-token": "^0.1.8",
"@solana/web3.js": "^1.87.6",
```

As of Terminal@3.0.5, Terminal is now available as an NPM package, however, some peer dependencies are required to be installed.

```tsx
import { init, syncProps } from '@jup-ag/terminal';
import '@jup-ag/terminal/css';

import { useWallet } from '@solana/wallet-adapter-react'; // Or @jup-ag/wallet-adapter;
const walletContextState = useWallet();
useEffect(() => {
  init({
    displayMode: 'integrated',
    integratedTargetId: 'integrated-terminal',
  });
}, []);

// Optional: To make sure passthrough wallet are synced
useEffect(() => {
  syncProps({ passthroughWalletContextState: walletContextState });
}, [walletContextState]);
```

---

### Upcoming feature / Experimentation

- [ ] Limit Order
- [ ] DCA
- [ ] Experiment separate bundle for passthroughWallet
- [ ] optimise getTABO
