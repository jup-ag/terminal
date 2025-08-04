## Publishing/Tagging new version
- Bump version
- pnpm i
- pnpm build-widget
- BUNDLE_NAME=plugin-$(node -e "console.log(require('./package.json').version);") && cp ./public/$BUNDLE_NAME.js ./public/plugin-v1.js
- Publish by merging
- Reminder to clear cloudflare cache

## Publishing to NPM
- pnpm tsup
- npm publish --access public

# Scoping Tailwind Preflight CSS
- cp node_modules/tailwindcss/lib/css/preflight.css ./preflight.stylus
- Scope entire file with #jupiter-plugin
- npx stylus ./preflight.stylus -o ./public/scoped-preflight.css
- rm ./preflight.stylus
