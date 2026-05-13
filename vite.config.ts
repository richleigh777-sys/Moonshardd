import path from 'path';
import { defineConfig as defineViteConfig, loadEnv } from 'vite';
import { defineConfig as defineVitestConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineVitestConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const viteConfig = defineViteConfig({
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    });

    return mergeConfig(viteConfig, {
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './test/setup.ts',
        css: true,
      },
    });
});
