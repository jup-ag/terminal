import { defineConfig } from 'tsup'

export default defineConfig({
  target: 'node16',
  entry: ['src/widget.tsx'],
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
})