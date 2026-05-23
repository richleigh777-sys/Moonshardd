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
        'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(env.GOOGLE_MAPS_PLATFORM_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('lucide-react')) return 'vendor-lucide';
                if (id.includes('@radix-ui')) return 'vendor-radix';
                if (id.includes('recharts')) return 'vendor-charts';
                if (id.includes('framer-motion') || id.includes('motion')) return 'vendor-motion';
                if (id.includes('firebase')) return 'vendor-firebase';
                return 'vendor';
              }
            }
          }
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
