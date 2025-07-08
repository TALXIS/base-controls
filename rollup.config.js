import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { visualizer } from "rollup-plugin-visualizer";
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import { glob } from 'glob';

const inputs = glob.sync("src/**/index.ts");

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
    'debounce',
    'use-debounce',
    'validator',
    'validator/es/lib/isURL',
    'validator/es/lib/isEmail',
    'lodash',
    'tslib',
    '@ag-grid-community/client-side-row-model',
    "@ag-grid-enterprise/core",
    "@ag-grid-enterprise/row-grouping",
    "@ag-grid-enterprise/server-side-row-model",
    "@ag-grid-enterprise/menu",
    "@ag-grid-enterprise/clipboard",
    '@ag-grid-community/react',
    '@ag-grid-community/core',
    '@ag-grid-community/styles',
    '@ag-grid-community/styles/ag-grid.css',
    '@ag-grid-community/styles/ag-theme-balham.css',
    '@solid-primitives/keyboard'
]

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
            if (externalDeps.includes(id)) {
                return true;
            }
            if(id.startsWith('@talxis')) {
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
                sourceMap: true,
                inlineSources: true,
            }),
            postcss(),
            visualizer(),
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
