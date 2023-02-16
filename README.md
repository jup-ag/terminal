# Jupiter Terminal

Jupiter Terminal is an open-sourced, lite version of Jupiter that provides end-to-end swap flow by linking it in your HTML.

Demo: https://terminal.jup.ag

---

## Core features

- `main-v1.js` bundle ~70Kb gzipped
  - app bundle (~900Kb) are loaded on-demand when `init()` is called
  - alternatively, preload app bundle with `data-preload` attributes
- Built-in wallets, or passthrough wallets from your dApp
- Modal, Integrated, or Widget mode.
- Mode (default, outputOnly) to allow user to swap between any token pair, or only swap to destination pair.
- Fee supports

---

## Getting started

### Integrating the widget

In your document, link and embed `main-v1.js`.

```tsx
<script src="https://terminal.jup.ag/main-v1.js" data-preload />
```

### Preloading Terminal

Assign the attribute `data-preload` to the script tag, the full application will be preloaded on your browser's `(document.readyState === "complete")` event.

```tsx
<script src="https://terminal.jup.ag/main-v1.js" data-preload />
```

Then,

```tsx
window.Jupiter.init({ endpoint: 'https://api.mainnet-beta.solana.com' });
```

---

## Built-in wallets, or passthrough wallets from your dApp

_*Mode 1: Wallet passthrough*_

If your user have connected their wallet via your dApp, you may passthrough the wallet instance via the `init({ passThroughWallet: wallet })`.

```jsx
const App = () => {
  const { wallet } = useWallet();

  const initJupiter = () => {
    if (wallet) {
      window.Jupiter.init({
        endpoint,
        passThroughWallet: wallet,
      });
    }
  };
};
```

_*Mode 2: Built-in wallet*_

If your user is not connected, Jupiter Terminal have several built-in wallets that user can connect and perform swap directly.

---

### Modal, Integrated, or Widget mode.

### _*Modal*_

By default, Jupiter renders as a modal and take up the whole screen.
<img src="public/demo/modal-demo.png" />

```tsx
window.Jupiter.init({ displayMode: 'modal' });
```

### _*Integrated*_

Integrated mode renders Jupiter Terminal as a part of your dApp.
<img src="public/demo/integrated-demo.png" />

```tsx
window.Jupiter.init({ displayMode: 'integrated' });
```

### _*Widget*_

<img src="public/demo/widget-demo.png" />
Widget mode renders Jupiter Terminal as a widget that can be placed at different position.

````tsx

```tsx
window.Jupiter.init({
  displayMode: 'widget',
  widgetPosition: 'bottom-right', // 'bottom-left', 'top-right', 'top-left'
});
````

---

### Mode (Deprecated in v1)
Integrators on `mode` props needs to migrate to `formProps`.
`formProps` offers more flexibility in customising interactions, and have more capabilities.

- `default`: Default mode, user can swap between any token pair.
  Can be mapped to
  ```tsx
  // Mode prop deprecated, will be mapped to:
  const formProps = {
    fixedInputMint: undefined,
    fixedOutputMint: undefined,
    swapModeExactOut: undefined,
    fixedAmount: undefined,
  };
  ```
- `outputOnly`: Output only mode, user can only swap to destination pair.

```ts
window.Jupiter.init({
  mode: 'outputOnly',
  mint: 'So11111111111111111111111111111111111111112',
  endpoint: 'https://api.mainnet-beta.solana.com',
  passThroughWallet: wallet,
});

// Can be mapped to:
const formProps = {
  fixedInputMint: undefined,
  swapModeExactOut: undefined,
  fixedAmount: undefined,
  initialOutputMint: 'So11111111111111111111111111111111111111112',
  fixedOutputMint: true,
};
```

---

### formProps

Configure Terminal's behaviour and allowed actions for the user.

Refer to `<ModalTerminal />` to see how it is used.

- swapMode?: SwapMode.ExactIn | SwapMode.ExactOut;
  - Default to ExactIn, where user input the amount of token they want to swap.
  - On Exactout, user input the desired amount of token they want to receive.
- initialAmount?: string;
  - The initial input amount
- fixedAmount?: boolean;
  - The output amount is fixed, user cannot change the amount.
- initialInputMint?: string;
  - The default input mint
  - can be used with fixedInputMint
- fixedInputMint?: boolean;
  - must be used with initialInputMint
  - user cannot change the input mint
- initialOutputMint?: string;
  - The default output mint
  - can be used with fixedOutputMint
- fixedOutputMint?: boolean;
  - must be used with initialInputMint
  - user cannot change the input mint

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

---

### Fee supports

Similar to Jupiter, Jupiter Terminal supports fee for integrators.

There are no protocol fees on Jupiter, but integrators can introduce a platform fee on swaps. The platform fee is provided in basis points, e.g. 20 bps for 0.2% of the token output.

Refer to [Adding your own fees](https://docs.jup.ag/integrating-jupiter/additional-guides/adding-your-own-fees) docs for more details.

_Note: You will need to create the Token fee accounts to collect the platform fee._

```tsx
import { getPlatformFeeAccounts } from '@jup-ag/core';

// Jupiter Core provides a helper function that returns all your feeAccounts
const platformFeeAndAccounts = {
  feeBps: 50,
  feeAccounts: await getPlatformFeeAccounts(
    connection,
    new PublicKey('BUX7s2ef2htTGb2KKoPHWkmzxPj4nTWMWRgs5CSbQxf9'), // The platform fee account owner
  ), // map of mint to token account pubkey
};

window.Jupiter.init({
  // ...
  platformFeeAndAccounts,
});
```

---

### onSuccess/onSwapError callback

`onSuccess()` reference can be provided, and will be called when swap is successful.

While `onSwapError()` will be called when an error has occurred.

```tsx
window.Jupiter.init({
  onSuccess: ({ txid, swapResult }) => {
    console.log({ txid, swapResult });
  },
  onSwapError: ({ error }) => {
    console.log('onSwapError', error);
  },
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

---

### Known issue

~~- Wallet passthrough supports does not work for Solflare~~
~~- Jupiter Terminal currently prompts the user to connect their Solflare wallet again, to perform swap.~~ (Issue fixed in 0.1.10)
