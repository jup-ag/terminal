# Jupiter Terminal

Jupiter Terminal is an open-sourced, lite version of Jupiter that provides an end-to-end swap flow by linking it in your HTML. It offers a powerful and customizable widget for integrating Jupiter's swap functionality into your Solana dApp, providing a seamless user experience for swapping tokens on the Solana blockchain.

Visit our Demo / Playground at https://terminal.jup.ag to explore the features and get started with several templates and auto-generated code snippets.

<img src="public/demo/terminal-hero.gif" />

---

## Table of Contents

- [Breaking Changes](#breaking-changes)
- [Core Features](#core-features)
- [Getting Started](#getting-started)
  - [Step 1: Setup HTML](#step-1-setup-html)
  - [Step 2: Initialize Jupiter Terminal](#step-2-initialize-jupiter-terminal)
  - [Step 3: Setup Other Props](#step-3-setup-other-props)
  - [Step 4: Finishing Touches](#step-4-finishing-touches)
- [API Reference](#api-reference)
  - [Initialization Options](#initialization-options)
  - [Methods](#methods)
  - [Properties](#properties)
  - [TypeScript Support](#typescript-support)
  - [Fee Supports](#fee-supports)
  - [Resuming / Closing Activity](#resuming--closing-activity)
  - [Strict Token List](#strict-token-list)
  - [Default Explorer](#default-explorer)
  - [Terminal Callbacks](#terminal-callbacks)
  - [Customizing Styles](#customizing-styles)
  - [Customizing ClassName](#customizing-classname)
  - [onRequestIxCallback](#onrequestixcallback)
  - [maxAccounts](#maxaccounts)
- [Upcoming Features / Experimentation](#upcoming-features--experimentation)
- [Support](#support)

---

## Breaking Changes

- Fee token account updated to use Jupiter referral token account. Check out the [Fee Supports](#fee-supports) section for more details.

---

## Core Features

- `main-v2.js` bundle (~73.6Kb gzipped)
  - App bundle (~952Kb gzipped) is loaded on-demand when `init()` is called.
  - Alternatively, preload the app bundle with the `data-preload` attribute.

- Agnostic
  - Works with any dApp, `Integrated` or as a standalone `Widget`, or `Modal`.
  - Compatible with any framework, including React, Plain HTML, and other frameworks.
  - Responsive on any screen size.

- Form Customization
  - Supports full swap experience, payment flow, and ape-ing tokens.
  - Allows fixed input/output amount or mint.
  - Supports ExactIn and ExactOut (e.g., Payment) swap modes.

- Built-in Wallets
  - Wallet Standard support.
  - Passthrough Wallet from your dApp.
  - Powered by [Unified Wallet Kit](https://github.com/TeamRaccoons/wallet-kit).

- Lite, but Powerful
  - Jupiter v6 API with Metis **(New✨)**.
  - State sharing with `syncProps()` **(New✨)**.
  - Price API integration, with high decimal/precision support to trade meme tokens.
  - ExactOut (e.g., Payment) support.

- Fees Support
  - Customizable fees.
  - Track fees with Jupiter Referral Dashboard.

---

## Getting Started

- [Demo + Auto Code Gen](https://terminal.jup.ag)
- [TLDR Example](https://github.com/jup-ag/terminal/tree/main/src/content)
- Step by step 👇

### Step 1: Setup HTML

Jupiter Terminal is designed to work anywhere the web runs, including React, Plain HTML/JS, and many other frameworks.

```html
<!-- Attach the loading script in your <head /> -->
<script src="https://terminal.jup.ag/main-v2.js" />

<!-- Optionally, preload for better experience, or integrated mode -->
<script src="https://terminal.jup.ag/main-v2.js" data-preload />
```

### Step 2: Initialize Jupiter Terminal

#### Scenario 1: Terminal as part of your dApp (Passthrough Wallet)

If your dApp already has a `<WalletProvider />`, you can enable wallet passthrough and synchronize the wallet state between your dApp and Jupiter Terminal.

```tsx
window.Jupiter.init({ enableWalletPassthrough: true });
```

Then, synchronize the wallet state using `syncProps()`:

```tsx
import { useWallet } from '@solana/wallet-adapter-react'; // Or @jup-ag/wallet-adapter;

const passthroughWalletContextState = useWallet();
useEffect(() => {
  if (!window.Jupiter.syncProps) return;
  window.Jupiter.syncProps({ passthroughWalletContextState });
}, [passthroughWalletContextState.connected, props]);
```

#### Scenario 2: Standalone Terminal

If your dApp does not have a `<WalletProvider />`, or is a plain HTML/JS website, you can initialize Jupiter Terminal without any additional configuration.

```tsx
window.Jupiter.init({});
```

### Step 3: Setup Other Props

```tsx
window.Jupiter.init({
  /** Required
   * Solana RPC endpoint
   * We do not recommend using the public RPC endpoint for production dApp, as you will get severely rate-limited.
   */
  endpoint: 'https://api.mainnet-beta.solana.com',
  // ...other props
});
```

### Step 4: Finishing Touches

Jupiter Terminal is lightweight but packed with features, such as customizing form behavior, fees, styling, and much more.

Visit our [Demo](https://terminal.jup.ag) to explore all these features and get auto-generated integration code.

Alternatively, check out our [fully typed API reference](https://github.com/jup-ag/terminal/blob/main/src/types/index.d.ts) for more details.

<img src="public/demo/terminal-codegen.gif" />

---

## API Reference

### Initialization Options

The `IInit` interface defines the available configuration options for initializing Jupiter Terminal:

- `endpoint` (required): The Solana RPC endpoint for communicating with the blockchain.
- `platformFeeAndAccounts` (optional): An object specifying the platform fee and associated accounts.
- `formProps` (optional): An object of type `FormProps` that configures the behavior and allowed actions for the user in the swap form.
- `strictTokenList` (optional): A boolean indicating whether to only allow tokens from the strict Jupiter Token List API.
- `defaultExplorer` (optional): The default blockchain explorer for transaction links. Supported values are 'Solana Explorer', 'Solscan', 'Solana Beach', and 'SolanaFM'.
- `autoConnect` (optional): A boolean indicating whether to automatically connect to the user's wallet on subsequent visits.
- `useUserSlippage` (optional): A boolean indicating whether to use the user's slippage instead of the `initialSlippageBps` value. Defaults to `true`.
- `slippagePresets` (optional): An array of numbers representing preset slippage values. (Not supported yet)
- `displayMode` (optional): The display mode of Jupiter Terminal. Supported values are 'modal', 'integrated', and 'widget'.
- `integratedTargetId` (optional): The ID of the HTML element to render the integrated widget into when `displayMode` is set to 'integrated'.
- `widgetStyle` (optional): An object specifying the behavior and style of the widget when `displayMode` is set to 'widget'.
- `containerStyles` (optional): Additional CSS styles to apply to the Jupiter Terminal container.
- `containerClassName` (optional): Additional CSS class name to apply to the Jupiter Terminal container.
- `enableWalletPassthrough` (optional): A boolean indicating whether wallet connections are handled by your dApp. If set to `true`, use the `syncProps` method to synchronize wallet state with Jupiter Terminal.
- `passthroughWalletContextState` (optional): The initial wallet context state to pass to Jupiter Terminal when `enableWalletPassthrough` is `true`.
- `onRequestConnectWallet` (optional): A callback function invoked when Jupiter Terminal requests the dApp to initiate the wallet connection flow when `enableWalletPassthrough` is `true`.
- `onSwapError` (optional): A callback function invoked when an error occurs during a swap.
- `onSuccess` (optional): A callback function invoked when a swap is successful.
- `onFormUpdate` (optional): A callback function invoked when there are changes to the swap form.
- `onScreenUpdate` (optional): A callback function invoked when there are changes to the Jupiter Terminal screen.
- `maxAccounts` (optional): The maximum number of accounts to use when quoting swaps with Jupiter. This is essential for composing with the Jupiter Swap instruction.
- `onRequestIxCallback` (optional): A callback function invoked when Jupiter Terminal requests an instruction (Ix) instead of performing a direct swap.
- `scriptDomain` (optional): The domain from which the Jupiter Terminal script is loaded. (For internal use)

### Methods

The `JupiterTerminal` interface provides the following methods:

- `init(props: IInit)`: Initializes Jupiter Terminal with the provided configuration options.
- `resume()`: Resumes Jupiter Terminal after it has been closed.
- `close()`: Closes Jupiter Terminal.
- `syncProps(props: { passthroughWalletContextState?: IInit['passthroughWalletContextState'] })`: Synchronizes the wallet state with Jupiter Terminal when `enableWalletPassthrough` is `true`.

### Properties

The `JupiterTerminal` interface exposes the following properties:

- `_instance`: The rendered JSX element of Jupiter Terminal.
- `root`: The root instance of Jupiter Terminal.
- `enableWalletPassthrough`: A boolean indicating whether wallet connections are handled by your dApp.
- `onRequestConnectWallet`: The callback function invoked when Jupiter Terminal requests the dApp to initiate the wallet connection flow when `enableWalletPassthrough` is `true`.
- `store`: The internal store used by Jupiter Terminal.
- `onSwapError`: The callback function invoked when an error occurs during a swap.
- `onSuccess`: The callback function invoked when a swap is successful.
- `onFormUpdate`: The callback function invoked when there are changes to the swap form.
- `onScreenUpdate`: The callback function invoked when there are changes to the Jupiter Terminal screen.
- `onRequestIxCallback`: The callback function invoked when Jupiter Terminal requests an instruction (Ix) instead of performing a direct swap.

### TypeScript Support

To get proper typing for Jupiter Terminal, create a typing declaration file `jupiter-terminal.d.ts` in your project and copy the contents from [src/types/index.d.ts](https://github.com/jup-ag/terminal/blob/main/src/types/index.d.ts).

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

### Fee Supports

Jupiter Terminal supports fees for integrators, similar to Jupiter. While there are no protocol fees on Jupiter, integrators can introduce a platform fee on swaps. The platform fee is provided in basis points, e.g., 20 bps for 0.2% of the token output.

Refer to the [Adding your own fees](https://docs.jup.ag/docs/apis/adding-fees) documentation for more details.

_Note: You will need to create the token fee accounts to collect the platform fee._

#### By referral key `referralAccount` (easiest)

```tsx
const TEST_PLATFORM_FEE_AND_ACCOUNTS = {
  referralAccount: '2XEYFwLBkLUxkQx5ZpFAAMzWhQxS4A9QzjhcPhUwhfwy',
  feeBps: 100,
};

window.Jupiter.init({
  // ...
  platformFeeAndAccounts: TEST_PLATFORM_FEE_AND_ACCOUNTS,
});
```

#### By defined fee accounts

Alternatively, you can derive the fee accounts yourself via [Set your fee token account](https://docs.jup.ag/docs/apis/adding-fees#3-set-your-fee-token-account) and declare them as follows:

```tsx
const feeAccounts = {
  // Define your fee accounts here
};

const TEST_PLATFORM_FEE_AND_ACCOUNTS = {
  feeBps: 100,
  feeAccounts,
};

window.Jupiter.init({
  // ...
  platformFeeAndAccounts: TEST_PLATFORM_FEE_AND_ACCOUNTS,
});
```

---

### Resuming / Closing Activity

- Every time `init()` is called, it will create a new activity.
- If you want to resume the previous activity, you can use `resume()`.
- The `close()` function only hides the widget.

```tsx
if (window.Jupiter._instance) {
  window.Jupiter.resume();
}

window.Jupiter.close();
```

### Strict Token List

- `strictTokenList?: boolean;`
- Default: `true`

The Jupiter Token List API is an open, collaborative, and dynamic token list to make trading on Solana more transparent and safer for users and developers. It is set to `true` by default to ensure that only validated tokens are shown.

Learn more at: https://station.jup.ag/docs/token-list/token-list-api

---

### Default Explorer

- `defaultExplorer?: 'Solana Explorer' | 'Solscan' | 'Solana Beach' | 'SolanaFM';`
- Default: `Solana Explorer`

The default explorer is set to `Solana Explorer`. You can change the default explorer by passing the explorer name to the `defaultExplorer` prop.

---

### Terminal Callbacks

Jupiter Terminal provides callbacks that may be useful for your dApp, including form updates, swap success, and swap error events.

```tsx
window.Jupiter.init({
  /** Callbacks */
  /** When an error has occurred during swap */
  onSwapError({ error, quoteResponseMeta }: { error: TransactionError | null; quoteResponseMeta: QuoteResponseMeta | null }) {},
  /** When a swap has been successful */
  onSuccess({ txid, swapResult, quoteResponseMeta }: { txid: string; swapResult: SwapResult; quoteResponseMeta: QuoteResponseMeta | null }) {},
  /** Callback when there are changes to the form */
  onFormUpdate(form: IForm) {},
  /** Callback when there are changes to the screen */
  onScreenUpdate(screen: IScreen) {},
  /** Advanced usage */
  /** onRequestIxCallback(), refer to the dedicated section below */
});
```

### Customizing Styles

Any CSS-in-JS styles can be injected into the outermost container using the `containerStyles` prop.

Examples:

- Custom `zIndex`:

```tsx
window.Jupiter.init({
  // ...
  containerStyles: { zIndex: 100 },
});
```

- Custom height:

```tsx
window.Jupiter.init({
  // ...
  containerStyles: { maxHeight: '90vh' },
});
```

### Customizing ClassName

Tailwind classes can be injected into the outermost container using the `containerClassName` prop.

Example:

- Custom breakpoints:

```tsx
window.Jupiter.init({
  // ...
  containerClassName: 'max-h-[90vh] lg:max-h-[600px]',
});
```

### onRequestIxCallback

Request Jupiter Terminal to return instructions instead of a transaction, so you can compose using the returned instructions.

Be sure to return `SwapResult` back to Jupiter Terminal, so it can handle screen/state transitioning.

- [Station Guide](https://station.jup.ag/docs/apis/swap-api#instructions-instead-of-transaction)
- [Code Example](https://github.com/jup-ag/terminal/blob/main/src/content/advanced/RequestIxIntegratedTerminal.tsx)

```tsx
const onRequestIxCallback: IInit['onRequestIxCallback'] = async (ixAndCb) => {};
```

### maxAccounts

Limit the number of accounts to be used by the Swap Instructions.

- [Station Guide](https://station.jup.ag/docs/apis/swap-api#using-maxaccounts)
- [Code Example](https://github.com/jup-ag/terminal/blob/main/src/content/advanced/RequestIxIntegratedTerminal.tsx)

---

## Upcoming Features / Experimentation

- [ ] Limit Order
- [ ] DCA
- [ ] Experiment separate bundle for passthroughWallet
- [ ] Optimize getTABO

---

## Support

If you have any questions or need assistance, please reach out to the Jupiter support team or consult the official Jupiter documentation.

Happy swapping with Jupiter Terminal! 🚀

---

## License

Jupiter Terminal is released under the [MIT License](https://github.com/jup-ag/terminal/blob/main/LICENSE).

---

## Contributing

We welcome contributions to Jupiter Terminal! If you'd like to contribute, please follow these steps:

1. Fork the repository on GitHub.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive commit messages.
4. Push your changes to your forked repository.
5. Submit a pull request to the main repository.

Please ensure that your code follows the project's coding conventions and includes appropriate tests and documentation.

---

## Acknowledgements

Jupiter Terminal is built on top of the Jupiter SDK and utilizes various open-source libraries and tools. We would like to express our gratitude to the developers and contributors of these projects.

---

## Contact

For any inquiries or feedback, please contact us at [support@jup.ag](mailto:support@jup.ag) or join our [Discord community](https://discord.gg/jup).

---

Thank you for choosing Jupiter Terminal for your Solana dApp's token swapping needs! We appreciate your support and look forward to seeing the amazing projects you build with Jupiter Terminal. 💫