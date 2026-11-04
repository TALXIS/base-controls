import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin, UserConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const storybookDir = path.dirname(fileURLToPath(import.meta.url));
const githubPagesBasePath = '/base-controls/';
const clientLibrariesDir = fs.realpathSync(path.resolve(storybookDir, '../../node_modules/@talxis/client-libraries'));
const isLocalDevelopment = process.env.NODE_ENV !== 'production';

//the library's own `@name` aliases, read from its tsconfig so the two never drift apart
const libraryPaths: Record<string, string[]> = JSON.parse(fs.readFileSync(path.resolve(storybookDir, '../../tsconfig.json'), 'utf8')).compilerOptions.paths;
const libraryAliases = Object.entries(libraryPaths)
  .filter(([alias]) => alias !== '@/*')
  .map(([alias, [target]]) => alias.endsWith('/*')
    ? { find: new RegExp(`^${alias.slice(0, -2)}/(.*)$`), replacement: path.resolve(storybookDir, '../..', target.slice(0, -2), '$1') }
    : { find: new RegExp(`^${alias}$`), replacement: path.resolve(storybookDir, '../..', target) });

const stories: NonNullable<StorybookConfig['stories']> = ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'];

if (!isLocalDevelopment) {
  stories.splice(0, stories.length, '../src/**/!(*Scratch|*Dev*).stories.@(ts|tsx)', '../src/**/*.mdx');
}

const ISOLATED_FRAME_ENTRY = 'isolated-frame-entry';

//the isolated frame story loads this entry into its frame under a fixed name
const addIsolatedFrameEntry = (config: UserConfig): void => {
  config.build ??= {};
  config.build.rollupOptions ??= {};
  const input = config.build.rollupOptions.input;
  const inputs = typeof input === 'string' ? { main: input } : Array.isArray(input) ? Object.fromEntries(input.map((entry, index) => [`entry${index}`, entry])) : { ...input };
  config.build.rollupOptions.input = { ...inputs, [ISOLATED_FRAME_ENTRY]: path.resolve(storybookDir, '../src/isolated-frame/frameEntry.ts') };
  const output = config.build.rollupOptions.output;
  if (Array.isArray(output)) {
    throw new Error('The isolated frame entry expects a single Rollup output.');
  }
  const entryFileNames = output?.entryFileNames ?? 'assets/[name]-[hash].js';
  config.build.rollupOptions.output = {
    ...output,
    entryFileNames: chunk => chunk.name === ISOLATED_FRAME_ENTRY ? `${ISOLATED_FRAME_ENTRY}.js` : typeof entryFileNames === 'function' ? entryFileNames(chunk) : entryFileNames,
  };
};

//runs after Storybook's plugin sets the build's input
const isolatedFrameEntryPlugin = (): Plugin => ({
  name: 'base-controls:isolated-frame-entry',
  enforce: 'post',
  config: (config, { command }) => {
    if (command === 'build') {
      addIsolatedFrameEntry(config);
    }
  },
});

const config: StorybookConfig = {
  stories,
  staticDirs: ['../public'],
  //the theme toggle in the toolbar switches the stories' theme instead
  features: { backgrounds: false },
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
    defaultName: 'Overview',
  },
  typescript: {
    reactDocgen: false,
  },
  async viteFinal(config) {
    config.base = process.env.STORYBOOK_BASE_PATH ?? githubPagesBasePath;
    config.resolve ??= {};
    config.resolve.alias = [
      ...(Array.isArray(config.resolve.alias) ? config.resolve.alias : []),
      {
        find: /^@talxis\/client-libraries$/,
        replacement: path.join(clientLibrariesDir, 'src/index.ts'),
      },
      {
        find: /^@talxis\/base-controls$/,
        replacement: path.resolve(storybookDir, '../../src/index.ts'),
      },
      {
        find: /^@talxis\/base-controls\/(.*)$/,
        replacement: path.resolve(storybookDir, '../../src/$1'),
      },
      ...libraryAliases,
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(storybookDir, '../../src/$1'),
      },
      {
        find: /^react$/,
        replacement: path.resolve(storybookDir, '../node_modules/react'),
      },
      {
        find: /^react-dom$/,
        replacement: path.resolve(storybookDir, '../node_modules/react-dom'),
      },
      {
        find: '@storybook/react-dom-shim',
        replacement: path.resolve(storybookDir, './react-dom-shim.ts'),
      },
    ];

    config.server ??= {};
    config.server.fs ??= {};
    config.server.fs.allow = [
      ...(config.server.fs.allow ?? []),
      path.resolve(storybookDir, '../..'),
      clientLibrariesDir,
    ];
    // prevents infinite or excessive watch recursion without breaking local source resolution.
    config.server.watch ??= {};
    config.server.watch.followSymlinks = false;
    config.plugins = [...(config.plugins ?? []), isolatedFrameEntryPlugin()];
    return config;
  },
};

export default config;
