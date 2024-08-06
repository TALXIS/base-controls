import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { visualizer } from "rollup-plugin-visualizer";
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
    'dayjs/plugin/utc',
    'dayjs/plugin/customParseFormat',
    'external-svg-loader',
    'fast-deep-equal',
    'fast-deep-equal/es6',
    'humanize-duration',
    'liquidjs',
    'merge-anything',
    'numeral',
    'react',
    'react-dom',
    'react/jsx-runtime',
    'use-debounce',
    'validator',
    'validator/es/lib/isURL',
    'validator/es/lib/isEmail',
    'lodash',
    'tslib',
    '@ag-grid-community/client-side-row-model',
    '@ag-grid-community/react',
    '@ag-grid-community/core',
    '@ag-grid-community/styles',
    '@ag-grid-community/styles/ag-grid.css',
    '@ag-grid-community/styles/ag-theme-balham.css'
]

export default [
    {
        input: [
            'src/**/*.tsx',
            'src/**/*.ts',
            '!src/sandbox/**',
        ],
        output: [
            {
                dir: 'dist',
                format: 'esm',
            }
        ],
        external(id) {
            if (externalDeps.includes(id)) {
                return true;
            }
            if (id.startsWith('@fluentui')) {
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
            }) */,
            //visualizer(),
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
