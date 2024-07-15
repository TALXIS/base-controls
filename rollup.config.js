import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import multiInput from 'rollup-plugin-multi-input';
import del from 'rollup-plugin-delete';

const externalDeps = [
    '@talxis/react-components',
    '@talxis/client-libraries',
    'color',
    'dayjs',
    'external-svg-loader',
    'fast-deep-equal',
    'humanize-duration',
    'liquidjs',
    'merge-anything',
    'numeral',
    'react',
    'react-dom',
    'react/jsx-runtime',
    'use-debounce',
    'validator',
]

export default [
    {
        input: [
            'src/index.ts'
        ],
        output: [
            {
                dir: 'dist',
                format: 'esm',
            }
        ],
        external(id) {
            if(externalDeps.includes(id)) {
                return true;
            }
            if(id.startsWith('@fluentui')) {
                return true;
            }
            return false;
        },
        plugins: [
            commonjs(),
            resolve(),
            typescript({
                tsconfig: './tsconfig.json',
            }),
            postcss(),
            multiInput(),
/*             terser({
                keep_classnames: true,
            }) */
        ],
    },
    {
        input: ['dist/index.d.ts'],
        output: [{ file: 'dist/index.d.ts', format: "esm" }],
        external: [/\.css$/],
        plugins: [
            dts(),
            del({ hook: "buildEnd", targets: ['dist/stories', 'dist/sandbox'] })
        ],
    },
];
