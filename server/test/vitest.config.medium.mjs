import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig({
  test: {
    name: 'server:medium',
    root: serverRoot,
    globals: true,
    include: ['test/medium/**/*.spec.ts'],
    globalSetup: ['test/medium/globalSetup.ts'],
    server: {
      deps: {
        fallbackCJS: true,
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
});
