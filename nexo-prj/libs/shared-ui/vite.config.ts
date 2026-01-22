/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'shared-ui',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: (id: string) => {
        // Externalize EVERYTHING except local files
        return !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0');
      },
      output: {
        preserveModules: true,  // Keep module structure instead of bundling
        preserveModulesRoot: 'src',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    minify: false,
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});