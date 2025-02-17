## Publishing/Tagging new version
- Bump version
- pnpm i
- pnpm build-widget
- BUNDLE_NAME=main-$(node -e "console.log(require('./package.json').version);") && cp ./public/$BUNDLE_NAME.js ./public/main-v4.js
- Publish by merging

## Publishing to NPM
- pnpm tsup
- npm publish --access public

# Scoping Tailwind Preflight CSS
- cp node_modules/tailwindcss/lib/css/preflight.css ./preflight.stylus
- Scope entire file with #jupiter-terminal
- npx stylus ./preflight.stylus -o ./public/scoped-preflight.css
- rm ./preflight.stylus
