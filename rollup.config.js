import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import multiInput from 'rollup-plugin-multi-input';
import del from 'rollup-plugin-delete';

export default [
    {
        input: [
            'src/components/*/*.tsx',
            'src/hooks/*.ts'
        ],
        output: [
            {
                dir: 'dist',
                format: 'esm',
            }
        ],
        plugins: [
            commonjs(),
            peerDepsExternal('./package.json'),
            resolve(),
            typescript({
                tsconfig: './tsconfig.json',
            }),
            postcss(),
            multiInput(),
            terser()
        ],
    },
    {
        input: ['dist/index.d.ts'],
        output: [{ file: 'dist/index.d.ts', format: "esm"}],
        external: [/\.css$/],
        plugins: [
            dts(),
            del({ hook: "buildEnd", targets: ['dist/stories', 'dist/sandbox'] })
        ],
    },
];
