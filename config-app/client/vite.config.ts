import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    outDir: '../client-dist/',
    emptyOutDir: true,
  },
});
