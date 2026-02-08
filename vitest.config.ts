import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      mermaid: path.resolve(__dirname, '__mocks__/mermaid.ts'),
      flexsearch: path.resolve(__dirname, '__mocks__/flexsearch.ts'),
    },
  },
});
