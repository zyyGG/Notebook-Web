import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/games/components/__tests__/setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
