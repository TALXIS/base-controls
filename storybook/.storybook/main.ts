import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-webpack5',
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  webpackFinal: async (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@talxis/base-controls': path.resolve(__dirname, '../../src'),
      '@components': path.resolve(__dirname, '../../src/components'),
      '@hooks': path.resolve(__dirname, '../../src/hooks'),
      '@interfaces': path.resolve(__dirname, '../../src/interfaces'),
      '@legacy': path.resolve(__dirname, '../../src/legacy/react-components'),
      '@utils': path.resolve(__dirname, '../../src/utils'),
      '@': path.resolve(__dirname, '../../src'),
      react: path.resolve(__dirname, '../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
    };
    config.resolve.extensions = [...(config.resolve.extensions ?? []), '.ts', '.tsx'];

    return config;
  },
};

export default config;
