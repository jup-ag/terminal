## Publishing/Tagging new version
- Bump version
- pnpm i
- pnpm build-widget
- BUNDLE_NAME=main-$(node -e "console.log(require('./package.json').version);") && cp ./public/$BUNDLE_NAME.js ./public/main-v3.js
- Publish
