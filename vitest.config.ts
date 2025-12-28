import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', '.nuxt', 'dist', 'e2e'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './app'),
      '@': resolve(__dirname, './app'),
    },
  },
})
