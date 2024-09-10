import { defineConfig, Options } from 'tsup';
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';

const watchMode = process.argv.includes('--watch');

const config: Options = {
  entry: {
    index: './src/npmlibary.tsx',
  },
  sourcemap: true,
  external: ['react', 'react-dom', '@solana/web3.js'],
  format: ['cjs'],
  target: 'es6',
  cjsInterop: true,
  tsconfig: './tsconfig.npm.json',
  esbuildPlugins: [
    nodeModulesPolyfillPlugin({
      modules: {
        fs: 'empty',
      },
    }),
  ],
};

const buildConfig: Options = {
  clean: true, // Clean the output directory before building
  outDir: './dist',
  dts: true,
};

const startConfig: Options = {
  clean: false, // Do not clean the output directory, so compiler can reuse previous entry points
  outDir: './dist',
  dts: true,
};

export default defineConfig({
  ...config,
  ...(watchMode ? startConfig : buildConfig),
});
