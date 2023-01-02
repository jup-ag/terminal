## Publishing/Tagging new version
- pnpm i
- Bump version
- pnpm build-widget
- BUNDLE_NAME=main-$(node -e "console.log(require('./package.json').version);") && cp ./public/$BUNDLE_NAME.js ./public/main.js
- Publish