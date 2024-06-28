# # Jupiter Terminal

Jupiter Terminal is a powerful and customizable widget for integrating Jupiter's token swapping functionality into your Solana dApp. It provides a seamless user experience for swapping tokens on the Solana blockchain.

## Table of Contents

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Initialization](#initialization)
- [Configuration Options](#configuration-options)
  - [Swap Form Configuration](#swap-form-configuration)
  - [Wallet Configuration](#wallet-configuration)
  - [Fee Configuration](#fee-configuration)
  - [Display Configuration](#display-configuration)
  - [Callback Configuration](#callback-configuration)
- [Methods](#methods)
- [Properties](#properties)
- [TypeScript Support](#typescript-support)
- [Examples](#examples)
  - [Basic Usage](#basic-usage)
  - [Custom Styles](#custom-styles)
  - [Handling Callbacks](#handling-callbacks)
- [Best Practices](#best-practices)
- [Support](#support)

## Getting Started

### Installation

To use Jupiter Terminal in your project, include the Jupiter Terminal script in your HTML file:

```html
<script src="https://terminal.jup.ag/main-v2.js"></script>
```

### Initialization

Initialize Jupiter Terminal by calling the `init` method on the global `window.Jupiter` object, passing in a configuration object:

```javascript
window.Jupiter.init({
  endpoint: 'https://api.mainnet-beta.solana.com',
  // other configuration options...
});
```

## Configuration Options

### Swap Form Configuration

Configure the behavior and allowed actions for the user in the swap form using the `formProps` option:

```javascript
window.Jupiter.init({
  // ...
  formProps: {
    swapMode: 'ExactIn',
    initialAmount: '1',
    fixedAmount: false,
    initialInputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    fixedInputMint: false,
    initialOutputMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    fixedOutputMint: false,
    initialSlippageBps: 50,
  },
});
```

- `swapMode`: Specify the swap mode, either 'ExactIn' (default) or 'ExactOut'.
- `initialAmount`: Set the initial amount to swap.
- `fixedAmount`: Disable user input for the swap amount.
- `initialInputMint`: Set the initial input token mint address.
- `fixedInputMint`: Disable user input for the input token.
- `initialOutputMint`: Set the initial output token mint address.
- `fixedOutputMint`: Disable user input for the output token.
- `initialSlippageBps`: Set the initial slippage tolerance in basis points.

### Wallet Configuration

Configure wallet-related options:

```javascript
window.Jupiter.init({
  // ...
  autoConnect: true,
  enableWalletPassthrough: true,
  // ...
});
```

- `autoConnect`: Automatically connect to the user's wallet on subsequent visits.
- `enableWalletPassthrough`: Enable wallet connections to be handled by your dApp.

### Fee Configuration

Jupiter Terminal supports platform fees for token swaps, similar to Jupiter. While there are no protocol fees on Jupiter, integrators can introduce a platform fee on swaps. The platform fee is provided in basis points, e.g., 20 bps for 0.2% of the token output.

To set up platform fees:

1. Go to the [referral dashboard](https://referral.jup.ag/dashboard) to create your referral account and obtain your `Referral Key`.

2. Configure the platform fee and referral account when initializing Jupiter Terminal:

```javascript
const PLATFORM_FEE_AND_ACCOUNTS = {
  referralAccount: 'YOUR_REFERRAL_ACCOUNT_PUBLIC_KEY',
  feeBps: 20,
};

window.Jupiter.init({
  // ...
  platformFeeAndAccounts: PLATFORM_FEE_AND_ACCOUNTS,
  // ...
});
```

- `referralAccount`: Your referral account public key obtained from the referral dashboard.
- `feeBps`: The platform fee in basis points (e.g., 20 for 0.2% of the token output).

Make sure to replace `'YOUR_REFERRAL_ACCOUNT_PUBLIC_KEY'` with your actual referral account public key.

Note: The fee token account should be the same mint as your output mint on the swap for ExactIn. For ExactOut, the fee is taken as the same mint as the input mint. Ensure that the fee token account has been created, which can be done on the referral dashboard.

For more advanced usage and detailed examples, refer to the [Adding Your Own Fee To Jupiter Swap](https://docs.jup.ag/docs/apis/adding-fees) documentation.

Based on the previous pastes, I can provide the possible parameters for the display configuration. Here's the updated "Display Configuration" section with all the available options:

### Display Configuration

Configure the display mode and style of Jupiter Terminal using the following options:

```javascript
window.Jupiter.init({
  // ...
  displayMode: 'modal',
  integratedTargetId: 'jupiter-terminal-container',
  widgetStyle: {
    position: 'bottom-right',
    size: 'default',
  },
  containerStyles: {
    backgroundColor: '#f0f0f0',
    padding: '16px',
    zIndex: 100,
    maxHeight: '90vh',
  },
  containerClassName: 'my-custom-class max-h-[90vh] lg:max-h-[600px]',
  // ...
});
```

- `displayMode` (optional): The display mode of Jupiter Terminal. Supported values are:
  - `'modal'`: Display Jupiter Terminal as a modal overlay.
  - `'integrated'`: Integrate Jupiter Terminal into a specific element on your page.
  - `'widget'`: Display Jupiter Terminal as a floating widget.

- `integratedTargetId` (optional): The ID of the HTML element to render the integrated widget into when `displayMode` is set to `'integrated'`.

- `widgetStyle` (optional): An object specifying the behavior and style of the widget when `displayMode` is set to `'widget'`. It has the following properties:
  - `position` (optional): The position of the widget. Supported values are `'bottom-left'`, `'bottom-right'`, `'top-left'`, and `'top-right'`. Defaults to `'bottom-right'`.
  - `size` (optional): The size of the widget. Supported values are `'sm'` and `'default'`. Defaults to `'default'`.

- `containerStyles` (optional): Additional CSS styles to apply to the Jupiter Terminal container. You can use CSS-in-JS syntax to specify styles. Some common styles you might want to customize include:
  - `backgroundColor`: Set the background color of the container.
  - `padding`: Add padding to the container.
  - `zIndex`: Specify the stacking order of the container.
  - `maxHeight`: Set the maximum height of the container.

- `containerClassName` (optional): Additional CSS classes to apply to the Jupiter Terminal container. You can use regular CSS classes or Tailwind CSS classes. For example:
  - `'my-custom-class'`: Apply a custom CSS class.
  - `'max-h-[90vh] lg:max-h-[600px]'`: Set different maximum heights for different screen sizes using Tailwind CSS.

These options provide flexibility in how Jupiter Terminal is displayed and styled within your dApp. You can choose the appropriate display mode based on your requirements and customize the appearance using CSS styles and classes.

### Callback Configuration

Configure callback functions for various events:

```javascript
window.Jupiter.init({
  // ...
  onSwapError: ({ error, quoteResponseMeta }) => {
    console.error('Swap error:', error);
  },
  onSuccess: ({ txid, swapResult, quoteResponseMeta }) => {
    console.log('Swap success! Transaction ID:', txid);
  },
  onFormUpdate: (form) => {
    console.log('Form updated:', form);
  },
  onScreenUpdate: (screen) => {
    console.log('Screen updated:', screen);
  },
  // ...
});
```

- `onSwapError`: Callback function invoked when an error occurs during a swap.
- `onSuccess`: Callback function invoked when a swap is successful.
- `onFormUpdate`: Callback function invoked when there are changes to the swap form.
- `onScreenUpdate`: Callback function invoked when there are changes to the Jupiter Terminal screen.

## Methods

Jupiter Terminal provides the following methods:

- `init(props)`: Initializes Jupiter Terminal with the provided configuration options.
- `resume()`: Resumes Jupiter Terminal after it has been closed.
- `close()`: Closes Jupiter Terminal.
- `syncProps(props)`: Synchronizes the wallet state with Jupiter Terminal when `enableWalletPassthrough` is `true`.

## Properties

Access the following properties of Jupiter Terminal:

- `_instance`: The rendered JSX element of Jupiter Terminal.
- `root`: The root instance of Jupiter Terminal.
- `store`: The internal store used by Jupiter Terminal.

## TypeScript Support

To get proper typing for Jupiter Terminal, create a typing declaration file `jupiter-terminal.d.ts` in your project and copy the contents from [src/types/index.d.ts](https://github.com/jup-ag/terminal/blob/main/src/types/index.d.ts).

## Examples

### Basic Usage

```javascript
window.Jupiter.init({
  endpoint: 'https://api.mainnet-beta.solana.com',
  formProps: {
    swapMode: 'ExactIn',
    initialAmount: '1',
    initialInputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    initialOutputMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  },
});
```

### Custom Styles

```javascript
window.Jupiter.init({
  // ...
  containerStyles: {
    backgroundColor: '#f0f0f0',
    padding: '16px',
  },
  containerClassName: 'my-custom-class',
});
```

### Handling Callbacks

```javascript
window.Jupiter.init({
  // ...
  onSwapError: ({ error, quoteResponseMeta }) => {
    console.error('Swap error:', error);
  },
  onSuccess: ({ txid, swapResult, quoteResponseMeta }) => {
    console.log('Swap success! Transaction ID:', txid);
  },
});
```

## Best Practices

- Handle swap errors gracefully using the `onSwapError` callback.
- Manage the state of Jupiter Terminal properly if using a state management library.
- Follow secure coding practices when handling sensitive information.
- Test your dApp thoroughly with Jupiter Terminal integrated.

## Support

If you have any questions or need assistance, please reach out to the Jupiter support team or consult the official Jupiter documentation.