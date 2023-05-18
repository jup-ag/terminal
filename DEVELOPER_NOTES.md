# Developer Notes

To develop, `pnpm i && pnpm dev`
To build, `pnpm build-widget`

There's a few point of entry for Terminal, and each has specific reasons:

- https://github.com/jup-ag/terminal/blob/main/src/index.tsx (RenderJupiter)
  - this houses all app-related contexts including wallets, accounts, screens, jupiter hooks
- https://github.com/jup-ag/terminal/blob/main/src/pages/_app.tsx (NextJS)
  - this is our Terminal homepage, and preview link
  - it's also the Playground for templates, toggles, and Codeblocks generation
- https://github.com/jup-ag/terminal/blob/main/src/components/Jupiter.tsx (JupiterApp)
  - this is the actual Jupiter app
- https://github.com/jup-ag/terminal/blob/main/src/library.tsx (Injection script)
  - this is how we inject Jupiter, and pass props into Jupiter App

Why the separation?

- the webpack is configured specifically to only build JupiterApp and Injection Script for bundle size reasons
- the separation also allow us to develop/test the app like how an integrator would integrate us
- components can be used in NextJS preview, and also in JupiterApp
  if you want to add more features, for e.g bringing feature from jup.ag to Terminal, I suggest you start from JupiterApp
  if you want to add customisability, you need to check Injection script
  if you want to showcase more feature, edit NextJS
