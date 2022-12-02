## Publishing/Tagging new version
- pnpm i
- Bump version
- BUNDLE_NAME=main-$(node -e "console.log(require('./package.json').version);") pnpm build-widget
- BUNDLE_NAME=main-$(node -e "console.log(require('./package.json').version);") && cp ./public/$BUNDLE_NAME.js ./public/main.js && cp ./public/$BUNDLE_NAME.css ./public/main.css
- pnpm update
- Publish