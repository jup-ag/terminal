# Jupiter Embed

Jupiter Embed is an open-sourced, lite version of Jupiter that provides end-to-end swap flow by linking it in your HTML.

---

## Jupiter Embed allow two mode of operation,

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

If your user is not connected, Jupiter Embed have several built-in wallets that user can connect and perform swap directly.

---

Getting started

## Integrating the widget

In your document, link embed's `main.js` and `main.css`.

```tsx
<head>
  <script src={`https://jupiter-easy-modal.vercel.app/main.js`}></script>
  <link rel="stylesheet" href={`https://jupiter-easy-modal.vercel.app/main.css`} />
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


## Hide / Close

\*Note: To reduce RPC usage incurred on startup, whenever `close()` is called, the rendered instance will be added with a `hidden` class, and subsequent `init()` call will remove the `hidden` class.

```tsx
window.Jupiter.close();
```

## Customising styles

- Custom zIndex

```tsx
window.Jupiter.init({
  // ...
  containerStyles: { zIndex: 100 },
});
```

---

## Known issue

- Wallet passthrough supports does not work for Solflare
  - Jupiter Embed currently prompts the user to connect their Solflare wallet again, to perform swap.
