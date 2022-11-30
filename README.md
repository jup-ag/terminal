# Jupiter Terminal

Jupiter Terminal is an open-sourced, lite version of Jupiter that provides end-to-end swap flow by linking it in your HTML.

---

## Jupiter Terminal allow two mode of operation,

## Mode 1: Wallet passthrough

If your user have connected their wallet via your dApp, you may passthrough the wallet instance via the `init({ passThroughWallet: wallet })`.

```jsx
const App = () => {
  const { wallet } = useWallet();

  const initJupiter = () => {
    if (wallet) {
      window.Jupiter.init({
        mode: 'default',
        endpoint,
        passThroughWallet: wallet,
      });
    }
  };
};
```

## Mode 2: Built-in wallet

If your user is not connected, Jupiter Terminal have several built-in wallets that user can connect and perform swap directly.

---

Getting started

## Integrating the widget

In your document, link embed's `main.js` and `main.css`.

```tsx
<head>
  <script src={`https://jupiter-terminal.vercel.app/main.js`}></script>
  <link rel="stylesheet" href={`https://jupiter-terminal.vercel.app/main.css`} />
</head>
```

## Init / Show the widget

```tsx
const App = () => {
  const { wallet } = useWallet();

  const initJupiter = () => {
    if (wallet) {
      // We do not recommend using a public RPC due to 429 rate limits.
      window.Jupiter.init({
        mode: 'default',
        endpoint: "https://api.mainnet-beta.solana.com",
        passThroughWallet: wallet,
      });
    }
  };

  const initJupiterWithoutWallet = () => {
    window.Jupiter.init({ 
      mode: 'default',
      endpoint: "https://api.mainnet-beta.solana.com"
    });
  };

  return (
    <div>
      <button type="button" onClick={initJupiter}>
        Open Jupiter with In-App
      </button>
      <button type="button" onClick={initJupiterWithoutWallet}>
        Open Jupiter with Built-in
      </button>
    </div>
  );
};
```

## Mode
- `default`: Default mode, user can swap between any token pair.
- `outputOnly`: Output only mode, user can only swap to destination pair.
```ts
  window.Jupiter.init({
    mode: 'outputOnly',
    mint: 'So11111111111111111111111111111111111111112',
    endpoint: "https://api.mainnet-beta.solana.com",
    passThroughWallet: wallet,
  });
```


## Resuming / Closing activity
- Everytime `init()` is called, it will create a new activity. 

- If you want to resume the previous activity, you can use `resume()`.

- `close()` function only hide the widget.

```tsx
if (window.Jupiter._instance) {
  window.Jupiter.resume();
}

window.Jupiter.close();
```

## onSuccess/onSwapError callback
`onSuccess()` reference can be provided, and will be called when swap is successful.

While `onSwapError()` will be called when an error has occurred.

```tsx
window.Jupiter.init({
  onSuccess: ({ txid }) => {
    console.log('onSuccess', txid);
  }
  onSwapError: ({ error }) => {
    console.log('onSwapError', error);
  },
});
```

## Customising styles: CSSProperties
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
  containerStyles: { maxHeight: '90vh', },
});
```

## Customising className: Tailwind className
Tailwind classes can be injected to the outer-most container via containerClassName api.

Example:
- Custom breakpoints

```tsx
window.Jupiter.init({
  // ...
  containerClassName: 'max-h-[90vh] lg:max-h-[600px]'
});
```

---

## Known issue

- Wallet passthrough supports does not work for Solflare
  - Jupiter Terminal currently prompts the user to connect their Solflare wallet again, to perform swap.
