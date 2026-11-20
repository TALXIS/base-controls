import { defineConfig } from 'vitest/config';
import baseConfig from './vitest.config.mts';

/** Runs only the tests that call real services. See `npm run test:live`. */
export default defineConfig({
    ...baseConfig,
    test: {
        ...baseConfig.test,
        include: ['src/**/*.live.test.ts'],
        exclude: ['**/node_modules/**']
    }
});
