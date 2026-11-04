import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import { glob } from 'glob';
import path from 'path';
import { readAliases } from './scripts/aliases.mjs';

const inputs = glob.sync("src/**/index.ts");
const srcRoot = path.resolve('src');
const aliases = readAliases();
const internalAliases = aliases.map(([aliasName]) => aliasName);

const isBareImport = (id) => {
    if (id.startsWith('\0') || id.startsWith('.') || id.startsWith('/') || path.isAbsolute(id)) {
        return false;
    }

    if (id.startsWith('@/') || internalAliases.some((aliasName) => id === aliasName || id.startsWith(`${aliasName}/`))) {
        return false;
    }

    return !id.startsWith('src/');
};

export default [
    {
        input: inputs,
        output: [
            {
                dir: 'dist',
                format: 'esm',
                preserveModules: true,
                sourcemap: true
            }
        ],
        external(id) {
            return isBareImport(id);
        },
        plugins: [
            del({ hook: "buildStart", targets: ['dist/*'] }),
            alias({
                entries: [
                    ...aliases.map(([aliasName, folder]) => ({ find: aliasName, replacement: path.resolve(folder) })),
                    { find: /^@\//, replacement: `${srcRoot}/` },
                ],
            }),
            commonjs(),
            resolve(),
            typescript({
                tsconfig: './tsconfig.json',
                sourceMap: true,
                inlineSources: true,
            }),
            postcss(),
        ],
    },
];
