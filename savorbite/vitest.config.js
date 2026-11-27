import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Test config extends the app config with the happy-dom environment and the
// same @ -> /src alias the app uses.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': '/src' },
  },
  test: {
    environment: 'happy-dom',
    include: ['scripts/**/*.test.js'],
    testTimeout: 30000,
  },
})
