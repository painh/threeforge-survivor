import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@threeforge': resolve(__dirname, 'lib/threeforge/src'),
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
});
