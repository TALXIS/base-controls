import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import { glob } from 'glob';
import path from 'path';

const inputs = glob.sync("src/**/index.ts");

const isBareImport = (id) => {
    if (id.startsWith('\0') || id.startsWith('.') || id.startsWith('/') || path.isAbsolute(id)) {
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
    {
        input: ['dist/index.d.ts'],
        output: [{ file: 'dist/index.d.ts', format: "esm" }],
        external: [/\.css$/],
        plugins: [
            dts(),
        ],
    },
];
