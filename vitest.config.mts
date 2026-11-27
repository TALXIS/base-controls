import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const src = (relativePath: string) => path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src', relativePath);

export default defineConfig({
    resolve: {
        //the `tsconfig.json` path aliases, in the shape Vite's resolver wants
        alias: [
            { find: /^@components$/, replacement: src('components/index.ts') },
            { find: /^@components\/(.*)$/, replacement: src('components/$1') },
            { find: /^@hooks$/, replacement: src('hooks/index.ts') },
            { find: /^@hooks\/(.*)$/, replacement: src('hooks/$1') },
            { find: /^@interfaces$/, replacement: src('interfaces/index.ts') },
            { find: /^@interfaces\/(.*)$/, replacement: src('interfaces/$1') },
            { find: /^@legacy$/, replacement: src('legacy/react-components/index.ts') },
            { find: /^@legacy\/(.*)$/, replacement: src('legacy/react-components/$1') },
            { find: /^@utils$/, replacement: src('utils/index.ts') },
            { find: /^@utils\/(.*)$/, replacement: src('utils/$1') },
            { find: /^@\/(.*)$/, replacement: src('$1') }
        ]
    },
    test: {
        environment: 'jsdom',
        //matches the `vitest/globals` entry in tsconfig.test.json - drop both together to go explicit
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        //only src is behind the tsc gate in `npm test`; storybook-side tests need their own tsconfig first
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        //the live suite spends api quota, so it needs asking for by name
        exclude: ['**/node_modules/**', 'src/**/*.live.test.ts'],
        restoreMocks: true,
        server: {
            deps: {
                //ESM packages importing `react/jsx-runtime` bare: React 17 has no exports map, so Node's own
                //resolver rejects the extensionless subpath - Vite's does not, so these go through Vite
                inline: [/@griffel\//, /@fluentui\//]
            }
        }
    }
});
